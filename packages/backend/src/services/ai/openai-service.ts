/**
 * OpenAI service for AI-powered listing generation
 */

import OpenAI from 'openai';
import { ZodError } from 'zod';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';
import {
  ListingDraftSchema,
  type ListingDraft,
} from '@goguma/shared';
import { SYSTEM_PROMPT, createAnalysisPrompt, JSON_SCHEMA_INSTRUCTIONS } from './prompts.js';
import { getImageUrl } from '../storage.js';

let openaiClient: OpenAI | null = null;

/**
 * Initialize OpenAI client
 */
function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    openaiClient = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }
  return openaiClient;
}

/**
 * Convert storage paths to image URLs for AI analysis
 */
async function getImageUrlsForAnalysis(
  storagePaths: string[]
): Promise<string[]> {
  const urls = await Promise.all(
    storagePaths.map((path) => getImageUrl(path))
  );
  return urls;
}

/**
 * Analyze item images and generate listing draft
 */
export async function analyzeItemImages(
  storagePaths: string[],
  itemId: string
): Promise<ListingDraft> {
  const client = getOpenAIClient();

  try {
    // Get signed URLs for images
    const imageUrls = await getImageUrlsForAnalysis(storagePaths);

    if (imageUrls.length === 0) {
      throw new Error('No images provided for analysis');
    }

    logger.info(
      { itemId, imageCount: imageUrls.length },
      'Starting AI analysis'
    );

    // Prepare messages
    const userPrompt = createAnalysisPrompt(imageUrls);
    const fullPrompt = `${userPrompt}\n\n${JSON_SCHEMA_INSTRUCTIONS}`;

    // Call OpenAI API
    const response = await client.chat.completions.create({
      model: 'gpt-4o', // GPT-4 with vision support
      messages: [
        {
          role: 'system',
          content: SYSTEM_PROMPT,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: fullPrompt,
            },
            // Add images
            ...imageUrls.map((url) => ({
              type: 'image_url',
              image_url: { url },
            })),
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No response from OpenAI');
    }

    // Parse JSON response
    let parsedContent: any;
    try {
      parsedContent = JSON.parse(content);
    } catch (error) {
      logger.error({ error, content }, 'Failed to parse AI response');
      throw new Error('Invalid JSON response from AI');
    }

    // Clean up itemSpecifics: remove null values (keep undefined for optional fields)
    const cleanItemSpecifics = parsedContent.itemSpecifics || {};
    const cleanedItemSpecifics = Object.fromEntries(
      Object.entries(cleanItemSpecifics).filter(([_, value]) => value !== null)
    );

    // Transform to match our schema
    const draftData = {
      title: parsedContent.title || '',
      description: parsedContent.description || '',
      condition: parsedContent.condition || 'Used',
      itemSpecifics: cleanedItemSpecifics, // Use cleaned version (nulls removed)
      pricing: {
        min: parsedContent.pricing?.min || 0,
        max: parsedContent.pricing?.max || 0,
        suggested: parsedContent.pricing?.suggested || 0,
        confidence: parsedContent.pricing?.confidence || 0.5,
        currency: parsedContent.pricing?.currency || 'USD',
        reasoning: parsedContent.pricing?.reasoning,
      },
      categoryId: parsedContent.categoryId || null,
      keywords: parsedContent.keywords || [],
      visibleFlaws: parsedContent.visibleFlaws || [],
      aiConfidence: parsedContent.aiConfidence || 0.5,
    };

    // Validate against Zod schema
    let validated: ListingDraft;
    try {
      validated = ListingDraftSchema.parse(draftData);
    } catch (validationError) {
      if (validationError instanceof ZodError) {
        logger.error(
          {
            itemId,
            validationErrors: validationError.errors,
            draftData,
          },
          'Schema validation failed'
        );
        throw new Error(
          `AI response validation failed: ${JSON.stringify(validationError.errors, null, 2)}`
        );
      }
      throw validationError;
    }

    logger.info(
      {
        itemId,
        title: validated.title,
        confidence: validated.aiConfidence,
      },
      'AI analysis completed successfully'
    );

    return validated;
  } catch (error) {
    logger.error({ error, itemId, storagePaths }, 'AI analysis failed');
    
    if (error instanceof Error) {
      throw new Error(`AI analysis failed: ${error.message}`);
    }
    throw error;
  }
}

/**
 * Retry AI analysis with exponential backoff
 */
export async function analyzeItemImagesWithRetry(
  storagePaths: string[],
  itemId: string,
  maxRetries: number = 3
): Promise<ListingDraft> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await analyzeItemImages(storagePaths, itemId);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000; // Exponential backoff
        logger.warn(
          { attempt, maxRetries, delay, error: lastError.message },
          'AI analysis failed, retrying'
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('AI analysis failed after retries');
}

