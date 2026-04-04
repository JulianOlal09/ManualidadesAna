import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  endpoint: process.env.AWS_ENDPOINT || process.env.BUCKET_ENDPOINT,
  region: process.env.AWS_REGION || process.env.BUCKET_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || process.env.BUCKET_ACCESS_KEY || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || process.env.BUCKET_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || process.env.BUCKET_NAME || 'portable-tote-zktyu-xjvyf';

// Derive the public base URL for serving stored objects.
// Priority:
//   1. BUCKET_PUBLIC_URL  — explicit override (e.g. a custom CDN domain)
//   2. Constructed from BUCKET_ENDPOINT host using the Railway/Tigris public
//      URL pattern: https://{bucket}.{endpoint-host}
//      e.g. BUCKET_ENDPOINT=https://t3.storageapi.dev
//           → https://manualidades-ana.t3.storageapi.dev
function getPublicBaseUrl(): string {
  if (process.env.BUCKET_PUBLIC_URL) {
    return process.env.BUCKET_PUBLIC_URL.replace(/\/$/, '');
  }

  const endpoint = process.env.AWS_ENDPOINT || process.env.BUCKET_ENDPOINT || '';
  const endpointHost = endpoint.replace(/^https?:\/\//, '');
  const bucketName = process.env.AWS_BUCKET_NAME || process.env.BUCKET_NAME || 'portable-tote-zktyu-xjvyf';
  return `https://${bucketName}.${endpointHost}`;
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

  return `${getPublicBaseUrl()}/${key}`;
}

export async function deleteImage(imageUrl: string): Promise<void> {
  if (!imageUrl || !imageUrl.includes(BUCKET_NAME)) return;

  const key = imageUrl.split(`${BUCKET_NAME}/`)[1];
  if (!key) return;

  await s3Client.send(
    new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    })
  );
}

export function getImageUrl(key: string): string {
  return `${getPublicBaseUrl()}/${key}`;
}