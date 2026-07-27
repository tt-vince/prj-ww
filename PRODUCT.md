# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

**Primary: invited wedding guests.** Each guest receives a personalized capability link
(`?id=<token>`) sent through chat — Messenger or Instagram — and opens it on their phone,
usually one-handed, often mid-conversation. A meaningful minority later open the same link on
a desktop browser. Both breakpoints matter; the phone is the first read.

Guests arrive to answer one question ("are you coming?") and to look up practical details
(when, where, what to wear, where to stay) repeatedly over the months before the wedding.

**Secondary: the couple and their admins**, who use the Google-authenticated dashboard at
`/dashboard`. **Out of scope for design work — see Capabilities and Constraints.**

## Product Purpose

An invite-only wedding site. The couple pre-registers each invitee (a party/household) in the
admin dashboard, which mints a per-person link. The guest opens their link, reads the wedding
letter, and submits attendance plus head-count and dietary needs.

Success: every invited party opens their link and submits a reply without asking a follow-up
question, and returns to it later for logistics instead of messaging the couple.

## Positioning

Not a generic RSVP form. The guest-facing top page is a **single long-form letter** — hero,
countdown, our story, the day itself, attire, location, hotels, RSVP, gifts, FAQ — read top to
bottom as one continuous document, with the reply embedded near the end rather than sitting on
its own page. Personal correspondence that happens to collect data.

## Operating Context

- Distribution is chat-app links, not email. No notifications, no guest accounts; the token in
  the URL is the entire identity mechanism.
- Guests may share their link, lose it, or reopen it many times over ~9 months.
- Sections are full-bleed and deliberately overlap; the page scrolls natively as one document
  (`components/letter/wedding-letter.tsx` composes the `components/letter/*` sections).

## Capabilities and Constraints

**Design scope is the top page only** (`app/page.tsx` → `components/letter/wedding-letter.tsx` and
everything under `components/letter/`). **Do not touch `/dashboard` or `/login`** — those follow
imported hi-fi Claude Design files and are settled.

- Next.js 16 App Router (root `app/`, no `src/`), React 19, Tailwind v4, TypeScript, pnpm.
  Next 16 conventions differ from older training data — read `node_modules/next/dist/docs/`
  before writing framework code.
- shadcn/ui (base-ui, `nova` preset) is the component baseline; check shadcn before hand-rolling.
- `motion` (v12) is available and already used for scroll-reveal animations.
- The page shell stays statically prerendered (Cache Components / PPR); only the RSVP body
  streams in under Suspense. Design work must not force the shell dynamic.
- Guest replies: `going` / `not_going` only, with `adults` + `kids` bounded by the party's
  `max_guests`, plus dietary presets and free text.
- No i18n, no guest login, no email confirmations, no RSVP editing after submit.
- Retired but kept for reuse: `components/letter/envelope-reveal.tsx`; the vinyl player (`components/letter/vinyl-player.tsx`) spins in the countdown band.
  The envelope-intro scroll approach was tried and reverted — do not reintroduce it unasked.
- `docs/rsvp-spec.md` is the source of truth for data model, DTOs, and admin behavior; keep it
  in sync when a decision there changes.

## Brand Commitments

- **Colors are locked: the home page is white + ink, with three named exceptions.** The guest
  letter (`app/page.tsx` → `components/letter/wedding-letter.tsx` → `components/letter/*`) uses **white
  `#ffffff` and ink `#1E2A18`** for everything except the three cases listed under "Granted
  exceptions" below — anything not on that list is one of the two colours at FULL strength: no
  tints, no thinned ink, no `ink/70`-style tiers. Whatever was green before is now exactly
  `#1E2A18`.
  Hierarchy comes from size, face and weight — never from tone. No greens (`#2C3F25`, `#556D47`, `#91A17C`), creams
  (`#f5efdd`, `#e6e8d0`), or blues (`#1f4453`, `#142a36`); those are gone from the letter.
  Shadows are ink-tinted (`rgba(30,42,24,…)`), not black.
  - Implementation: `--ink: #1e2a18` and the `--color-ink` theme key live in `app/globals.css`;
    the `.letter-theme` scope re-points the shadcn tokens (`foreground`, `primary`, `muted-
    foreground`, `border`, `input`, `ring`, `destructive`, `script`…) onto white + ink for that
    subtree, so shadcn components used inside the letter need no per-component colour. Use the
    `text-ink` / `bg-ink` / `border-ink` utilities with opacity modifiers — don't reintroduce
    hex literals.
  - Alpha survives where it is physically a scrim or a shadow: the hero's overlay on the
    lily photo, the frosted lace window, and box-shadows (ink-tinted). Otherwise text, rules,
    fills, borders and icons are full white or full ink — the RSVP form's `ink/20` rules and
    card frames are the single exception, granted below.
  - The one exception to ink-tinting is the hero photo scrim, which is neutral `bg-black/50`:
    ink-tinting it cast a green wash over the lily photograph, and a scrim's job is to darken
    the image, not to colour it.
  - Two-colour consequences to respect rather than work around: hover states invert
    (`hover:bg-white hover:text-ink`) instead of tinting; placeholder fills are hairline stripes
    of one colour on the other, not a wash.
  - **Granted exceptions — the complete list. Nothing else may be added without the couple's
    say-so; "there is already an exception" is not an argument for a fourth.**
    1. **The RSVP form's section rules are thinned ink (`ink/20`).** Approved 2026-07-27. Five
       full-ink hairlines inside one small card read as heavier than the answers they separate.
       Applies to the rules dividing the form's sections and the companion cards' frames
       (`components/letter/rsvp-form.tsx`, `components/letter/rsvp-reply.tsx`) — **not** to rules
       anywhere else in the letter, which stay full ink on white.
    2. **Required marks are red (`--mark-required: #a4322b`).** Approved 2026-07-27. A brick red
       muted towards the ink's olive so it sits in the letter rather than shouting over it.
    3. **Error states are that same red**, via `.letter-theme`'s `--destructive`, which now
       points at `--mark-required` so shadcn's `aria-invalid:border-destructive` and
       `text-destructive` mark the offending field. Approved 2026-07-27.

    Both red cases are bound by the same rule: **red never carries meaning on its own.** A
    required mark is `aria-hidden` beside a real `required` attribute plus visually hidden
    "(required)" text; every error is also stated in words through `role="alert"`, and the
    form's send button is disabled with its reasons spelled out. Remove the colour and the form
    still tells the guest exactly what is wrong. `#a4322b` on white is 6.4:1, so it passes AA as
    text in its own right.
  - **Exempt:** photographs (`/hero-lily.jpg`, `/beach-location.jpg`, the picsum stand-ins) and
    `public/attire-guide.png`, which is a multi-colour palette illustration and is the content.
    Everything else drawn in CSS or SVG obeys the two colours plus the granted exceptions above.
- **The dashboard keeps "wisteria & fig."** The `:root` token set in `app/globals.css` is
  binding for `/dashboard` and `/login` and must not be retuned to match the letter.
- **Section set and order are locked.** Hero, countdown band, our story, the day itself, attire
  guide, location, hotels, RSVP, gifts, FAQ.
- **Copy is not locked** — all guest-facing content is draft and may be rewritten.
- Type stack in use: DM Sans (`--font-sans`), Gilda Display (`--font-serif`/headings),
  Parisienne (`--font-script`, couple's names), Playwrite US Modern (`--font-countdown`),
  Beth Ellen (`--font-hand`, casual handwriting — loaded, not yet applied anywhere).
- Florals: vines must sit on a component's real border (edge-anchored), never float near
  corners. No hand-rolled SVG floral path art — use real assets or minimal geometry.

## Evidence on Hand

- Real: the palette, the section structure, the working RSVP pipeline, the admin dashboard.
- **Placeholder — never present as fact, never invent replacements:**
  - Couple names `Hyuwu & Empty` and the date `2027-04-10` (`lib/wedding.ts`).
  - Venue, hotels, and attire content in the letter sections.
  - Our-story text, FAQ answers, gift details.
- No photographs of the couple exist in the repo yet. Do not fabricate imagery, quotes, vendor
  names, or logistics.

## Product Principles

1. **The reply is the job.** Judge every decision by whether a guest on a phone finishes the
   RSVP without confusion.
2. **One letter, not a site.** Continuity between sections beats navigational chrome.
3. **Provisional to us, never to the guest.** Design around the real shape of the content;
   never invent facts to fill a layout.
4. **Guest page only.** The dashboard is a separate, finished visual world; do not bleed changes
   across.
5. **Mobile is the design, desktop is the adaptation** — not the reverse.

## Accessibility & Inclusion

Guests span a wide age range and open the page inside chat-app in-app browsers. Tap targets must
be generous, no essential action may depend on hover or a hidden gesture, and text must stay
legible over the gradient and floral layers. Respect `prefers-reduced-motion` for the scroll
reveals and countdown.
