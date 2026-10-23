import TripPricingConfigTab from '@/components/admin/TripPricingConfigTab';

export default function SiteEditorPage() {
  return (
    <div className="mx-auto w-full max-w-5xl">
      <div className="mb-6 border-b border-white/[0.08] pb-5">
        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#f0b78c]">Website and trip content</span>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Site editor</h1>
        <p className="mt-2 max-w-2xl text-xs leading-5 text-stone-400">Update the details travellers see across the site: title, pricing, dates, pickup, contact lines, announcements and promo codes.</p>
      </div>
      <TripPricingConfigTab />
    </div>
  );
}
