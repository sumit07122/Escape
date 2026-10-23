import 'server-only';

import {
  CreateBucketCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';

const GALLERY_BUCKET = process.env.SUPABASE_S3_BUCKET || 'expedition-gallery';

function getStorageClient() {
  const endpoint = process.env.SUPABASE_S3_ENDPOINT;
  const region = process.env.SUPABASE_S3_REGION;
  const accessKeyId = process.env.SUPABASE_S3_ACCESS_KEY_ID;
  const secretAccessKey = process.env.SUPABASE_S3_SECRET_ACCESS_KEY;

  if (!endpoint || !region || !accessKeyId || !secretAccessKey) {
    throw new Error('Supabase S3 storage is not configured.');
  }

  return new S3Client({
    endpoint,
    region,
    forcePathStyle: true,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function ensureGalleryBucket() {
  const client = getStorageClient();
  try {
    await client.send(new HeadBucketCommand({ Bucket: GALLERY_BUCKET }));
  } catch {
    try {
      await client.send(new CreateBucketCommand({ Bucket: GALLERY_BUCKET }));
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      if (name !== 'BucketAlreadyOwnedByYou' && name !== 'BucketAlreadyExists') throw error;
    }
  }
  return { client, bucket: GALLERY_BUCKET };
}

export async function uploadGalleryImage(imageId: string, image: Uint8Array) {
  const { client, bucket } = await ensureGalleryBucket();
  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: `gallery/${imageId}.webp`,
    Body: image,
    ContentType: 'image/webp',
    CacheControl: 'public, max-age=31536000, immutable',
  }));
}

export async function getGalleryImage(imageId: string) {
  const client = getStorageClient();
  const result = await client.send(new GetObjectCommand({ Bucket: GALLERY_BUCKET, Key: `gallery/${imageId}.webp` }));
  if (!result.Body) return null;
  return {
    body: await result.Body.transformToByteArray(),
    contentType: result.ContentType || 'image/webp',
  };
}

export async function deleteGalleryImages(imageIds: string[]) {
  if (imageIds.length === 0) return;
  const client = getStorageClient();
  await Promise.all(imageIds.map((imageId) => client.send(new DeleteObjectCommand({
    Bucket: GALLERY_BUCKET,
    Key: `gallery/${imageId}.webp`,
  }))));
}

export function getGalleryImageId(source: string) {
  const match = source.match(/^\/api\/gallery\/media\/([0-9a-f-]{36})$/i);
  return match?.[1] || null;
}
