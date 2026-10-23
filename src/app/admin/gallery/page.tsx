'use client';

import { useEffect, useState } from 'react';
import type { ChangeEvent } from 'react';
import { ArrowDown, ArrowUp, Check, ImagePlus, LoaderCircle, Save, Trash2, Upload } from 'lucide-react';
import type { GalleryImageEntry } from '@/lib/gallery';

const MAX_IMAGES = 10;
const MAX_UPLOAD_BYTES = 12 * 1024 * 1024;
const MAX_COMPRESSED_BYTES = 275 * 1024;

async function compressImage(file: File) {
  if (!file.type.startsWith('image/')) throw new Error('Choose a JPG, PNG, or WebP image.');
  if (file.size > MAX_UPLOAD_BYTES) throw new Error('Choose an image under 12 MB.');
  const bitmap = await createImageBitmap(file);
  try {
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Your browser could not prepare this image.');
    context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

    for (let attempt = 0; attempt < 8; attempt += 1) {
      const quality = Math.max(0.42, 0.82 - attempt * 0.055);
      const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', quality));
      if (blob && blob.size <= MAX_COMPRESSED_BYTES) return blob;
      if (attempt >= 3) {
        canvas.width = Math.max(1, Math.round(canvas.width * 0.82));
        canvas.height = Math.max(1, Math.round(canvas.height * 0.82));
        context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
      }
    }
    throw new Error('This image is unusually detailed. Choose a smaller image and try again.');
  } finally {
    bitmap.close();
  }
}

const newId = () => `gallery_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export default function AdminGalleryPage() {
  const [images, setImages] = useState<GalleryImageEntry[]>([]);
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [caption, setCaption] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [uploadImage, setUploadImage] = useState('');
  const [uploadName, setUploadName] = useState('');
  const [loading, setLoading] = useState(true);
  const [preparing, setPreparing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState<{ text: string; error?: boolean } | null>(null);

  useEffect(() => {
    let active = true;
    fetch('/api/admin/gallery', { cache: 'no-store' })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Could not load gallery.');
        if (active) setImages(data.images || []);
      })
      .catch((error: unknown) => {
        if (active) setFeedback({ text: error instanceof Error ? error.message : 'Could not load gallery.', error: true });
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPreparing(true);
    setFeedback(null);
    try {
      const compressed = await compressImage(file);
      const upload = new FormData();
      upload.append('file', compressed, 'gallery-image.webp');
      const response = await fetch('/api/admin/gallery/upload', { method: 'POST', body: upload });
      const data = await response.json();
      if (!response.ok || typeof data.image !== 'string') {
        throw new Error(data.error || 'Could not upload this image.');
      }
      setUploadImage(data.image);
      setUploadName(file.name);
      setImageUrl('');
      setFeedback({ text: 'Image stored securely. Add it to your draft and save changes to publish it.' });
    } catch (error) {
      setFeedback({ text: error instanceof Error ? error.message : 'Could not prepare this image.', error: true });
    } finally {
      setPreparing(false);
    }
  };

  const addImage = () => {
    const source = uploadImage || imageUrl.trim();
    if (!title.trim() || !source) {
      setFeedback({ text: 'Add a title and choose an image or paste an HTTPS image link.', error: true });
      return;
    }
    if (!uploadImage && !source.startsWith('/images/') && !/^https:\/\//i.test(source)) {
      setFeedback({ text: 'Image links must use HTTPS or a local /images/ path.', error: true });
      return;
    }
    if (images.length >= MAX_IMAGES) {
      setFeedback({ text: `The gallery supports up to ${MAX_IMAGES} images.`, error: true });
      return;
    }
    setImages((current) => [...current, { id: newId(), image: source, title: title.trim(), location: location.trim(), caption: caption.trim() }]);
    setTitle('');
    setLocation('');
    setCaption('');
    setImageUrl('');
    setUploadImage('');
    setUploadName('');
    setFeedback({ text: 'Image added to your draft. Save changes to publish the gallery.' });
  };

  const saveGallery = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/admin/gallery', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ images }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Could not save gallery.');
      setImages(data.images);
      setFeedback({ text: `Gallery saved. ${data.images.length} ${data.images.length === 1 ? 'image is' : 'images are'} live on the website.` });
    } catch (error) {
      setFeedback({ text: error instanceof Error ? error.message : 'Could not save gallery.', error: true });
    } finally {
      setSaving(false);
    }
  };

  const moveImage = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= images.length) return;
    setImages((current) => {
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6">
      <header className="flex flex-col gap-4 border-b border-white/[0.08] pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0b78c]">Website content</span>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Photo gallery</h1>
          <p className="mt-2 max-w-2xl text-xs leading-5 text-stone-400">Add trip photos or secure image links. Saved changes appear on the public Gallery page.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-stone-300">{images.length} / {MAX_IMAGES} images</span>
          <button type="button" onClick={saveGallery} disabled={saving || loading} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#e8b58e] px-4 text-xs font-bold text-[#18352b] transition hover:bg-[#f0c8a8] disabled:cursor-not-allowed disabled:opacity-50">
            {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </header>

      {feedback && <p role="status" className={`rounded-xl border px-4 py-3 text-xs ${feedback.error ? 'border-rose-400/25 bg-rose-400/10 text-rose-200' : 'border-emerald-300/20 bg-emerald-300/10 text-emerald-100'}`}>{feedback.text}</p>}

      <section className="grid gap-5 rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4">
          <div>
            <h2 className="text-base font-semibold text-white">Add a gallery image</h2>
            <p className="mt-1 text-xs text-stone-400">Image uploads are resized and compressed in your browser before saving.</p>
          </div>
          <label className="block text-[11px] font-semibold text-stone-300">Photo title<input value={title} onChange={(event) => setTitle(event.target.value)} maxLength={100} placeholder="e.g. Parvati Valley at golden hour" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0b1512] px-3.5 py-3 text-sm text-white outline-none transition placeholder:text-stone-600 focus:border-[#e8b58e]/60" /></label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-[11px] font-semibold text-stone-300">Location<input value={location} onChange={(event) => setLocation(event.target.value)} maxLength={100} placeholder="Kasol, Himachal Pradesh" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0b1512] px-3.5 py-3 text-sm text-white outline-none placeholder:text-stone-600 focus:border-[#e8b58e]/60" /></label>
            <label className="block text-[11px] font-semibold text-stone-300">Caption<input value={caption} onChange={(event) => setCaption(event.target.value)} maxLength={280} placeholder="A short note for visitors" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0b1512] px-3.5 py-3 text-sm text-white outline-none placeholder:text-stone-600 focus:border-[#e8b58e]/60" /></label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
            <label className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.025] px-3 py-3 text-xs font-semibold text-stone-200 transition hover:border-[#e8b58e]/60 hover:bg-white/[0.05]">
              {preparing ? <LoaderCircle className="h-4 w-4 animate-spin text-[#e8b58e]" /> : <Upload className="h-4 w-4 text-[#e8b58e]" />}
              {preparing ? 'Compressing and uploading…' : uploadName || 'Choose photo to upload'}
              <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleFile} disabled={preparing} className="sr-only" />
            </label>
            <label className="block text-[10px] font-semibold text-stone-400">Or paste an HTTPS image link<input value={imageUrl} onChange={(event) => { setImageUrl(event.target.value); setUploadImage(''); setUploadName(''); }} placeholder="https://…" className="mt-1.5 w-full rounded-xl border border-white/10 bg-[#0b1512] px-3 py-3 text-xs text-white outline-none placeholder:text-stone-600 focus:border-[#e8b58e]/60" /></label>
          </div>
          <button type="button" onClick={addImage} disabled={preparing || images.length >= MAX_IMAGES} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/15 bg-white/[0.07] px-4 text-xs font-semibold text-white transition hover:bg-white/[0.12] disabled:opacity-50"><ImagePlus className="h-4 w-4" />Add to draft</button>
        </div>

        <div className="rounded-2xl border border-white/[0.07] bg-[#0b1512]/70 p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-stone-500">Preview</p>
          {uploadImage || imageUrl ? <div className="mt-3 overflow-hidden rounded-xl border border-white/10"><img src={uploadImage || imageUrl} alt="Gallery image preview" className="aspect-[4/3] w-full object-cover" /><p className="px-3 py-2 text-xs font-semibold text-white">{title || uploadName || 'Photo title'}</p></div> : <div className="mt-3 flex aspect-[4/3] items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.025] text-center text-xs text-stone-500"><div><ImagePlus className="mx-auto mb-2 h-6 w-6" />Choose an image to preview it here</div></div>}
          <p className="mt-3 text-[10px] leading-5 text-stone-500">JPG, PNG and WebP are accepted. Uploads are compressed to WebP before they are stored with the trip gallery.</p>
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-end justify-between gap-3"><div><h2 className="text-base font-semibold text-white">Published gallery order</h2><p className="mt-1 text-xs text-stone-400">Move photos up or down to change their order on the public page.</p></div><a href="/gallery" target="_blank" rel="noreferrer" className="text-xs font-semibold text-[#f0bd94] hover:text-white">View gallery ↗</a></div>
        {loading ? <div className="flex items-center gap-2 rounded-xl border border-white/10 p-6 text-xs text-stone-400"><LoaderCircle className="h-4 w-4 animate-spin" />Loading gallery…</div> : images.length === 0 ? <div className="rounded-xl border border-dashed border-white/15 p-8 text-center text-xs text-stone-400">No custom photos yet. The public gallery is using the expedition highlights.</div> : (
          <div className="grid gap-3 sm:grid-cols-2">
            {images.map((image, index) => (
              <article key={image.id} className="flex min-w-0 gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
                <img src={image.image} alt="" className="h-24 w-28 shrink-0 rounded-lg bg-black/20 object-cover" />
                <div className="min-w-0 flex-1">
                  <input aria-label={`Photo title ${index + 1}`} value={image.title} maxLength={100} onChange={(event) => setImages((current) => current.map((item) => item.id === image.id ? { ...item, title: event.target.value } : item))} className="w-full rounded-md border border-white/10 bg-[#0b1512] px-2 py-1.5 text-xs font-semibold text-white outline-none focus:border-[#e8b58e]/60" />
                  <input aria-label={`Photo location ${index + 1}`} value={image.location} maxLength={100} onChange={(event) => setImages((current) => current.map((item) => item.id === image.id ? { ...item, location: event.target.value } : item))} placeholder="Location" className="mt-1 w-full rounded-md border border-white/10 bg-[#0b1512] px-2 py-1.5 text-[10px] text-stone-300 outline-none focus:border-[#e8b58e]/60" />
                  <input aria-label={`Photo caption ${index + 1}`} value={image.caption} maxLength={280} onChange={(event) => setImages((current) => current.map((item) => item.id === image.id ? { ...item, caption: event.target.value } : item))} placeholder="Caption" className="mt-1 w-full rounded-md border border-white/10 bg-[#0b1512] px-2 py-1.5 text-[10px] text-stone-300 outline-none focus:border-[#e8b58e]/60" />
                  <div className="mt-3 flex items-center gap-1.5">
                    <button type="button" onClick={() => moveImage(index, -1)} disabled={index === 0} aria-label={`Move ${image.title} up`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-stone-300 hover:bg-white/10 disabled:opacity-30"><ArrowUp className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => moveImage(index, 1)} disabled={index === images.length - 1} aria-label={`Move ${image.title} down`} className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 text-stone-300 hover:bg-white/10 disabled:opacity-30"><ArrowDown className="h-3.5 w-3.5" /></button>
                    <button type="button" onClick={() => setImages((current) => current.filter((item) => item.id !== image.id))} aria-label={`Remove ${image.title}`} className="ml-auto inline-flex h-8 items-center gap-1 rounded-lg border border-rose-300/15 px-2 text-[10px] font-semibold text-rose-200 hover:bg-rose-300/10"><Trash2 className="h-3.5 w-3.5" />Remove</button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
      <div className="flex justify-end pb-4">
        <button type="button" onClick={saveGallery} disabled={saving || loading} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#e8b58e] px-5 text-xs font-bold text-[#18352b] transition hover:bg-[#f0c8a8] disabled:opacity-50">
          {saving ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}{saving ? 'Saving…' : 'Save and publish gallery'}
        </button>
      </div>
    </div>
  );
}
