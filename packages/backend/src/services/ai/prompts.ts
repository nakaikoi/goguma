/**
 * AI Prompt templates for eBay listing generation
 */

export const SYSTEM_PROMPT = `You are an expert eBay seller assistant. Your job is to analyze product photos and generate high-quality eBay listing information.

Guidelines:
- Write compelling, keyword-rich titles (50-80 characters)
- Create detailed descriptions with bullet points highlighting key features
- Extract accurate item specifics (brand, model, size, color, material, style)
- Assess condition honestly based on visible wear/flaws
- Suggest realistic pricing based on item condition and market value
- Use eBay seller best practices for descriptions

Output ONLY valid JSON matching the required schema. Do not include any markdown formatting, code blocks, or explanatory text.`;

export function createAnalysisPrompt(imageUrls: string[]): string {
  return `Analyze these product images and generate a complete eBay listing draft.

Images: ${imageUrls.length} photo(s) provided

Requirements:
1. Title: Compelling, keyword-rich, 50-80 characters, eBay optimized
2. Description: Detailed, professional, with bullet points. Highlight:
   - Key features and specifications
   - Condition details
   - Any visible flaws or wear
   - What's included
   - Shipping considerations
3. Item Specifics: Extract all relevant details:
   - Brand (if visible)
   - Model/Part Number (if visible)
   - Size/Dimensions (if applicable)
   - Color
   - Material
   - Style/Type
   - Any other identifying information
4. Condition: Choose the most accurate:
   - "New" - Unused, original packaging
   - "New (other)" - New with minor issues
   - "New with tags" - New with original tags
   - "New without tags" - New but tags removed
   - "Pre-owned" - Used but excellent condition
   - "Used" - Used with normal wear
   - "For parts or not working" - Non-functional
   - "Seller refurbished" - Restored by seller
   - "Manufacturer refurbished" - Restored by manufacturer
5. Visible Flaws: List any scratches, dents, wear, missing parts, etc.
6. Pricing: Suggest a realistic price range based on:
   - Item condition
   - Comparable listings
   - Market value
   - Include confidence level (0-1)
7. Keywords: Extract 5-10 relevant search keywords
8. Category: Suggest eBay category ID if possible

Be thorough and accurate. If you cannot determine something from the images, indicate that in the output.`;
}

export const JSON_SCHEMA_INSTRUCTIONS = `
Output format (JSON only, no markdown):
{
  "title": "string (50-80 chars)",
  "description": "string (detailed, 200+ chars)",
  "condition": "one of: New, New (other), New with tags, New without tags, Pre-owned, Used, For parts or not working, Seller refurbished, Manufacturer refurbished",
  "itemSpecifics": {
    "brand": "string or null",
    "model": "string or null",
    "size": "string or null",
    "color": "string or null",
    "material": "string or null",
    "style": "string or null"
  },
  "pricing": {
    "min": number,
    "max": number,
    "suggested": number,
    "confidence": number (0-1),
    "currency": "USD",
    "reasoning": "string (optional)"
  },
  "keywords": ["string", "string", ...],
  "categoryId": "string or null",
  "visibleFlaws": ["string", ...],
  "aiConfidence": number (0-1)
}`;

