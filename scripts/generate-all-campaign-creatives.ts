import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import QRCode from 'qrcode';

const PUBLIC_IMG = path.join(__dirname, '..', 'public', 'images');
const BG_HERO = path.join(PUBLIC_IMG, 'hero-himalayas.jpg');
const BG_KASOL = path.join(PUBLIC_IMG, 'kasol-river.jpg');
const BG_SOLANG = path.join(PUBLIC_IMG, 'solang-valley.jpg');
const BG_MANALI = path.join(PUBLIC_IMG, 'old-manali.jpg');
const BG_TOSH = path.join(PUBLIC_IMG, 'tosh.jpg');
const BG_MANIKARAN = path.join(PUBLIC_IMG, 'manikaran.jpg');

const BASE_OUT = path.join(__dirname, '..', 'marketing', 'himalayan-escape');

// Ensure output dirs exist
function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Generate QR Code PNG Buffer
async function getQrBuffer(url = 'https://himalaya-escape.vercel.app/book', size = 260): Promise<Buffer> {
  return await QRCode.toBuffer(url, {
    width: size,
    margin: 1,
    color: {
      dark: '#163C32',
      light: '#FFFFFF',
    },
  });
}

// Helper to escape XML/SVG text
function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

interface CreativeSpec {
  outputSubdir: string;
  filenameBase: string;
  width: number;
  height: number;
  bgImage: string;
  overline: string;
  headline: string;
  subheadline: string;
  badge?: string;
  features?: string[];
  priceTag?: string;
  depositTag?: string;
  ctaText?: string;
  includeQr?: boolean;
}

async function renderCreative(spec: CreativeSpec) {
  const {
    outputSubdir,
    filenameBase,
    width,
    height,
    bgImage,
    overline,
    headline,
    subheadline,
    badge,
    features = [],
    priceTag = '₹6,200 ALL-INCLUSIVE',
    depositTag = 'LOCK SEAT: ₹1,000 DEPOSIT',
    ctaText = 'RESERVE: himalaya-escape.vercel.app/book',
    includeQr = false,
  } = spec;

  const targetDir = path.join(BASE_OUT, outputSubdir);
  ensureDir(targetDir);

  // 1. Resize and crop background photo
  const bgBuffer = await sharp(bgImage)
    .resize(width, height, { fit: 'cover', position: 'center' })
    .toBuffer();

  // 2. Generate QR code if required
  let qrOverlay: sharp.OverlayOptions[] = [];
  let qrSize = Math.round(width * 0.22);
  let qrX = width - qrSize - 80;
  let qrY = height - qrSize - 120;

  if (includeQr) {
    const qrBuf = await getQrBuffer('https://himalaya-escape.vercel.app/book', qrSize);
    // Draw white rounded background behind QR code
    const qrBgSvg = Buffer.from(`
      <svg width="${qrSize + 24}" height="${qrSize + 24}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" rx="20" fill="#FFFFFF" stroke="#D8D2C4" stroke-width="2"/>
      </svg>
    `);

    qrOverlay = [
      { input: qrBgSvg, top: qrY - 12, left: qrX - 12 },
      { input: qrBuf, top: qrY, left: qrX },
    ];
  }

  // 3. Typography & element positioning based on aspect ratio
  const isStory = height >= 1800; // 1080x1920
  const isLandscape = width > height; // 1200x628 or 1640x624
  const isSquare = width === height; // 1080x1080

  const topPadding = isStory ? 160 : isLandscape ? 50 : 80;
  const sidePadding = isLandscape ? 70 : 70;
  const contentWidth = width - sidePadding * 2;

  // Split headline into lines
  const headlineWords = headline.split(' ');
  let headlineLines: string[] = [];
  let cur = '';
  for (const w of headlineWords) {
    if ((cur + ' ' + w).trim().length > (isLandscape ? 30 : 18)) {
      headlineLines.push(cur.trim());
      cur = w;
    } else {
      cur += ' ' + w;
    }
  }
  if (cur.trim()) headlineLines.push(cur.trim());

  const headlineFontSize = isLandscape ? 44 : isStory ? 64 : 58;
  const headlineLineHeight = Math.round(headlineFontSize * 1.18);

  let featureItemsSvg = '';
  if (features && features.length > 0) {
    const startY = isLandscape ? 260 : isStory ? 920 : 720;
    const colWidth = Math.round(contentWidth / Math.min(features.length, 3));
    featureItemsSvg = features
      .map((f, i) => {
        const itemX = sidePadding + i * colWidth;
        return `
          <g transform="translate(${itemX}, ${startY})">
            <rect width="${colWidth - 16}" height="${isLandscape ? 60 : 72}" rx="16" fill="#163C32" fill-opacity="0.85" stroke="#D8D2C4" stroke-opacity="0.35"/>
            <circle cx="24" cy="${isLandscape ? 30 : 36}" r="6" fill="#34D399"/>
            <text x="40" y="${isLandscape ? 35 : 42}" fill="#FAF9F5" font-size="${isLandscape ? 13 : 15}" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">${esc(f)}</text>
          </g>
        `;
      })
      .join('\n');
  }

  const svgOverlay = Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <!-- High Contrast Alpine Dark Gradient -->
        <linearGradient id="overlayGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#0E1613" stop-opacity="0.55"/>
          <stop offset="35%" stop-color="#0E1613" stop-opacity="0.75"/>
          <stop offset="70%" stop-color="#0E1613" stop-opacity="0.94"/>
          <stop offset="100%" stop-color="#080C0B" stop-opacity="0.98"/>
        </linearGradient>

        <linearGradient id="amberPill" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#E28752"/>
          <stop offset="100%" stop-color="#C2632E"/>
        </linearGradient>

        <linearGradient id="greenCard" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#1A463B" stop-opacity="0.95"/>
          <stop offset="100%" stop-color="#102B24" stop-opacity="0.98"/>
        </linearGradient>

        <filter id="cardShadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="16" stdDeviation="24" flood-color="#000000" flood-opacity="0.45"/>
        </filter>
      </defs>

      <!-- Base Dark Overlay -->
      <rect width="100%" height="100%" fill="url(#overlayGrad)"/>

      <!-- Subtle Glacier Glow Top Right -->
      <circle cx="${width - 100}" cy="100}" r="350" fill="#34D399" fill-opacity="0.08" filter="blur(60px)"/>

      <!-- Header Overline & Identity -->
      <g transform="translate(${sidePadding}, ${topPadding})">
        <!-- Brand Micro Chip -->
        <rect x="0" y="0" width="${isLandscape ? 360 : 420}" height="36" rx="18" fill="#FFFFFF" fill-opacity="0.12" stroke="#FFFFFF" stroke-opacity="0.25"/>
        <circle cx="18" cy="18" r="4.5" fill="#34D399"/>
        <text x="32" y="23" fill="#FAF9F5" font-size="12" font-weight="800" letter-spacing="2" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">HIMALAYAN ESCAPE • THE GREAT ESCAPE</text>

        <!-- Category Tag -->
        <text x="0" y="70" fill="#D87945" font-size="${isLandscape ? 13 : 15}" font-weight="800" letter-spacing="3" text-transform="uppercase" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
          ${esc(overline)}
        </text>

        <!-- Main Headline -->
        ${headlineLines
          .map(
            (line, idx) => `
          <text x="0" y="${130 + idx * headlineLineHeight}" fill="#FFFFFF" font-size="${headlineFontSize}" font-weight="900" letter-spacing="-1.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
            ${esc(line)}
          </text>
        `
          )
          .join('\n')}

        <!-- Subheadline / Body -->
        <text x="0" y="${150 + headlineLines.length * headlineLineHeight}" fill="#C5C9C3" font-size="${isLandscape ? 15 : 18}" font-weight="500" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
          ${esc(subheadline)}
        </text>
      </g>

      <!-- Inclusions / Feature Badges -->
      ${featureItemsSvg}

      <!-- Bottom Card: Pricing & Primary Call-To-Action -->
      <g transform="translate(${sidePadding}, ${height - (isLandscape ? 140 : isStory ? 340 : 250)})">
        <!-- Glassmorphic Card Container -->
        <rect x="0" y="0" width="${includeQr ? contentWidth - qrSize - 40 : contentWidth}" height="${isLandscape ? 100 : isStory ? 180 : 150}" rx="24" fill="url(#greenCard)" stroke="#D8D2C4" stroke-opacity="0.3" filter="url(#cardShadow)"/>

        <!-- Package Price -->
        <g transform="translate(28, ${isLandscape ? 28 : 36})">
          <text x="0" y="0" fill="#8FA69F" font-size="11" font-weight="800" letter-spacing="1.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">TOTAL EXPEDITION FARE</text>
          <text x="0" y="32" fill="#FFFFFF" font-size="${isLandscape ? 26 : 32}" font-weight="900" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">${esc(priceTag)}</text>
          <text x="0" y="${isLandscape ? 50 : 58}" fill="#34D399" font-size="12" font-weight="700" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">✓ Transit + Stays + Meals + Sightseeing Included</text>
        </g>

        <!-- Deposit Pill & CTA -->
        <g transform="translate(${isLandscape ? contentWidth - 420 : 28}, ${isLandscape ? 28 : isStory ? 112 : 94})">
          <rect x="0" y="0" width="${isLandscape ? 280 : 340}" height="44" rx="22" fill="url(#amberPill)"/>
          <text x="${isLandscape ? 140 : 170}" y="27" fill="#FFFFFF" font-size="13" font-weight="800" text-anchor="middle" letter-spacing="0.5" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">⚡ ${esc(depositTag)}</text>
        </g>
      </g>

      <!-- Bottom Meta Footer Bar -->
      <g transform="translate(${sidePadding}, ${height - (isLandscape ? 20 : isStory ? 80 : 50)})">
        <text x="0" y="0" fill="#8FA69F" font-size="${isLandscape ? 11 : 13}" font-weight="600" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
          📍 Direct Departure: GLA University Campus, Mathura • 25 Passenger Seats Per Coach
        </text>
        <text x="${contentWidth}" y="0" fill="#FAF9F5" font-size="${isLandscape ? 11 : 13}" font-weight="800" text-anchor="end" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif">
          ${esc(ctaText)}
        </text>
      </g>
    </svg>
  `);

  // Composite background with SVG and optional QR code
  const compositeLayers: sharp.OverlayOptions[] = [
    { input: svgOverlay, top: 0, left: 0 },
    ...qrOverlay,
  ];

  const finalPngPath = path.join(targetDir, `${filenameBase}.png`);
  const finalJpgPath = path.join(targetDir, `${filenameBase}.jpg`);

  await sharp(bgBuffer)
    .composite(compositeLayers)
    .png({ quality: 95, compressionLevel: 8 })
    .toFile(finalPngPath);

  await sharp(finalPngPath)
    .jpeg({ quality: 90, mozjpeg: true })
    .toFile(finalJpgPath);

  console.log(`Generated: ${outputSubdir}/${filenameBase} (PNG & JPG)`);
}

// ==========================================
// MASTER ASSET DEFINITIONS
// ==========================================
async function generateAll() {
  console.log('🚀 Starting Himalayan Escape Master Asset Generation...');

  // 1. 02-MAIN-POSTERS (1080x1350)
  const mainPosters: CreativeSpec[] = [
    {
      outputSubdir: '02-main-posters',
      filenameBase: '01_hero_campus_off_mountains_on',
      width: 1080,
      height: 1350,
      bgImage: BG_HERO,
      overline: 'GLA UNIVERSITY TO HIMACHAL EXPEDITION',
      headline: 'CAMPUS OFF. MOUNTAINS ON.',
      subheadline: 'Trade 8 AM lectures for snow peaks and pine forests. 6 Days / 5 Nights.',
      features: ['Direct GLA Campus Pickup', 'Manali × Kasol Route', '25 Student Seats / Coach'],
      priceTag: '₹6,200 ALL-INCLUSIVE',
      depositTag: 'LOCK SEAT: ₹1,000 DEPOSIT',
    },
    {
      outputSubdir: '02-main-posters',
      filenameBase: '02_destination_reveal_manali_kasol',
      width: 1080,
      height: 1350,
      bgImage: BG_KASOL,
      overline: 'TWO MOUNTAIN WORLDS • ONE ROUTE',
      headline: 'MANALI × KASOL EXPEDITION',
      subheadline: 'Snow ridges of Solang Valley meets the tranquil riverside soul of Kasol.',
      features: ['Old Manali Stone Trails', 'Parvati River Valley', 'Manikaran Hot Springs'],
      priceTag: '₹6,200 COMPLETE TRIP',
      depositTag: 'RESERVE WITH ₹1,000',
    },
    {
      outputSubdir: '02-main-posters',
      filenameBase: '03_all_inclusive_6200_pricing',
      width: 1080,
      height: 1350,
      bgImage: BG_SOLANG,
      overline: 'TRANSPARENT STUDENT PRICING',
      headline: '₹6,200 ALL-INCLUSIVE. NO HIDDEN FEES.',
      subheadline: 'No surprise driver fees or toll taxes. Stays, coach transit, and meals covered.',
      features: ['Coach Transit Included', 'Verified Mountain Stays', 'Nutritious Meals & Sightseeing'],
      priceTag: '₹6,200 FLAT PER HEAD',
      depositTag: '₹1,000 TODAY • BALANCE AT GATE',
    },
    {
      outputSubdir: '02-main-posters',
      filenameBase: '04_reserve_seat_1000_deposit',
      width: 1080,
      height: 1350,
      bgImage: BG_MANALI,
      overline: 'FLEXIBLE STUDENT RESERVATIONS',
      headline: 'LOCK YOUR SEAT WITH JUST ₹1,000.',
      subheadline: 'Secure your place on Coach 01 today. Pay the remaining ₹5,200 before departure.',
      features: ['Instant Digital Ticket', 'Held on Bus Seat Map', 'Remaining ₹5,200 at Departure'],
      priceTag: '₹6,200 TOTAL EXPEDITION',
      depositTag: '₹1,000 INITIAL DEPOSIT',
    },
    {
      outputSubdir: '02-main-posters',
      filenameBase: '05_friends_squad_mountain_escape',
      width: 1080,
      height: 1350,
      bgImage: BG_TOSH,
      overline: 'COLLEGE SQUAD EXPEDITION',
      headline: 'STOP PLANNING IN GROUP CHATS. MAKE IT HAPPEN.',
      subheadline: 'Pick adjacent seats on our live coach map with your closest friends.',
      features: ['Pick Seats Next to Friends', 'Each Friend Pays ₹1,000', 'GLA University Gate Pickup'],
      priceTag: '₹6,200 PER TRAVELLER',
      depositTag: 'LOCK SQUAD SEATS TODAY',
    },
    {
      outputSubdir: '02-main-posters',
      filenameBase: '06_six_days_five_nights_itinerary',
      width: 1080,
      height: 1350,
      bgImage: BG_MANIKARAN,
      overline: 'EXPEDITION ARCHITECTURE',
      headline: 'SIX DAYS AWAY FROM ROUTINE.',
      subheadline: 'Solang Valley snow, Old Manali cafes, Kasol riverside strolls, and pine trails.',
      features: ['Day 1: GLA Campus Exit', 'Day 2-3: Manali & Solang', 'Day 4-5: Kasol & Manikaran'],
      priceTag: '₹6,200 ALL-INCLUSIVE',
      depositTag: '144 HOURS OF ADVENTURE',
    },
    {
      outputSubdir: '02-main-posters',
      filenameBase: '07_official_website_booking_launch',
      width: 1080,
      height: 1350,
      bgImage: BG_HERO,
      overline: 'LIVE RESERVATION PORTAL',
      headline: 'OFFICIAL BOOKING PORTAL IS LIVE.',
      subheadline: 'Select your preferred coach seat in real time and get an instant QR boarding pass.',
      features: ['Live Bus Seat Picker', '1-Tap Fast Autofill', 'Razorpay 256-bit Secure'],
      priceTag: '₹6,200 ALL-INCLUSIVE',
      depositTag: 'BOOK IN 60 SECONDS',
    },
    {
      outputSubdir: '02-main-posters',
      filenameBase: '08_lock_your_seat_today',
      width: 1080,
      height: 1350,
      bgImage: BG_SOLANG,
      overline: 'LIMITED COACH CAPACITY',
      headline: 'YOUR MOUNTAIN ESCAPE IS ONE TAP AWAY.',
      subheadline: 'Strictly 25 student passenger seats per coach. Direct pickup from campus gate.',
      features: ['Strictly 25 Student Seats', 'Verified Crew Cabin', 'GLA Campus Gate Departure'],
      priceTag: '₹6,200 ALL-INCLUSIVE',
      depositTag: 'LOCK SEAT WITH ₹1,000',
    },
    {
      outputSubdir: '02-main-posters',
      filenameBase: '09_scan_to_book_digital_boarding',
      width: 1080,
      height: 1350,
      bgImage: BG_KASOL,
      overline: 'CAMPUS NOTICEBOARD EDITION',
      headline: 'SCAN TO LOCK YOUR SEAT IN 60 SECONDS.',
      subheadline: 'Scan with any phone camera to view remaining seats and reserve yours for ₹1,000.',
      features: ['Live Seat Map Access', 'Verified GLA Expedition', '₹1,000 Reservation Deposit'],
      priceTag: '₹6,200 PER PERSON',
      depositTag: 'SCAN TO BOOK NOW',
      includeQr: true,
    },
    {
      outputSubdir: '02-main-posters',
      filenameBase: '10_minimal_campus_bulletin_poster',
      width: 1080,
      height: 1350,
      bgImage: BG_MANALI,
      overline: 'HIMALAYAN ESCAPE 2026',
      headline: 'THE GREAT ESCAPE: MANALI × KASOL.',
      subheadline: '6 Days / 5 Nights. Direct from GLA University Campus. ₹6,200 All-Inclusive.',
      features: ['Luxury Coach Departure', '25 Student Seats / Bus', 'Deposit: ₹1,000 / Head'],
      priceTag: '₹6,200 TOTAL FARE',
      depositTag: 'himalaya-escape.vercel.app',
    },
  ];

  for (const p of mainPosters) {
    await renderCreative(p);
  }

  // 2. 03-INSTAGRAM FEED (5 creatives in 1080x1350 and 1080x1080)
  const igFeedBase = [
    {
      name: 'ig_feed_01_routine_escape',
      bg: BG_HERO,
      overline: 'BREAK THE ROUTINE',
      headline: 'SAME LECTURES. SAME TIMETABLE. NEED A BREAK?',
      sub: 'Trade attendance percentages for Himalayan peaks. 6D/5N Manali × Kasol.',
    },
    {
      name: 'ig_feed_02_group_chat_curse',
      bg: BG_TOSH,
      overline: 'SQUAD EXPEDITION',
      headline: 'BREAK THE GROUP CHAT CURSE THIS SEMESTER.',
      sub: 'Pick adjacent seats together on the live coach map. Lock with ₹1,000 each.',
    },
    {
      name: 'ig_feed_03_honest_pricing_6200',
      bg: BG_SOLANG,
      overline: 'ZERO HIDDEN CHARGES',
      headline: 'THE HONEST MANALI × KASOL TRIP: ₹6,200.',
      sub: 'Transit from campus gate, mountain hotel stays, meals, and guided routes.',
    },
    {
      name: 'ig_feed_04_seat_selection_map',
      bg: BG_KASOL,
      overline: 'LIVE COACH MAP',
      headline: 'WINDOW OR AISLE? CHOOSE YOUR SEAT NOW.',
      sub: 'Interactive seating map is live. 25 passenger seats per coach.',
    },
    {
      name: 'ig_feed_05_parvati_river_solang',
      bg: BG_MANIKARAN,
      overline: '6 DAYS / 5 NIGHTS',
      headline: 'FROM SOLANG SNOW TO PARVATI RIVER TRAILS.',
      sub: 'Two breathtaking Himachal destinations united into one student escape.',
    },
  ];

  for (const item of igFeedBase) {
    // Portrait 1080x1350
    await renderCreative({
      outputSubdir: '03-instagram/feed',
      filenameBase: `${item.name}_portrait_1080x1350`,
      width: 1080,
      height: 1350,
      bgImage: item.bg,
      overline: item.overline,
      headline: item.headline,
      subheadline: item.sub,
      features: ['Direct GLA Pickup', '₹6,200 All-In', '₹1,000 Deposit'],
    });

    // Square 1080x1080
    await renderCreative({
      outputSubdir: '03-instagram/feed',
      filenameBase: `${item.name}_square_1080x1080`,
      width: 1080,
      height: 1080,
      bgImage: item.bg,
      overline: item.overline,
      headline: item.headline,
      subheadline: item.sub,
      features: ['GLA Departure', '₹6,200 All-In'],
    });
  }

  // 3. 03-INSTAGRAM STORIES (7 stories in 1080x1920)
  const stories = [
    { name: 'ig_story_01_campus_off', bg: BG_HERO, overline: 'CAMPUS OFF • MOUNTAINS ON', headline: 'TIME TO LEAVE CAMPUS BEHIND.', sub: '6 Days / 5 Nights across Manali & Kasol.' },
    { name: 'ig_story_02_destination_split', bg: BG_KASOL, overline: 'DESTINATION REVEAL', headline: 'MANALI ADVENTURE × KASOL SOUL.', sub: 'Old Manali cafes and Parvati Valley trails.' },
    { name: 'ig_story_03_deposit_1000', bg: BG_SOLANG, overline: 'STUDENT FRIENDLY', headline: 'RESERVE SEAT WITH JUST ₹1,000.', sub: 'Pay remaining ₹5,200 before departure.' },
    { name: 'ig_story_04_window_or_aisle', bg: BG_MANALI, overline: 'LIVE COACH MAP', headline: 'WINDOW OR AISLE? PICK ON THE MAP.', sub: '25 passenger seats per coach.' },
    { name: 'ig_story_05_squad_reminder', bg: BG_TOSH, overline: 'TAG YOUR SQUAD', headline: 'MAKE THE GROUP CHAT TRIP HAPPEN.', sub: 'Book adjacent seats with your friends.' },
    { name: 'ig_story_06_departure_gate', bg: BG_HERO, overline: 'GLA UNIVERSITY PICKUP', headline: 'DIRECT COACH FROM CAMPUS GATE.', sub: 'Zero stress travel directly from Mathura.' },
    { name: 'ig_story_07_final_call', bg: BG_SOLANG, overline: 'FINAL SEAT CALL', headline: 'THE GREAT ESCAPE IS WAITING.', sub: 'Lock your seat today at himalaya-escape.vercel.app' },
  ];

  for (const s of stories) {
    await renderCreative({
      outputSubdir: '03-instagram/stories',
      filenameBase: s.name,
      width: 1080,
      height: 1920,
      bgImage: s.bg,
      overline: s.overline,
      headline: s.headline,
      subheadline: s.sub,
      features: ['GLA Campus Gate', '6D / 5N', '₹1,000 Deposit'],
    });
  }

  // 4. 03-INSTAGRAM REEL COVERS (5 covers in 1080x1920)
  const reelCovers = [
    { name: 'reel_cover_01_group_chat_made_it', bg: BG_HERO, headline: 'THE GROUP CHAT THAT FINALLY MADE IT.', sub: 'POV: You stopped making excuses and booked.' },
    { name: 'reel_cover_02_1000_vs_routine', bg: BG_SOLANG, headline: '₹1,000 VS CAMPUS ROUTINE.', sub: 'How one small deposit buys 6 days of mountains.' },
    { name: 'reel_cover_03_manali_vs_kasol', bg: BG_KASOL, headline: 'MANALI VS KASOL: WHY WE CHOSE BOTH.', sub: 'Snow adventures meet peaceful riverside pine.' },
    { name: 'reel_cover_04_60s_booking_demo', bg: BG_MANALI, headline: 'HOW TO BOOK YOUR BUS SEAT IN 60 SECONDS.', sub: 'Full live booking walkthrough.' },
    { name: 'reel_cover_05_8am_lecture_escape', bg: BG_TOSH, headline: 'MENTALLY I AM NOT IN THIS 8 AM LECTURE.', sub: 'Trading timetables for Parvati valley.' },
  ];

  for (const rc of reelCovers) {
    await renderCreative({
      outputSubdir: '03-instagram/reel-covers',
      filenameBase: rc.name,
      width: 1080,
      height: 1920,
      bgImage: rc.bg,
      overline: 'REEL EPISODE • HIMALAYAN ESCAPE',
      headline: rc.headline,
      subheadline: rc.sub,
      features: ['Watch Reel', '6D / 5N', 'GLA Pickup'],
    });
  }

  // 5. 04-WHATSAPP CREATIVES (7 mobile graphics)
  const waCreatives = [
    { name: 'wa_01_official_broadcast', bg: BG_HERO, w: 1080, h: 1920, overline: 'OFFICIAL ANNOUNCEMENT', headline: 'MANALI × KASOL EXPEDITION IS LIVE.', sub: 'Direct from GLA University Campus. 6D/5N all-inclusive for ₹6,200.' },
    { name: 'wa_02_short_forwardable_card', bg: BG_KASOL, w: 1080, h: 1080, overline: 'FORWARD TO FRIENDS', headline: 'LET’S BOOK THIS MOUNTAIN TRIP.', sub: '₹1,000 locks your seat today. Balance before boarding.' },
    { name: 'wa_03_squad_booking_push', bg: BG_TOSH, w: 1080, h: 1080, overline: 'SQUAD RESERVATIONS', headline: 'PICK ADJACENT SEATS ON THE COACH.', sub: 'Interactive bus map: L1-L10, R1-R10, rear bench B1-B5.' },
    { name: 'wa_04_personal_invitation_card', bg: BG_MANALI, w: 1080, h: 1920, overline: 'EXCLUSIVE INVITATION', headline: 'YOU ARE INVITED TO THE GREAT ESCAPE.', sub: 'Join batchmates for 6 Days / 5 Nights in Himachal.' },
    { name: 'wa_05_quick_faq_card', bg: BG_SOLANG, w: 1080, h: 1080, overline: 'TRIP DETAILS & FAQ', headline: 'ALL-INCLUSIVE ₹6,200 BREAKDOWN.', sub: 'Luxury coach + verified stays + meals + guided trails.' },
    { name: 'wa_06_qr_scan_share', bg: BG_KASOL, w: 1080, h: 1920, overline: 'SCAN & RESERVE', headline: 'SCAN TO OPEN OFFICIAL BOOKING SITE.', sub: 'Point phone camera to view remaining seats.', includeQr: true },
    { name: 'wa_07_final_departure_reminder', bg: BG_HERO, w: 1080, h: 1080, overline: 'FINAL SEAT LOCK', headline: 'DEPARTURE FROM GLA CAMPUS GATE.', sub: 'Secure your confirmed coach seat before allocation closes.' },
  ];

  for (const wa of waCreatives) {
    await renderCreative({
      outputSubdir: '04-whatsapp',
      filenameBase: wa.name,
      width: wa.w,
      height: wa.h,
      bgImage: wa.bg,
      overline: wa.overline,
      headline: wa.headline,
      subheadline: wa.sub,
      includeQr: wa.includeQr || false,
    });
  }

  // 6. 05-FACEBOOK-ADS & PLATFORMS
  const fbAds = [
    { name: 'fb_feed_ad_1080x1350', bg: BG_HERO, w: 1080, h: 1350, overline: 'GLA UNIVERSITY SPECIAL', headline: 'CAMPUS OFF. MOUNTAINS ON.', sub: '6 Days / 5 Nights Manali × Kasol. Direct bus from campus gate.' },
    { name: 'fb_square_ad_1080x1080', bg: BG_KASOL, w: 1080, h: 1080, overline: 'ALL-INCLUSIVE TRAVEL', headline: 'THE HONEST HIMACHAL EXPEDITION: ₹6,200.', sub: 'Stays, coach transit, meals & local guidance included.' },
    { name: 'fb_cover_1640x624', bg: BG_HERO, w: 1640, h: 624, overline: 'OFFICIAL EXPEDITION COMMUNITY', headline: 'HIMALAYAN ESCAPE 2026', sub: 'Manali × Kasol • 6 Days / 5 Nights • Direct From GLA University Mathura' },
    { name: 'fb_landscape_ad_1200x628', bg: BG_SOLANG, w: 1200, h: 628, overline: 'EXPEDITION ROUTE', headline: 'MANALI × KASOL: 6 DAYS / 5 NIGHTS.', sub: 'Reserve with ₹1,000 today. Direct coach departure from GLA University.' },
    { name: 'fb_website_banner_1920x600', bg: BG_HERO, w: 1920, h: 600, overline: 'OFFICIAL RESERVATION PORTAL', headline: 'THE GREAT ESCAPE 2026 IS LIVE.', sub: 'Reserve your verified coach seat with just ₹1,000 deposit.' },
    { name: 'fb_community_announcement_1080x1080', bg: BG_TOSH, w: 1080, h: 1080, overline: 'CAMPUS COMMUNITY', headline: '25 PASSENGER SEATS PER COACH.', sub: 'Safe, verified, student-led travel with live seat selection.' },
  ];

  for (const fb of fbAds) {
    await renderCreative({
      outputSubdir: '05-facebook-ads',
      filenameBase: fb.name,
      width: fb.w,
      height: fb.h,
      bgImage: fb.bg,
      overline: fb.overline,
      headline: fb.headline,
      subheadline: fb.sub,
    });
  }

  // 7. 06-CAROUSEL CAMPAIGNS (1080x1350 slides)
  // Campaign 1: Routine Escape (8 slides)
  const c1Slides = [
    { num: '01', title: 'CAMPUS OFF. MOUNTAINS ON.', sub: 'The Student Guide to Escaping Routine in 6 Days.' },
    { num: '02', title: 'THE 8 AM LECTURE CYCLE.', sub: 'Assignments, continuous exams, and campus monotony.' },
    { num: '03', title: 'WHY COLLEGE TRIPS DIE IN CHATS.', sub: 'Nobody wants to collect money. Logistics are exhausting.' },
    { num: '04', title: 'THE HIMALAYAN ESCAPE SOLUTION.', sub: 'We manage luxury coach transit, verified stays, and food.' },
    { num: '05', title: 'THE ROUTE: MANALI × KASOL.', sub: 'Solang snow ridges by day, Parvati river mist by night.' },
    { num: '06', title: 'TRANSPARENT PRICING: ₹6,200.', sub: 'All-inclusive. No asterisks. No hidden costs.' },
    { num: '07', title: 'LOCK SEAT WITH ₹1,000 TODAY.', sub: 'Pay the rest before boarding. Low financial barrier.' },
    { num: '08', title: 'MAKE IT HAPPEN: BOOK TODAY.', sub: 'himalaya-escape.vercel.app • Pick your coach seat.' },
  ];

  for (const cs of c1Slides) {
    await renderCreative({
      outputSubdir: '06-carousel/campaign-1-routine-escape',
      filenameBase: `slide_${cs.num}`,
      width: 1080,
      height: 1350,
      bgImage: BG_HERO,
      overline: `SLIDE ${cs.num}/08 • THE GREAT ESCAPE`,
      headline: cs.title,
      subheadline: cs.sub,
      ctaText: 'Swipe ➔ himalaya-escape.vercel.app',
    });
  }

  // Campaign 2: Pricing Breakdown (7 slides)
  const c2Slides = [
    { num: '01', title: 'WHERE DOES YOUR ₹6,200 GO?', sub: 'Full honest transparency for college travellers.' },
    { num: '02', title: 'LUXURY COACH TRANSIT.', sub: 'Direct from GLA University campus gates to Himachal and back.' },
    { num: '03', title: 'VERIFIED MOUNTAIN STAYS.', sub: 'Comfortable, vetted hotel rooms in Manali & Kasol.' },
    { num: '04', title: 'NUTRITIOUS DAILY MEALS.', sub: 'Warm mountain meals so you never worry about breakfast or dinner.' },
    { num: '05', title: 'COMPLETE SIGHTSEEING ROUTE.', sub: 'Solang Valley, Old Manali, Parvati River, Manikaran Sahib.' },
    { num: '06', title: 'THE ₹1,000 DEPOSIT ADVANTAGE.', sub: 'Lock your seat today. Balance ₹5,200 due before departure.' },
    { num: '07', title: 'ZERO HIDDEN FEES GUARANTEE.', sub: 'Reserve your verified seat at himalaya-escape.vercel.app' },
  ];

  for (const cs of c2Slides) {
    await renderCreative({
      outputSubdir: '06-carousel/campaign-2-pricing-breakdown',
      filenameBase: `slide_${cs.num}`,
      width: 1080,
      height: 1350,
      bgImage: BG_SOLANG,
      overline: `SLIDE ${cs.num}/07 • HONEST COST BREAKDOWN`,
      headline: cs.title,
      subheadline: cs.sub,
      ctaText: 'himalaya-escape.vercel.app',
    });
  }

  // Campaign 3: Manali Kasol Guide (8 slides)
  const c3Slides = [
    { num: '01', title: 'MANALI × KASOL: 6 DAYS BLUEPRINT.', sub: 'Your complete day-by-day expedition walkthrough.' },
    { num: '02', title: 'DAY 1: LEAVING GLA CAMPUS.', sub: 'Evening departure on luxury coach from campus gate.' },
    { num: '03', title: 'DAY 2: OLD MANALI & HADIMBA.', sub: 'Wake up to crisp cedar air and mountain cafes.' },
    { num: '04', title: 'DAY 3: SOLANG VALLEY SNOW.', sub: 'High-altitude snow landscapes and Atal Tunnel vistas.' },
    { num: '05', title: 'DAY 4: ENTERING PARVATI VALLEY.', sub: 'Chalal suspension bridge, Kasol pines, and Manikaran springs.' },
    { num: '06', title: 'DAY 5: RIVERSIDE SERENITY.', sub: 'Riverside relaxation, starlit night skies, and camp vibes.' },
    { num: '07', title: 'DAY 6: RETURN TO CAMPUS.', sub: 'Head back to GLA with memories that last a lifetime.' },
    { num: '08', title: 'RESERVE YOUR SEAT TODAY.', sub: '₹6,200 all-in • ₹1,000 deposit • himalaya-escape.vercel.app' },
  ];

  for (const cs of c3Slides) {
    await renderCreative({
      outputSubdir: '06-carousel/campaign-3-manali-kasol-guide',
      filenameBase: `slide_${cs.num}`,
      width: 1080,
      height: 1350,
      bgImage: BG_KASOL,
      overline: `SLIDE ${cs.num}/08 • EXPEDITION ITINERARY`,
      headline: cs.title,
      subheadline: cs.sub,
      ctaText: 'himalaya-escape.vercel.app',
    });
  }

  console.log('✅ ALL CAMPAIGN CREATIVES RENDERED AND SAVED SUCCESSFULLY!');
}

generateAll().catch(console.error);
