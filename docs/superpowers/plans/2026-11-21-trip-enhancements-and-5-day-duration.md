# Trip Enhancements, Zero-Lag Booking, Offers & 5-Day Duration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver ultra-fast zero-lag bus seat booking, canonical pricing with ₹1,000 reservation advance and student offers, an editorial mountain/snow-chill hero section with seamless contact dock, simplified elegant admin panel, and synchronize the entire platform to a 5 Days / 4 Nights expedition format.

**Architecture:**
- **Zero-Lag Seat Picker:** Move to optimistic instantaneous local selection (<10ms) with animated state badges, silent background hold sync, debounced DB cleanup, and cached seat statuses.
- **Pricing & Student Offers:** Standardize ₹1,000 advance reserve + ₹5,200 gate balance (₹6,200 total single). Introduce Duo Explorer (₹5,999/head) and Squad Cabin (₹5,800/head) offers with full Admin Config editing and database persistence.
- **Hero Redesign & Atmosphere:** Seamless floating frosted-glass coordinator dock (`backdrop-blur-2xl bg-white/[0.05]`), multi-depth snowfall simulation with ice crystals (`SnowEffect.tsx`), glacial ambient lighting, and CSS micro-animations.
- **5-Day Expedition Alignment:** Update metadata, itinerary (Days 1–5), inclusions, headers, badges, and booking documents from 6D/5N to 5D/4N.
- **Admin Polish & Bug Fixes:** Streamline dashboard navigation, enhance card hierarchy, eliminate any contrast issues, and enforce strict input validation.

**Architecture Diagram:**

```mermaid
graph TD
    subgraph "Client Layer"
        H[Hero Section & Seamless Contact Dock]
        SB[Zero-Lag Seat Picker · Optimistic UI <10ms]
        OF[Dynamic Student Offers Display]
        AD[Refined Admin Control Room]
    end

    subgraph "Server & Cache"
        API_SEATS[/api/seats/status · Throttled Clean]
        API_HOLD[/api/seats/hold · Async Transaction]
        API_CONFIG[/api/admin/config · Offers & Pricing]
    end

    subgraph "Database & Storage"
        DB[(PostgreSQL · Supabase)]
    end

    H --> OF
    SB -->|Instant UI Feedback| SB
    SB -->|Async Background Hold| API_HOLD
    API_HOLD --> DB
    API_SEATS --> DB
    AD --> API_CONFIG
    API_CONFIG --> DB
```

**Tech Stack:** Next.js 16.4.6, React 19, Tailwind CSS v4, Prisma, PostgreSQL / Supabase, Lucide React, HTML5 Canvas.

**Spec:** Direct user requirements from chat turn 2026-11-21.

## Global Constraints
- Next.js must remain on 16.4.6 with zero security advisories.
- Flat single ticket total price: ₹6,200.
- Advance reservation deposit: ₹1,000 per traveller.
- Remaining gate balance: ₹5,200 (or discounted balance for squad offers).
- Trip duration: 5 Days / 4 Nights.
- Zero data loss on production database.

---

### Task 1: 5-Day Expedition Synchronization Across Codebase
- [ ] Update `src/lib/constants.ts` (`TRIP_METADATA.duration = '5 DAYS • 4 NIGHTS'`, update `ITINERARY_DAYS` to 5 days, adjust inclusions).
- [ ] Update `src/lib/trip-config-shared.ts` default duration to `'5 Days / 4 Nights'`.
- [ ] Update `src/app/page.tsx` hero badges and labels from 6 days / 5 nights to 5 days / 4 nights.
- [ ] Update `src/components/Navbar.tsx` brand subtitle to `5D / 4N • MANALI × KASOL EXPEDITION`.
- [ ] Update `src/app/trip/page.tsx`, `src/app/inclusions/page.tsx`, `src/components/BookingFlow.tsx`, `src/components/DestinationCarousel.tsx`, and `src/app/ticket/[token]/page.tsx`.

### Task 2: Ultra-Fast, Zero-Lag Bus Seat Booking System
- [ ] Throttle `cleanExpiredHolds` in `src/lib/server-utils.ts` to run at most once per 20 seconds.
- [ ] Optimize `src/app/api/seats/status/route.ts` with in-memory caching and reduced DB overhead.
- [ ] Upgrade `src/components/BusSeatMap.tsx`:
  - Instant optimistic toggle on seat click/touch (<10ms UI update).
  - Background asynchronous `/api/seats/hold` call without blocking UI or triggering `setLoading(true)`.
  - Graceful rollback if a seat is conflicted.
  - Active seat animation and haptic/visual highlight.

### Task 3: Pricing System & Student Offers (Admin Editable)
- [ ] Update `src/lib/constants.ts` and `src/lib/trip-config-shared.ts` to support Duo (₹5,999/head) and Squad (₹5,800/head) offers.
- [ ] Enhance `src/components/BookingFlow.tsx` and `src/app/page.tsx` pricing display:
  - Lead with ₹1,000/- advance reservation deposit to book.
  - Solo traveller total: ₹6,200/- (Remaining ₹5,200 at gate).
  - Duo Explorer & Squad Cabin offer cards with live calculation.
- [ ] Enhance `src/components/admin/TripPricingConfigTab.tsx` with dedicated controls to modify Single Price, Deposit, Duo Price, and Squad Cabin Price with live DB sync.

### Task 4: Hero Redesign — Seamless Contact Dock & Alpine Mountain/Snow Vibe
- [ ] Redesign contact section in `src/app/page.tsx` into an ultra-sleek, seamless floating glassmorphic dock with active live presence indicator.
- [ ] Upgrade `src/components/SnowEffect.tsx` to include multi-depth snowfall with organic sway, ice crystal twinkle, and mountain chill aesthetic.
- [ ] Add subtle cinematic CSS keyframe animations (floating, ambient glow, pulse) and glacial backdrop accents in `src/app/globals.css`.

### Task 5: Admin Panel Elegance, Simplification & Final Verification
- [ ] Refine `src/app/admin/layout.tsx` and `src/components/admin/AdminDashboardClient.tsx` for cleaner card layout and typography.
- [ ] Verify Next.js dev server status, routes (`/`, `/book`, `/admin`, `/api/health`).
- [ ] Take visual verification screenshots to confirm UI perfection.
