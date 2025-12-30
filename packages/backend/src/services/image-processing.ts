/**
 * Image processing utilities using Sharp
 */

import sharp from 'sharp';
import { logger } from '../config/logger.js';

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

const DEFAULT_OPTIONS: Required<ImageProcessingOptions> = {
  maxWidth: 2048,
  maxHeight: 2048,
  quality: 85,
  format: 'jpeg',
};

/**
 * Process image: resize, compress, strip EXIF, fix orientation
 */
export async function processImage(
  inputBuffer: Buffer,
  options: ImageProcessingOptions = {}
): Promise<Buffer> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    let pipeline = sharp(inputBuffer);

    // Fix orientation (auto-rotate based on EXIF)
    pipeline = pipeline.rotate();

    // Resize if needed (maintains aspect ratio)
    pipeline = pipeline.resize(opts.maxWidth, opts.maxHeight, {
      fit: 'inside',
      withoutEnlargement: true,
    });

    // Strip EXIF and other metadata
    pipeline = pipeline.withMetadata({
      exif: {},
      iptc: {},
      xmp: {},
      tiff: {},
    });

    // Convert and compress based on format
    if (opts.format === 'jpeg') {
      pipeline = pipeline.jpeg({ quality: opts.quality, mozjpeg: true });
    } else if (opts.format === 'png') {
      pipeline = pipeline.png({ quality: opts.quality, compressionLevel: 9 });
    } else if (opts.format === 'webp') {
      pipeline = pipeline.webp({ quality: opts.quality });
    }

    const processedBuffer = await pipeline.toBuffer();

    logger.debug(
      {
        originalSize: inputBuffer.length,
        processedSize: processedBuffer.length,
        compressionRatio: (
          (1 - processedBuffer.length / inputBuffer.length) *
          100
        ).toFixed(2),
      },
      'Image processed'
    );

    return processedBuffer;
  } catch (error) {
    logger.error({ error }, 'Image processing failed');
    throw new Error(`Image processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Generate thumbnail from image
 */
export async function generateThumbnail(
  inputBuffer: Buffer,
  size: number = 300
): Promise<Buffer> {
  try {
    const thumbnail = await sharp(inputBuffer)
      .rotate() // Fix orientation
      .resize(size, size, {
        fit: 'cover',
        position: 'center',
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    logger.debug(
      {
        thumbnailSize: thumbnail.length,
        dimensions: size,
      },
      'Thumbnail generated'
    );

    return thumbnail;
  } catch (error) {
    logger.error({ error }, 'Thumbnail generation failed');
    throw new Error(`Thumbnail generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get image metadata
 */
export async function getImageMetadata(
  inputBuffer: Buffer
): Promise<sharp.Metadata> {
  try {
    const metadata = await sharp(inputBuffer).metadata();
    return metadata;
  } catch (error) {
    logger.error({ error }, 'Failed to get image metadata');
    throw new Error(`Failed to get image metadata: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Validate image file
 */
export function validateImageFile(
  mimetype: string,
  size: number,
  maxSizeBytes: number = 10 * 1024 * 1024 // 10MB default
): void {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!allowedTypes.includes(mimetype)) {
    throw new Error(
      `Invalid image type: ${mimetype}. Allowed types: ${allowedTypes.join(', ')}`
    );
  }

  if (size > maxSizeBytes) {
    throw new Error(
      `Image too large: ${(size / 1024 / 1024).toFixed(2)}MB. Maximum size: ${(maxSizeBytes / 1024 / 1024).toFixed(2)}MB`
    );
  }
}

