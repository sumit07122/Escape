export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { createAuditLog, getCurrentAdmin } from '@/lib/server-utils';
import {
  isAllowedGalleryImageSource,
  MAX_GALLERY_IMAGE_LENGTH,
  MAX_GALLERY_IMAGES,
  MAX_GALLERY_JSON_LENGTH,
  parseGalleryImages,
} from '@/lib/gallery';
import type { GalleryImageEntry } from '@/lib/gallery';
import { deleteGalleryImages, getGalleryImageId } from '@/lib/gallery-storage';

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const trip = await db.trip.findFirst({
      orderBy: { createdAt: 'asc' },
      select: { galleryImages: true },
    });
    return NextResponse.json({ images: parseGalleryImages(trip?.galleryImages) });
  } catch (error) {
    console.error('Error loading gallery manager:', error);
    return NextResponse.json({ error: 'Could not load gallery images.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    if (!Array.isArray(body.images) || body.images.length > MAX_GALLERY_IMAGES) {
      return NextResponse.json({ error: `Add up to ${MAX_GALLERY_IMAGES} gallery images.` }, { status: 400 });
    }

    const images: GalleryImageEntry[] = [];
    for (const item of body.images) {
      if (!item || typeof item !== 'object') {
        return NextResponse.json({ error: 'Each gallery entry must be an image.' }, { status: 400 });
      }
      const image = typeof item.image === 'string' ? item.image.trim() : '';
      const title = typeof item.title === 'string' ? item.title.trim().slice(0, 100) : '';
      const caption = typeof item.caption === 'string' ? item.caption.trim().slice(0, 280) : '';
      const location = typeof item.location === 'string' ? item.location.trim().slice(0, 100) : '';
      if (!title || !image || image.length > MAX_GALLERY_IMAGE_LENGTH || !isAllowedGalleryImageSource(image)) {
        return NextResponse.json({ error: 'Each image needs a title and a valid HTTPS image link or compressed image file.' }, { status: 400 });
      }
      images.push({
        id: typeof item.id === 'string' && /^[a-zA-Z0-9_-]{1,60}$/.test(item.id) ? item.id : crypto.randomUUID(),
        image,
        title,
        caption,
        location,
      });
    }

    const serialized = JSON.stringify(images);
    if (serialized.length > MAX_GALLERY_JSON_LENGTH) {
      return NextResponse.json({ error: 'Gallery is too large to save. Remove a large image and try again.' }, { status: 413 });
    }

    const trip = await db.trip.findFirst({ orderBy: { createdAt: 'asc' }, select: { id: true, galleryImages: true } });
    if (!trip) return NextResponse.json({ error: 'The expedition is not configured yet.' }, { status: 404 });
    const previousImages = parseGalleryImages(trip.galleryImages);
    const previousCount = previousImages.length;
    await db.trip.update({ where: { id: trip.id }, data: { galleryImages: serialized } });

    const retainedImageIds = new Set(images.map((image) => getGalleryImageId(image.image)).filter((id): id is string => Boolean(id)));
    const removedImageIds = previousImages
      .map((image) => getGalleryImageId(image.image))
      .filter((id): id is string => id !== null && !retainedImageIds.has(id));
    if (removedImageIds.length > 0) {
      try {
        await deleteGalleryImages(removedImageIds);
      } catch (error) {
        console.error('Could not remove unused gallery objects:', error instanceof Error ? error.name : 'UnknownError');
      }
    }

    await createAuditLog({
      action: 'ADMIN_GALLERY_UPDATED',
      entityType: 'TRIP_GALLERY',
      entityId: trip.id,
      performedBy: `Admin: ${admin.name} (${admin.email})`,
      oldValue: `${previousCount} images`,
      newValue: `${images.length} images`,
    });

    revalidatePath('/gallery');
    revalidatePath('/');
    return NextResponse.json({ success: true, images });
  } catch (error) {
    console.error('Error saving gallery:', error);
    return NextResponse.json({ error: 'Could not save gallery images.' }, { status: 500 });
  }
}
