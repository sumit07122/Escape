import path from 'path';
import sharp from 'sharp';
import fs from 'fs';

const CINEMATIC_BG = path.join(__dirname, '..', 'public', 'images', 'cinematic-coach-mountains.jpg');
const BASE_OUT = path.join(__dirname, '..', 'marketing', 'himalayan-escape');

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

async function renderMasterAds() {
  console.log('Rendering Master Cinematic Ad Posters...');

  const specs = [
    {
      dir: '02-main-posters',
      name: '00_master_cinematic_hero_ad',
      w: 1080,
      h: 1350,
      overline: 'GLA UNIVERSITY TO HIMACHAL EXPEDITION',
      headline: 'CAMPUS OFF.\nMOUNTAINS ON.',
      sub: 'Six days away from routine. A lifetime of stories.\nDirect luxury coach departure from GLA University Campus gate.',
      price: '₹6,200 ALL-INCLUSIVE',
      deposit: 'LOCK SEAT: ₹1,000 DEPOSIT',
    },
    {
      dir: '03-instagram/feed',
      name: '00_master_cinematic_hero_ad_portrait',
      w: 1080,
      h: 1350,
      overline: 'THE GREAT ESCAPE 2026',
      headline: 'LEAVE CAMPUS BEHIND.\nCHASE THE PEAKS.',
      sub: 'Manali × Kasol • 6 Days / 5 Nights • Luxury Coach from Campus',
      price: '₹6,200 COMPLETE TRIP',
      deposit: 'RESERVE WITH ₹1,000',
    },
    {
      dir: '03-instagram/feed',
      name: '00_master_cinematic_hero_ad_square',
      w: 1080,
      h: 1080,
      overline: 'GLA EXPEDITION 2026',
      headline: 'CAMPUS OFF.\nMOUNTAINS ON.',
      sub: 'Manali × Kasol • 6D/5N • Transit, Stays & Meals Included',
      price: '₹6,200 ALL-IN',
      deposit: '₹1,000 DEPOSIT',
    },
    {
      dir: '03-instagram/stories',
      name: '00_master_cinematic_hero_story',
      w: 1080,
      h: 1920,
      overline: 'THE GREAT ESCAPE',
      headline: 'CAMPUS OFF.\nMOUNTAINS ON.',
      sub: '6 Days / 5 Nights Manali × Kasol.\nDirect pickup outside GLA Campus gate.',
      price: '₹6,200 ALL-INCLUSIVE',
      deposit: 'LOCK SEAT FOR ₹1,000',
    },
    {
      dir: '05-facebook-ads',
      name: '00_master_cinematic_landscape_ad',
      w: 1200,
      h: 628,
      overline: 'GLA UNIVERSITY TO HIMACHAL 2026',
      headline: 'CAMPUS OFF. MOUNTAINS ON.',
      sub: 'Manali × Kasol 6D/5N. Stays, transit & meals all-inclusive.',
      price: '₹6,200 ALL-IN',
      deposit: '₹1,000 DEPOSIT TODAY',
    },
  ];

  for (const s of specs) {
    const bg = await sharp(CINEMATIC_BG)
      .resize(s.w, s.h, { fit: 'cover', position: 'center' })
      .toBuffer();

    const isLandscape = s.w > s.h;
    const isStory = s.h >= 1800;

    const sidePadding = isLandscape ? 60 : 70;
    const topPadding = isStory ? 180 : isLandscape ? 50 : 80;
    const contentW = s.w - sidePadding * 2;

    const lines = s.headline.split('\n');
    const fSize = isLandscape ? 44 : isStory ? 68 : 62;
    const lHeight = Math.round(fSize * 1.15);

    const svg = Buffer.from(`
      <svg width="${s.w}" height="${s.h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#080D0B" stop-opacity="0.6"/>
            <stop offset="35%" stop-color="#080D0B" stop-opacity="0.75"/>
            <stop offset="75%" stop-color="#080D0B" stop-opacity="0.92"/>
            <stop offset="100%" stop-color="#040605" stop-opacity="0.98"/>
          </linearGradient>
          <linearGradient id="p" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#E28752"/>
            <stop offset="100%" stop-color="#C2632E"/>
          </linearGradient>
          <linearGradient id="card" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stop-color="#1A463B" stop-opacity="0.94"/>
            <stop offset="100%" stop-color="#0F2E26" stop-opacity="0.98"/>
          </linearGradient>
        </defs>

        <rect width="100%" height="100%" fill="url(#g)"/>

        <!-- Header -->
        <g transform="translate(${sidePadding}, ${topPadding})">
          <rect x="0" y="0" width="${isLandscape ? 360 : 420}" height="36" rx="18" fill="#FFFFFF" fill-opacity="0.12" stroke="#FFFFFF" stroke-opacity="0.25"/>
          <circle cx="18" cy="18" r="4.5" fill="#34D399"/>
          <text x="32" y="23" fill="#FAF9F5" font-size="12" font-weight="800" letter-spacing="2" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">HIMALAYAN ESCAPE • THE GREAT ESCAPE</text>

          <text x="0" y="70" fill="#E28752" font-size="${isLandscape ? 13 : 15}" font-weight="800" letter-spacing="3" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
            ${esc(s.overline)}
          </text>

          ${lines
            .map(
              (l, idx) => `
            <text x="0" y="${130 + idx * lHeight}" fill="#FFFFFF" font-size="${fSize}" font-weight="900" letter-spacing="-1.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
              ${esc(l)}
            </text>
          `
            )
            .join('\n')}

          <text x="0" y="${150 + lines.length * lHeight}" fill="#C5C9C3" font-size="${isLandscape ? 15 : 18}" font-weight="500" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
            ${esc(s.sub.split('\n')[0])}
          </text>
        </g>

        <!-- Feature Pills -->
        <g transform="translate(${sidePadding}, ${isLandscape ? 250 : isStory ? 940 : 730})">
          <g transform="translate(0, 0)">
            <rect width="${Math.round(contentW / 3) - 12}" height="${isLandscape ? 56 : 68}" rx="16" fill="#163C32" fill-opacity="0.9" stroke="#D8D2C4" stroke-opacity="0.35"/>
            <circle cx="22" cy="${isLandscape ? 28 : 34}" r="5" fill="#34D399"/>
            <text x="36" y="${isLandscape ? 33 : 39}" fill="#FAF9F5" font-size="13" font-weight="700" font-family="-apple-system, sans-serif">Direct GLA Pickup</text>
          </g>
          <g transform="translate(${Math.round(contentW / 3)}, 0)">
            <rect width="${Math.round(contentW / 3) - 12}" height="${isLandscape ? 56 : 68}" rx="16" fill="#163C32" fill-opacity="0.9" stroke="#D8D2C4" stroke-opacity="0.35"/>
            <circle cx="22" cy="${isLandscape ? 28 : 34}" r="5" fill="#34D399"/>
            <text x="36" y="${isLandscape ? 33 : 39}" fill="#FAF9F5" font-size="13" font-weight="700" font-family="-apple-system, sans-serif">Manali × Kasol 6D/5N</text>
          </g>
          <g transform="translate(${Math.round((contentW / 3) * 2)}, 0)">
            <rect width="${Math.round(contentW / 3) - 12}" height="${isLandscape ? 56 : 68}" rx="16" fill="#163C32" fill-opacity="0.9" stroke="#D8D2C4" stroke-opacity="0.35"/>
            <circle cx="22" cy="${isLandscape ? 28 : 34}" r="5" fill="#34D399"/>
            <text x="36" y="${isLandscape ? 33 : 39}" fill="#FAF9F5" font-size="13" font-weight="700" font-family="-apple-system, sans-serif">25 Seats / Coach</text>
          </g>
        </g>

        <!-- Pricing & Deposit Bottom Box -->
        <g transform="translate(${sidePadding}, ${s.h - (isLandscape ? 140 : isStory ? 340 : 250)})">
          <rect width="${contentW}" height="${isLandscape ? 100 : isStory ? 180 : 150}" rx="24" fill="url(#card)" stroke="#D8D2C4" stroke-opacity="0.35"/>

          <g transform="translate(28, ${isLandscape ? 28 : 36})">
            <text x="0" y="0" fill="#8FA69F" font-size="11" font-weight="800" letter-spacing="1.5" font-family="-apple-system, sans-serif">TOTAL EXPEDITION FARE</text>
            <text x="0" y="32" fill="#FFFFFF" font-size="${isLandscape ? 26 : 32}" font-weight="900" font-family="-apple-system, sans-serif">${s.price}</text>
            <text x="0" y="${isLandscape ? 50 : 58}" fill="#34D399" font-size="12" font-weight="700" font-family="-apple-system, sans-serif">✓ Luxury Coach + Verified Stays + Meals + Sightseeing</text>
          </g>

          <g transform="translate(${isLandscape ? contentW - 400 : 28}, ${isLandscape ? 28 : isStory ? 112 : 94})">
            <rect width="${isLandscape ? 280 : 340}" height="44" rx="22" fill="url(#p)"/>
            <text x="${isLandscape ? 140 : 170}" y="27" fill="#FFFFFF" font-size="13" font-weight="800" text-anchor="middle" letter-spacing="0.5" font-family="-apple-system, sans-serif">⚡ ${s.deposit}</text>
          </g>
        </g>

        <!-- Footer -->
        <g transform="translate(${sidePadding}, ${s.h - (isLandscape ? 20 : isStory ? 80 : 50)})">
          <text x="0" y="0" fill="#8FA69F" font-size="${isLandscape ? 11 : 13}" font-weight="600" font-family="-apple-system, sans-serif">
            📍 GLA University Gate Departure • Strictly 25 Passenger Seats / Coach
          </text>
          <text x="${contentW}" y="0" fill="#FAF9F5" font-size="${isLandscape ? 11 : 13}" font-weight="800" text-anchor="end" font-family="-apple-system, sans-serif">
            RESERVE: himalaya-escape.vercel.app/book
          </text>
        </g>
      </svg>
    `);

    const outDir = path.join(BASE_OUT, s.dir);
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const pngPath = path.join(outDir, `${s.name}.png`);
    const jpgPath = path.join(outDir, `${s.name}.jpg`);

    await sharp(bg)
      .composite([{ input: svg, top: 0, left: 0 }])
      .png({ quality: 95 })
      .toFile(pngPath);

    await sharp(pngPath)
      .jpeg({ quality: 90, mozjpeg: true })
      .toFile(jpgPath);

    console.log(`Rendered Flagship Master Ad: ${s.dir}/${s.name}`);
  }
}

renderMasterAds().catch(console.error);
