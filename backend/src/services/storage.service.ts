import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

const s3Client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT_URL,
  region: process.env.AWS_DEFAULT_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: false,
});

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'manualidades-ana-fotos';
const R2_PUBLIC_URL = 'https://pub-404039448812485dbc9edd916a675832.r2.dev';

export function extractKey(urlOrKey: string): string {
  if (!urlOrKey) return '';
  
  if (urlOrKey.startsWith('http')) {
    const match = urlOrKey.match(/\/products\/[^/]+\.[^/]+$/);
    if (match) {
      return match[0].substring(1);
    }
    return '';
  }
  
  return urlOrKey;
}

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

  return `${R2_PUBLIC_URL}/${key}`;
}

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
    logger.error('Failed to delete image', error, { key });
  }
}