export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getGalleryImage } from '@/lib/gallery-storage';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ imageId: string }> },
) {
  const { imageId } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(imageId)) {
    return NextResponse.json({ error: 'Image not found.' }, { status: 404 });
  }

  try {
    const image = await getGalleryImage(imageId);
    if (!image) return new Response(null, { status: 404 });
    return new Response(Buffer.from(image.body), {
      headers: {
        'Content-Type': image.contentType === 'image/webp' ? image.contentType : 'application/octet-stream',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'X-Content-Type-Options': 'nosniff',
        'Content-Disposition': 'inline',
      },
    });
  } catch (error) {
    if (error instanceof Error && (error.name === 'NoSuchKey' || error.name === 'NotFound')) {
      return new Response(null, { status: 404 });
    }
    console.error('Gallery image read failed:', error instanceof Error ? error.name : 'UnknownError');
    return NextResponse.json({ error: 'Image is temporarily unavailable.' }, { status: 503 });
  }
}
