import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
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

function getPublicBaseUrl(): string {
  if (process.env.BUCKET_PUBLIC_URL) {
    return process.env.BUCKET_PUBLIC_URL.replace(/\/$/, '');
  }

  const endpoint = process.env.AWS_ENDPOINT_URL || '';
  const endpointHost = endpoint.replace(/^https?:\/\//, '');
  return `https://${BUCKET_NAME}.${endpointHost}`;
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