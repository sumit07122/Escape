# Himalayan Escape — Booking System Optimization & Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Himalayan Escape expedition portal booking experience into a fast, mobile-first, 3-step conversion-focused journey with automatic seat allocation, instant pricing, non-blocking auth, sticky mobile CTA, and verified real-time hero stats.

**Architecture:** Streamline the 6-step flow into 3 high-conversion steps (Select Travellers -> Passenger Details -> Smart Seats & Pay). Shift the heavy 25-seat bus SVG map off the critical path via a new server-side auto-allocation engine that reserves best adjacent seats by default with optional on-demand map customization. Pass server-rendered `tripConfig` into the booking component to eliminate client fetch waterfalls, and integrate a sticky bottom CTA for mobile devices.

**Architecture Diagram:**

```mermaid
graph TD
    subgraph "Server Layer"
        Page[src/app/book/page.tsx] -->|Initial tripConfig| Flow[src/components/BookingFlow.tsx]
        Hero[src/app/page.tsx] -->|Single SSOT query| SSOT[src/lib/trip-config.ts]
        AutoAPI[/api/seats/auto-assign] -->|Best adjacent seats| BusLib[src/lib/bus-seating.ts]
        OrderAPI[/api/bookings/create-order] -->|Idempotent Order| RZP[Razorpay SDK]
    end

    subgraph "Client 3-Step Journey"
        Flow --> Step1[Step 1: 1-6 Pax Stepper & Instant Pricing]
        Step1 --> Step2[Step 2: Lead + Compact Pax + Shared Emergency]
        Step2 --> Step3[Step 3: Auto-Allocated Seats + Lazy Seat Map + Pay]
        Step3 --> StickyCTA[Sticky Mobile Bottom Action Bar]
        Step3 --> RZPCheckout[Razorpay Modal]
    end
```

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, Prisma ORM 6, Razorpay, Google People API.

**Spec:** `# HIMALAYAN ESCAPE — BOOKING SYSTEM OPTIMIZATION & REBUILD`

## Global Constraints

- Preserve forest green (`#163C32`), burnt orange (`#D87945`), cream (`#F7F5EF`), and border (`#D8D2C4`) design system tokens.
- Preserve existing Razorpay credentials, QR ticket generation, Google Contacts integration, and admin portal.
- Keep server-authoritative pricing (never trust frontend totals for Razorpay orders).
- Strict 10-minute atomic seat hold with countdown and automatic release.
- Pricing rules: ₹6,200 per traveller for 5+ groups; ₹6,500 standard; ₹1,000 reservation deposit; ₹5,200 remaining balance.

## Review Focus

1. Mobile viewport collision: Sticky bottom bar must not obstruct form inputs or break when virtual keyboard opens.
2. Group adjacent seat allocation: 2-6 travellers must get clustered/paired seats in Coach 1 without race condition collisions.
3. Form validation ergonomics: Inline field errors without alert modals; shared emergency contact must properly populate database payload.
4. Duplicate payment prevention: User double-tapping "Pay Reservation" must not create multiple orders.
5. In-memory Google Contacts security: Access tokens must remain strictly in memory and never touch storage or logs.

---

### Task 1: Backend Smart Seat Auto-Allocation Engine & API

**Files:**
- Modify: `src/lib/bus-seating.ts`
- Create: `src/app/api/seats/auto-assign/route.ts`
- Modify: `src/app/api/bookings/create-order/route.ts`
- Test: `src/server/test-seat-allocation.js`

**Interfaces:**
- `allocateBestSeats(busId: string, count: number, preference?: SittingPreference): Promise<string[]>`
- Endpoint `POST /api/seats/auto-assign` -> `{ success: boolean, busId: string, seatNumbers: string[], heldSecondsRemaining: number }`

- [ ] Add `findBestAdjacentSeats` algorithm in `src/lib/bus-seating.ts` prioritizing paired rows (L1-L2, R1-R2, etc.) and back bench (B1-B5).
- [ ] Create `POST /api/seats/auto-assign` route that finds best seats on active coach, creates 10-minute hold for `bookingSessionId`, and returns busId and seat numbers.
- [ ] Update `src/app/api/bookings/create-order/route.ts` to support both pre-held seats and auto-allocation fallback if `selectedSeats` is omitted or empty.
- [ ] Write `src/server/test-seat-allocation.js` to verify adjacent seat allocation for 1, 2, 4, and 5 travellers. Run with `node src/server/test-seat-allocation.js`.

---

### Task 2: Fast 3-Step Client Booking Flow Rebuild

**Files:**
- Modify: `src/components/BookingFlow.tsx`
- Modify: `src/app/book/page.tsx`

**Interfaces:**
- `<BookingFlow initialConfig?: TripConfigData />`

- [ ] Pass `tripConfig` as `initialConfig` prop from `src/app/book/page.tsx` into `<BookingFlow />`.
- [ ] Rebuild Step 1:
  - Clean 1–6 passenger stepper with instant client-side math (Total ₹6,200/pax for 5+ / ₹6,500 standard, Deposit ₹1,000/pax, Balance ₹5,200/pax).
  - Instant breakdown table (no network loading).
- [ ] Rebuild Step 2:
  - Lead traveller full contact (Name, Phone, Email, Gender).
  - Compact additional passenger cards (Name, Phone, Gender, optional Student Roll No).
  - Single "Use same emergency contact for all travellers" checkbox (reduces form from 35 fields down to 10 for a party of 5).
  - Inline Google Contacts autofill modal hook.
  - Seamless dual-auth / login helper that doesn't navigate away or reset form state.
- [ ] Rebuild Step 3:
  - Display auto-assigned seats immediately upon entry to Step 3 with a badge ("Coach 1 · L1, L2 · Best adjacent seats reserved").
  - Collapsible toggle: "Need specific seats? Open coach seat map" which lazy-mounts `BusSeatMap` only on user interaction.
  - Clean review card with expedition details, passenger list, breakdown, promo code, and Razorpay CTA.
  - Disable button during `isProcessingPayment` with spinner.

---

### Task 3: Mobile Sticky Action Bar & Touch Ergonomics

**Files:**
- Modify: `src/components/BookingFlow.tsx`

- [ ] Implement fixed bottom bar on screens `<640px` displaying `Current Step Summary · ₹[Deposit] due` and a prominent `Continue` / `Pay` button.
- [ ] Add `pb-28 sm:pb-8` container padding to prevent sticky bar from covering inputs or buttons.
- [ ] Add `inputMode="tel"`, `inputMode="email"`, and standard autocomplete attributes to all form inputs.
- [ ] Ensure tap targets are minimum 44px × 44px for smooth mobile touch.

---

### Task 4: Homepage Hero Live Booking Stats Synchronization

**Files:**
- Modify: `src/app/page.tsx`

- [ ] Ensure single SSOT database lookup for confirmed capacity and remaining seats.
- [ ] Align hero pricing badges: "Reserve · ₹1,000 advance", "Total ₹6,200 group rate (₹6,500 standard)", "6 Days / 5 Nights".
- [ ] Ensure live available seats count badge displays accurate capacity.

---

### Task 5: End-to-End Verification & QA Suite

**Files:**
- Create: `src/server/test-booking-rebuild.js`

- [ ] Run `npm.cmd run typecheck` (`tsc --noEmit`).
- [ ] Run `node src/server/test-seat-allocation.js`.
- [ ] Run `node src/server/test-booking-rebuild.js` covering pricing calculations, order generation, seat assignment, and payment verification idempotency.
- [ ] Run `node src/server/test-google-contacts.js` (ensuring 34/34 tests pass).
- [ ] Run `npm.cmd run build` to confirm clean production compilation with Turbopack.
- [ ] Generate comprehensive final engineering report.
