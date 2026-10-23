export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getCurrentAdmin } from '@/lib/server-utils';
import { uploadGalleryImage } from '@/lib/gallery-storage';

const MAX_COMPRESSED_BYTES = 275 * 1024;

export async function POST(request: NextRequest) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Choose an image to upload.' }, { status: 400 });
    }
    if (file.type !== 'image/webp' || file.size === 0 || file.size > MAX_COMPRESSED_BYTES) {
      return NextResponse.json({ error: 'Upload a compressed WebP image under 275 KB.' }, { status: 400 });
    }

    const bytes = new Uint8Array(await file.arrayBuffer());
    const signature = new TextDecoder().decode(bytes.subarray(0, 4));
    const format = new TextDecoder().decode(bytes.subarray(8, 12));
    if (signature !== 'RIFF' || format !== 'WEBP') {
      return NextResponse.json({ error: 'The uploaded file is not a valid WebP image.' }, { status: 400 });
    }

    const imageId = crypto.randomUUID();
    await uploadGalleryImage(imageId, bytes);
    return NextResponse.json({ image: `/api/gallery/media/${imageId}` });
  } catch (error) {
    console.error('Gallery image upload failed:', error instanceof Error ? error.name : 'UnknownError');
    return NextResponse.json({ error: 'Could not store the image. Check the gallery storage configuration and try again.' }, { status: 503 });
  }
}
