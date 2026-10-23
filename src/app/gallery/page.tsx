import React from 'react';
import Link from 'next/link';
import { ArrowRight, Camera, MapPin, Mountain } from 'lucide-react';
import { db } from '@/lib/db';
import { parseGalleryImages, type GalleryImageEntry } from '@/lib/gallery';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export const metadata = {
  title: 'Expedition Gallery | Himalayan Escape',
  description: 'Scenic vistas, pine trails, riverbanks, and memories from Manali and Kasol.',
};

const HIGHLIGHTS: GalleryImageEntry[] = [
  { id: 'solang', image: '/images/solang-valley.jpg', title: 'Solang Valley Snow Point', location: 'Solang Valley, Manali', caption: 'High-altitude snow slopes beneath the Pir Panjal peaks.' },
  { id: 'kasol', image: '/images/kasol-river.jpg', title: 'Parvati River & Kasol Trails', location: 'Kasol, Parvati Valley', caption: 'Turquoise glacial water, pine forests and riverside walks.' },
  { id: 'old-manali', image: '/images/old-manali.jpg', title: 'Old Manali & Cedar Forests', location: 'Old Manali', caption: 'Quiet forest lanes, wooden architecture and mountain cafés.' },
  { id: 'manikaran', image: '/images/manikaran.jpg', title: 'Manikaran Sahib', location: 'Parvati Valley', caption: 'A sacred Himalayan town beside the natural hot springs.' },
  { id: 'tosh', image: '/images/tosh.jpg', title: 'Tosh Alpine Views', location: 'Tosh, Himachal Pradesh', caption: 'Alpine meadows and sweeping views of the Parvati peaks.' },
];

async function getGalleryImages() {
  try {
    const trip = await db.trip.findFirst({ orderBy: { createdAt: 'asc' }, select: { galleryImages: true } });
    const custom = parseGalleryImages(trip?.galleryImages);
    return custom.length ? custom : HIGHLIGHTS;
  } catch (error) {
    console.error('Could not load gallery images:', error);
    return HIGHLIGHTS;
  }
}

export default async function GalleryPage() {
  const images = await getGalleryImages();
  return (
    <main className="min-h-[75vh] bg-[#F7F5EF] px-4 py-10 text-[#171918] sm:px-6 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="relative isolate mb-8 overflow-hidden rounded-[2rem] bg-[#10231f] px-6 py-10 text-center text-white shadow-[0_24px_60px_rgba(10,25,20,0.18)] sm:mb-12 sm:px-12 sm:py-14">
          <div className="absolute inset-0 -z-10 opacity-35" style={{ backgroundImage: 'linear-gradient(135deg, #163c32 0%, transparent 55%), url(/images/kasol-river.jpg)', backgroundSize: 'cover', backgroundPosition: 'center 45%' }} />
          <span className="mx-auto inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#ffcf76] backdrop-blur-sm"><Camera className="h-3.5 w-3.5" />Visual journey</span>
          <h1 className="gallery-heading mx-auto mt-4 max-w-3xl text-3xl font-semibold tracking-tight text-white sm:text-5xl">The Himalayas, in moments</h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-white/80 sm:text-base">Snow valleys, cedar trails and the river towns that make the Manali × Kasol route unforgettable.</p>
        </header>

        <div className="mb-5 flex items-center justify-between gap-3">
          <div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#D87945]">Manali · Parvati Valley · Kasol</p><h2 className="mt-1 text-xl font-semibold tracking-tight text-[#163C32]">Expedition highlights</h2></div>
          <span className="rounded-full border border-[#d8d2c4] bg-white px-3 py-1.5 text-[10px] font-semibold text-[#53635b]">{images.length} {images.length === 1 ? 'photo' : 'photos'}</span>
        </div>

        <section aria-label="Expedition photo gallery" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {images.map((image, index) => (
            <article key={image.id} className={`gallery-photo-card group relative isolate overflow-hidden rounded-[1.5rem] border border-[#d8d2c4] bg-[#e7e2d8] shadow-[0_12px_32px_rgba(18,42,34,0.10)] transition duration-500 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(18,42,34,0.16)] ${index % 5 === 0 ? 'sm:col-span-2 lg:col-span-2' : ''}`}>
              <img src={image.image} alt={image.title} loading={index < 2 ? 'eager' : 'lazy'} className="absolute inset-0 h-full w-full object-cover transition duration-700 ease-out group-hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07130f]/90 via-[#07130f]/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                {image.location && <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.15em] text-[#ffcf76]"><MapPin className="h-3 w-3" />{image.location}</span>}
                <h3 className="gallery-card-title mt-2 text-xl font-semibold leading-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.8)] sm:text-2xl">{image.title}</h3>
                {image.caption && <p className="mt-1.5 max-w-xl text-xs leading-5 text-white/85 [text-shadow:0_1px_8px_rgba(0,0,0,0.8)] sm:text-sm">{image.caption}</p>}
              </div>
            </article>
          ))}
        </section>

        <section className="mt-12 flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#e2dbcf] bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:p-7">
          <div className="flex items-start gap-3"><span className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#edf3ef] text-[#163C32]"><Mountain className="h-5 w-5" /></span><div><h2 className="text-base font-semibold text-[#163C32]">See these places for yourself</h2><p className="mt-1 text-xs leading-5 text-[#66716a]">Explore the route, then reserve your place on the expedition.</p></div></div>
          <Link href="/book" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#D87945] px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#C26735]">Explore booking <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </div>
    </main>
  );
}
