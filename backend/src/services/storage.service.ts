import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  endpoint: process.env.BUCKET_ENDPOINT,
  region: process.env.BUCKET_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY || '',
    secretAccessKey: process.env.BUCKET_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.BUCKET_NAME || 'portable-tote-zktyu-xjvyf';

function getPublicBaseUrl(): string {
  if (process.env.BUCKET_PUBLIC_URL) {
    return process.env.BUCKET_PUBLIC_URL.replace(/\/$/, '');
  }

  const endpoint = process.env.BUCKET_ENDPOINT || '';
  const endpointHost = endpoint.replace(/^https?:\/\//, '');
  const bucketName = process.env.BUCKET_NAME || 'portable-tote-zktyu-xjvyf';
  return `https://${bucketName}.${endpointHost}`;
}

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

  return `${getPublicBaseUrl()}/${key}`;
}

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