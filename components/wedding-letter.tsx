import { type ReactNode } from 'react';
import { Separator } from '@/components/ui/separator';
import { COUPLE, COUPLE_NAMES, WEDDING_DATE_LABEL } from '@/lib/wedding';

const [NAME_A, NAME_B] = COUPLE_NAMES;

/**
 * The long-form wedding letter — the page content that rises out of the
 * envelope. Reads like a one-column wedding website (narrow letter width):
 * hero, story, photos, schedule, travel, stay, dress code, FAQ, registry —
 * and finally the RSVP section, which receives the token-dependent form /
 * greeting as `children` from app/page.tsx.
 *
 * All “photos” are decorative inline-SVG placeholders (no binary assets, no
 * remote hosts) styled as framed prints in the wisteria & fig palette.
 */

/* ── Placeholder photo art ────────────────────────────────── */

const PHOTO_PALETTES = {
  meadow: { sky: ['#e9e2f2', '#c9b9e0'], hill: '#8a76b0', glow: '#f6f0e6' },
  dusk: { sky: ['#f3e6e9', '#c9a1ad'], hill: '#6f2539', glow: '#f9efe2' },
  garden: { sky: ['#eaf0e2', '#b7c9a2'], hill: '#5f7a48', glow: '#fdf6e9' },
  sea: { sky: ['#e6ecf2', '#a9bccb'], hill: '#4a5f70', glow: '#f6efe4' },
  candle: { sky: ['#faf1dc', '#e0bd73'], hill: '#a9832f', glow: '#fff8ea' },
} as const;

function PlaceholderPhoto({
  variant,
  caption,
  wide = false,
}: {
  variant: keyof typeof PHOTO_PALETTES;
  caption: string;
  wide?: boolean;
}) {
  const p = PHOTO_PALETTES[variant];
  const id = `ph-${variant}`;
  return (
    <figure className={wide ? 'col-span-2' : ''}>
      <div className="rounded-sm border border-[#ece3ea] bg-white p-2 pb-1 shadow-[0_10px_24px_-16px_rgba(74,47,58,0.35)]">
        <svg
          viewBox="0 0 400 300"
          role="img"
          aria-label={caption}
          className="block h-auto w-full rounded-[2px]"
        >
          <defs>
            <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor={p.sky[0]} />
              <stop offset="1" stopColor={p.sky[1]} />
            </linearGradient>
            <radialGradient id={`${id}-glow`} cx="0.5" cy="0.42" r="0.5">
              <stop offset="0" stopColor={p.glow} stopOpacity="0.95" />
              <stop offset="1" stopColor={p.glow} stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="400" height="300" fill={`url(#${id}-sky)`} />
          <circle cx="200" cy="128" r="120" fill={`url(#${id}-glow)`} />
          {/* Rolling ground */}
          <path
            d="M0 232 C 90 200 150 226 220 214 C 290 202 340 216 400 204 L 400 300 L 0 300 Z"
            fill={p.hill}
            opacity="0.5"
          />
          <path
            d="M0 258 C 80 236 170 258 250 246 C 320 236 360 248 400 240 L 400 300 L 0 300 Z"
            fill={p.hill}
            opacity="0.85"
          />
          {/* Wedding arch */}
          <path
            d="M150 252 L150 150 A 50 50 0 0 1 250 150 L250 252"
            fill="none"
            stroke="#fdfaf4"
            strokeWidth="7"
            strokeLinecap="round"
            opacity="0.9"
          />
          {/* The couple, tiny silhouettes under the arch */}
          <circle cx="188" cy="196" r="9" fill="#3a2c34" />
          <path d="M177 252 C 177 220 199 220 199 252 Z" fill="#3a2c34" />
          <circle cx="213" cy="197" r="8" fill="#3a2c34" />
          <path d="M204 252 C 204 222 222 222 222 252 Z" fill="#3a2c34" />
        </svg>
      </div>
      <figcaption className="mt-1.5 text-center font-script text-lg text-[color:var(--script)]">
        {caption}
      </figcaption>
    </figure>
  );
}

/* ── Small layout helpers ─────────────────────────────────── */

function SectionHeading({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="text-center">
      <p className="font-script text-2xl leading-none text-[color:var(--script)]">
        {eyebrow}
      </p>
      <h2 className="mt-1 font-heading text-2xl tracking-wide text-foreground">
        {title}
      </h2>
    </div>
  );
}

function TimelineRow({
  time,
  what,
  detail,
}: {
  time: string;
  what: string;
  detail: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="w-16 shrink-0 pt-0.5 text-right font-heading text-sm text-[color:var(--script)]">
        {time}
      </div>
      <div className="relative border-l border-[#ece3ea] pb-6 pl-4 last:pb-0">
        <span className="absolute top-1.5 -left-[4.5px] size-2 rounded-full bg-[color:var(--primary)]" />
        <p className="font-medium text-foreground">{what}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{detail}</p>
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div>
      <p className="font-medium text-foreground">{q}</p>
      <p className="mt-1 text-sm text-muted-foreground">{a}</p>
    </div>
  );
}

/* ── The letter ───────────────────────────────────────────── */

export function WeddingLetter({ children }: { children: ReactNode }) {
  return (
    <div className="space-y-10">
      {/* Hero */}
      <header className="text-center">
        <p className="font-heading text-xs tracking-[0.3em] text-muted-foreground uppercase">
          Together with their families
        </p>
        <h1 className="mt-4 font-script text-5xl leading-tight text-[color:var(--script)]">
          {COUPLE}
        </h1>
        <p className="mt-4 font-heading text-sm tracking-[0.2em] text-foreground uppercase">
          {WEDDING_DATE_LABEL}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          The Wisteria Garden House · Karuizawa, Nagano
        </p>
        <p className="mx-auto mt-6 max-w-prose text-sm leading-relaxed text-muted-foreground">
          joyfully invite you to share in the celebration of their marriage —
          an afternoon ceremony beneath the garden wisteria, followed by
          dinner, dancing, and one very ambitious sparkler send-off.
        </p>
      </header>

      <Separator />

      {/* Our story */}
      <section className="space-y-4">
        <SectionHeading eyebrow="How it began" title="Our Story" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          We met on a rainy Tuesday in April 2019, sheltering under the same
          café awning in Nakameguro. {NAME_B} offered to share an umbrella;
          {NAME_A} pointed out it was broken. We spent the next two hours
          arguing about whether that still counted as chivalry, and the next
          six years agreeing it absolutely did.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Since then there have been four apartments, two cities, one very
          opinionated cat named Mochi, and several hundred Sunday-morning
          pancake experiments (success rate: improving). {NAME_B} proposed in
          October 2025 on the same street corner where we met — with a working
          umbrella this time, and a ring hidden in its handle.
        </p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Now we can&apos;t think of anything better than gathering everyone
          we love in one garden, under one (hopefully unnecessary) canopy of
          umbrellas, to start the next chapter together.
        </p>
      </section>

      <Separator />

      {/* Photos */}
      <section className="space-y-4">
        <SectionHeading eyebrow="A few favourites" title="Photos" />
        <div className="grid grid-cols-2 gap-3">
          <PlaceholderPhoto wide variant="meadow" caption="Karuizawa, spring 2024" />
          <PlaceholderPhoto variant="dusk" caption="The proposal" />
          <PlaceholderPhoto variant="garden" caption="Mochi, best cat" />
          <PlaceholderPhoto variant="sea" caption="Kamakura weekends" />
          <PlaceholderPhoto variant="candle" caption="Engagement dinner" />
          <PlaceholderPhoto wide variant="meadow" caption="Where we’ll say I do" />
        </div>
      </section>

      <Separator />

      {/* Schedule */}
      <section className="space-y-5">
        <SectionHeading eyebrow="The big day" title="Schedule" />
        <div>
          <TimelineRow
            time="2:00 pm"
            what="Guests arrive"
            detail="Welcome drinks on the terrace. Come early, the wisteria is showing off."
          />
          <TimelineRow
            time="2:30 pm"
            what="Ceremony"
            detail="In the garden, weather permitting — in the conservatory if it doesn’t."
          />
          <TimelineRow
            time="3:15 pm"
            what="Cocktails & photos"
            detail="Canapés, a signature yuzu spritz, and a string quartet."
          />
          <TimelineRow
            time="5:00 pm"
            what="Dinner"
            detail="Four seasonal courses in the Garden House. Dietary needs? Tell us in the RSVP."
          />
          <TimelineRow
            time="7:30 pm"
            what="First dance & party"
            detail={`The dance floor opens. ${NAME_B} has been practising. Wish them luck.`}
          />
          <TimelineRow
            time="10:00 pm"
            what="Sparkler send-off"
            detail="One last hurrah on the lawn before the shuttles depart."
          />
        </div>
      </section>

      <Separator />

      {/* Venue & travel */}
      <section className="space-y-4">
        <SectionHeading eyebrow="Getting there" title="Venue & Travel" />
        <div className="rounded-md border border-[#ece3ea] bg-[color:var(--muted)] p-4 text-center">
          <p className="font-heading text-base text-foreground">
            The Wisteria Garden House
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            1234-5 Kyu-Karuizawa, Karuizawa-machi,
            <br />
            Kitasaku District, Nagano 389-0102
          </p>
        </div>
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">By train — </span>
            Hokuriku Shinkansen from Tokyo Station to Karuizawa (≈ 70 minutes).
            The venue is a 10-minute taxi ride from the station.
          </p>
          <p>
            <span className="font-medium text-foreground">By car — </span>
            Jōshin-etsu Expressway, Usui–Karuizawa IC. Free parking on site for
            about forty cars.
          </p>
          <p>
            <span className="font-medium text-foreground">Shuttles — </span>
            Coaches run from Karuizawa Station at 1:15 pm and 1:45 pm, and
            return after the send-off at 10:15 pm.
          </p>
        </div>
      </section>

      <Separator />

      {/* Accommodation */}
      <section className="space-y-4">
        <SectionHeading eyebrow="Make a weekend of it" title="Where to Stay" />
        <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            <span className="font-medium text-foreground">
              Hoshino Resort Bleston Court
            </span>
            <br />
            Five minutes from the venue. Mention “{COUPLE}” for the wedding
            rate until March 1st.
          </p>
          <p>
            <span className="font-medium text-foreground">
              Karuizawa Prince Hotel East
            </span>
            <br />
            Near the station and the outlet mall, if you fancy some shopping
            the morning after.
          </p>
          <p>
            <span className="font-medium text-foreground">
              Guesthouse Shirakaba
            </span>
            <br />
            A cosy budget option in the old town — book early, it only has
            eight rooms.
          </p>
        </div>
      </section>

      <Separator />

      {/* Dress code */}
      <section className="space-y-3">
        <SectionHeading eyebrow="What to wear" title="Dress Code" />
        <p className="text-center text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Garden formal.</span>
          {' '}Suits and spring dresses; think soft colours — wisteria purples,
          sage, cream — and shoes that forgive grass. April evenings in
          Karuizawa turn cool, so bring a layer for the terrace.
        </p>
      </section>

      <Separator />

      {/* Location */}
      <section className="space-y-4">
        <SectionHeading eyebrow="Where we’ll be" title="Location" />
        <div className="relative overflow-hidden rounded-md border border-[#ece3ea] bg-[#a9bccb] shadow-[0_10px_24px_-16px_rgba(74,47,58,0.35)]">
          {/* Beach backdrop for the whole section. Drop the palm-beach photo at
              public/beach-location.jpg; the tropical gradient shows until then. */}
          <div
            aria-hidden
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage:
                "linear-gradient(180deg, rgba(35,58,74,0.55) 0%, rgba(35,58,74,0.32) 45%, rgba(35,58,74,0.72) 100%), linear-gradient(180deg, #7fb6c9 0%, #cfe6dd 55%, #f3e6cf 100%), url('/beach-location.jpg')",
            }}
          />
          <div className="relative p-4 sm:p-5">
            <p className="text-center font-heading text-lg text-white drop-shadow-[0_1px_6px_rgba(35,58,74,0.6)]">
              Anvy Beach Resort
            </p>
            <p className="mt-1 text-center text-sm text-white/90 drop-shadow-[0_1px_6px_rgba(35,58,74,0.6)]">
              Where we’ll say “I do,” toes in the sand.
            </p>
            <div className="mt-4 overflow-hidden rounded-sm border border-white/50 shadow-[0_10px_24px_-16px_rgba(35,58,74,0.6)]">
              <iframe
                title="Map — Anvy Beach Resort"
                src="https://www.google.com/maps?q=Anvy+Beach+Resort&output=embed"
                className="block h-64 w-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
            <div className="mt-3 text-center">
              <a
                href="https://www.google.com/maps/place/Anvy+Beach+Resort+(Resort+Hotel)/data=!4m2!3m1!1s0x0:0x97f91a6833d5039d?sa=X&ved=1t:2428&ictx=111"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 rounded-full bg-white/90 px-4 py-1.5 text-sm font-medium text-[color:var(--foreground)] shadow-sm transition hover:bg-white"
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        </div>
      </section>

      <Separator />

      {/* FAQ */}
      <section className="space-y-5">
        <SectionHeading eyebrow="Good to know" title="Questions" />
        <div className="space-y-4">
          <Faq
            q="Can I bring a plus one?"
            a="Your invitation covers the number of seats shown in the RSVP form below. If your plans change, just let us know — we’ll do our best."
          />
          <Faq
            q="Are children welcome?"
            a="Absolutely — the RSVP form asks how many little ones are coming so we can set up the kids’ table (crayons provided)."
          />
          <Faq
            q="What if it rains?"
            a="The ceremony moves into the glass conservatory — arguably even prettier, and considerably drier. It is how we met, after all."
          />
          <Faq
            q="Is there parking?"
            a="Yes, free on site. If you plan to enjoy the toasts, the shuttles back to the station run until 10:15 pm."
          />
          <Faq
            q="Can I take photos?"
            a="During the ceremony we’d love you to be fully with us — our photographer has it covered. Afterwards, snap away and share generously."
          />
          <Faq
            q="When should I RSVP by?"
            a="Please reply by March 1st, 2027 so we can finalise seating and the menu with the venue."
          />
        </div>
      </section>

      <Separator />

      {/* Registry */}
      <section className="space-y-3">
        <SectionHeading eyebrow="Gifts" title="Registry" />
        <p className="text-center text-sm leading-relaxed text-muted-foreground">
          Your presence is truly the only present we need. If you’d like to
          mark the day, a small contribution to our honeymoon fund — three
          weeks chasing spring across Portugal — would make us very happy.
          Details will be at the welcome table.
        </p>
      </section>

      <Separator />

      {/* RSVP — always the last section; content is token-dependent. */}
      <section id="rsvp" className="space-y-4">
        <SectionHeading eyebrow="Kindly reply" title="RSVP" />
        <p className="text-center text-sm text-muted-foreground">
          Please respond by March 1st, 2027.
        </p>
        {children}
      </section>
    </div>
  );
}
