import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL,
  region: process.env.AWS_DEFAULT_REGION || 'iad',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: false,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'preserved-case-qalc4pnf1z';

/**
 * Extract the S3 key from either a full URL or a key
 * Handles legacy full URLs (https://bucket.domain/products/uuid.ext) and new keys (products/uuid.ext)
 */
export function extractKey(urlOrKey: string): string {
  if (!urlOrKey) return '';
  
  // If it starts with http, extract the key from the URL
  if (urlOrKey.startsWith('http')) {
    // Handle both path-style and virtual-hosted-style URLs
    const match = urlOrKey.match(/\/products\/[^/]+\.[^/]+$/);
    if (match) {
      return match[0].substring(1); // Remove leading slash
    }
    return '';
  }
  
  // Already a key
  return urlOrKey;
}

/**
 * Upload image to S3 and return the key (not the full URL)
 */
export async function uploadImage(file: Buffer, originalFilename: string): Promise<string> {
  const ext = originalFilename.split('.').pop() || 'jpg';
  const key = `products/${uuidv4()}.${ext}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: `image/${ext === 'png' ? 'png' : 'jpeg'}`,
    })
  );

  return key; // Return only the key, not the full URL
}

/**
 * Generate a signed URL for an S3 object with 1 hour expiration
 */
export async function getSignedImageUrl(urlOrKey: string): Promise<string> {
  const key = extractKey(urlOrKey);
  if (!key) return '';

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    return signedUrl;
  } catch (error) {
    console.error('Failed to generate signed URL for key:', key, error);
    return '';
  }
}

/**
 * Delete an image from S3
 * @param urlOrKey - Either a full URL or just the S3 key
 */
export async function deleteImage(urlOrKey: string): Promise<void> {
  const key = extractKey(urlOrKey);
  if (!key) return;

  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      })
    );
  } catch (error) {
    console.error('Failed to delete image:', key, error);
  }
}