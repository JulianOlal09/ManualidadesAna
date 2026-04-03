import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  endpoint: process.env.BUCKET_ENDPOINT,
  region: process.env.BUCKET_REGION || 'auto',
  credentials: {
    accessKeyId: process.env.BUCKET_ACCESS_KEY || '',
    secretAccessKey: process.env.BUCKET_SECRET_KEY || '',
  },
  forcePathStyle: true,
});

const BUCKET_NAME = process.env.BUCKET_NAME || 'manualidades-ana';

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

  return `${process.env.BUCKET_ENDPOINT}/${BUCKET_NAME}/${key}`;
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
  return `${process.env.BUCKET_ENDPOINT}/${BUCKET_NAME}/${key}`;
}