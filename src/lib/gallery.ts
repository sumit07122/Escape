export interface GalleryImageEntry {
  id: string;
  image: string;
  title: string;
  caption: string;
  location: string;
}

export const MAX_GALLERY_IMAGES = 10;
export const MAX_GALLERY_IMAGE_LENGTH = 420_000;
export const MAX_GALLERY_JSON_LENGTH = 4_000_000;

function legacyTitle(image: string) {
  const source = image.toLowerCase();
  if (source.includes('solang')) return 'Solang Valley';
  if (source.includes('kasol') || source.includes('river')) return 'Parvati Valley & Kasol';
  if (source.includes('manikaran')) return 'Manikaran Sahib';
  if (source.includes('tosh')) return 'Tosh Valley';
  if (source.includes('old-manali')) return 'Old Manali & Cedar Forests';
  return 'Himalayan Escape';
}

export function parseGalleryImages(value: string | null | undefined): GalleryImageEntry[] {
  if (!value) return [];
  try {
    const parsed: unknown = JSON.parse(value);
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((entry, index) => {
      if (typeof entry === 'string') {
        if (!isAllowedGalleryImageSource(entry)) return [];
        return [{ id: `gallery-${index}`, image: entry, title: legacyTitle(entry), caption: '', location: '' }];
      }
      if (!entry || typeof entry !== 'object') return [];
      const item = entry as Partial<GalleryImageEntry>;
      if (typeof item.image !== 'string' || !isAllowedGalleryImageSource(item.image)) return [];
      return [{
        id: typeof item.id === 'string' ? item.id : `gallery-${index}`,
        image: item.image,
        title: typeof item.title === 'string' ? item.title : legacyTitle(item.image),
        caption: typeof item.caption === 'string' ? item.caption : '',
        location: typeof item.location === 'string' ? item.location : '',
      }];
    });
  } catch {
    return [];
  }
}

export function isAllowedGalleryImageSource(source: string) {
  if (/^data:image\/(webp|jpeg|png);base64,[A-Za-z0-9+/]+=*$/i.test(source)) return true;
  if (source.startsWith('/images/') && !source.startsWith('//')) return true;
  try {
    return new URL(source).protocol === 'https:';
  } catch {
    return false;
  }
}
