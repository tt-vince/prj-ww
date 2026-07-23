import { cn } from '@/lib/utils';
import { COUPLE_NAMES } from '@/lib/wedding';

const [NAME_A, NAME_B] = COUPLE_NAMES;

/**
 * Our story — EDGE-TO-EDGE green dome (kept: its `-mt-48` pulls up into the
 * Hero's lily backdrop, and DayItself slides up behind it at z-0). Inside the
 * dome the timeline is a SCRAPBOOK (imported design "Wedding Timeline" 4a/5a),
 * recoloured into the green palette:
 *
 *   • a hand-drawn camera charm hangs over the top of a centre thread;
 *   • each memory is a tilted cream polaroid held by a strip of washi tape,
 *     with a handwritten caption and a small heart bead on the thread;
 *   • desktop (sm+) = design 4a: continuous centre spine, rows alternate
 *     left/right, text hugs the spine;
 *   • mobile = design 5a: a single centred column, camera on top, polaroids
 *     strung straight down the thread.
 *
 * Photos are real-image slots (`image`): drop a file in and it replaces the
 * striped placeholder; until then the placeholder shows.
 */

type Memory = {
  date: string;
  title: string;
  body: string;
  /** Handwritten note across the bottom of the polaroid. */
  caption: string;
  /** Optional real photo (e.g. `/story/umbrella.jpg`). Placeholder until set. */
  image?: string;
  /** Polaroid tilt + washi-tape tilt, in degrees (from the source design). */
  tilt: number;
  tape: number;
};

const MEMORIES: Memory[] = [
  {
    date: 'April 2019',
    title: 'A broken umbrella',
    body: `${NAME_B} and ${NAME_A} shelter under the same café awning in Nakameguro. The offered umbrella turns out to be broken — the argument about whether it still counts as chivalry lasts two hours.`,
    caption: 'the café awning ♡',
    tilt: -2.4,
    tape: -4,
  },
  {
    date: 'September 2020',
    title: 'First apartment',
    body: 'Two suitcases, one very small kitchen, and a shared conviction that a rice cooker counts as furniture.',
    caption: 'moving day',
    tilt: 2,
    tape: 5,
  },
  {
    date: 'June 2022',
    title: 'Enter Mochi',
    body: 'A very opinionated cat adopts us. Sunday-morning pancake experiments begin in earnest (success rate: improving).',
    caption: 'Mochi arrives ♡',
    tilt: 1.6,
    tape: -3,
  },
  {
    date: 'October 2025',
    title: 'The proposal',
    body: 'Back on the same street corner where it began — with a working umbrella this time, and a ring hidden in its handle.',
    caption: 'same corner ♡',
    tilt: -1.8,
    tape: 4,
  },
  {
    date: 'Next summer',
    title: 'The next chapter',
    body: 'Gathering everyone we love in one garden, under one hopefully unnecessary canopy of umbrellas.',
    caption: 'the garden',
    tilt: 2.2,
    tape: -5,
  },
];

export function OurStory() {
  return (
    <section className="relative z-10 -mt-48">
      <div className="rounded-[50%_50%_50%_50%_/_180px_180px_180px_180px] bg-[#2C3F25] px-5 pt-28 pb-20 text-center sm:px-9 sm:pt-32 sm:pb-24">
        <div className="mx-auto max-w-[64rem]">
          <div className="text-center">
            <h2 className="font-script text-4xl leading-tight text-[#91A17C] sm:text-5xl">
              Our Story
            </h2>
            <p className="mt-2 font-countdown text-sm tracking-wide text-[#f5efdd]">
              How it began
            </p>
          </div>

          {/* Scrapbook thread. Camera charm hangs over the top; the spine runs
              down the centre on sm+, and on mobile the per-item connector
              segments join into one continuous centre thread. */}
          <div className="relative mx-auto mt-24 max-w-[52rem] sm:mt-28">
            {/* Hand-drawn camera charm, centred over the top of the thread. */}
            <CameraCharm className="pointer-events-none absolute left-1/2 top-0 z-20 w-24 -translate-x-1/2 -translate-y-[85%] sm:w-32" />

            {/* Continuous centre spine (sm+ only). On mobile the thread is
                drawn by each item's own connector segment instead. */}
            <span
              aria-hidden
              className="absolute top-0 bottom-4 left-1/2 hidden w-[3px] -translate-x-1/2 rounded-full bg-white/60 sm:block"
            />

            <ol className="space-y-6 sm:space-y-0">
              {MEMORIES.map((m, i) => {
                const imageLeft = i % 2 === 0;
                return (
                  <li
                    key={m.date}
                    className="relative flex flex-col items-center sm:grid sm:grid-cols-2 sm:items-center sm:gap-x-16 sm:py-8"
                  >
                    {/* Mobile-only thread segment joining items into one thread. */}
                    <span
                      aria-hidden
                      className="my-3 h-16 w-[2px] rounded-full bg-white/60 sm:hidden"
                    />

                    {/* Polaroid. */}
                    <div
                      className={cn(
                        'flex justify-center',
                        imageLeft ? 'sm:order-1 sm:pr-10' : 'sm:order-2 sm:pl-10'
                      )}
                    >
                      <Polaroid memory={m} />
                    </div>

                    {/* Text, hugging the spine. */}
                    <div
                      className={cn(
                        'mt-2 max-w-sm px-2 text-center sm:mt-0 sm:max-w-none',
                        imageLeft
                          ? 'sm:order-2 sm:pl-10 sm:text-left'
                          : 'sm:order-1 sm:pr-10 sm:text-right'
                      )}
                    >
                      <p className="font-sans text-[11px] font-medium uppercase tracking-[0.22em] text-[#91A17C]">
                        {m.date}
                      </p>
                      <h3 className="relative mt-1 font-heading text-2xl leading-tight text-[#f5efdd] sm:text-[2rem]">
                        {/* Connector from the centre spine to the title (sm+).
                            Width = text padding (pl/pr-10 = 40px) + half the
                            column gap (gap-x-16 = 64px). */}
                        <span
                          aria-hidden
                          className={cn(
                            'absolute top-[0.55em] hidden h-[3px] w-[4.5rem] rounded-full bg-white/60 sm:block',
                            imageLeft ? 'sm:-left-[4.5rem]' : 'sm:-right-[4.5rem]'
                          )}
                        />
                        {m.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#e6e8d0]">
                        {m.body}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}

/** A single tilted polaroid: washi tape, photo (or placeholder), handwritten note. */
function Polaroid({ memory }: { memory: Memory }) {
  const { image, caption, title, tilt, tape } = memory;
  return (
    <figure
      className="relative w-[min(74vw,15rem)] rounded-[2px] bg-[#f5efdd] p-3 pb-9 shadow-[0_14px_28px_-6px_rgba(0,0,0,0.5),0_2px_5px_rgba(0,0,0,0.3)] sm:w-64"
      style={{ transform: `rotate(${tilt}deg)` }}
    >
      {/* Washi tape holding the top edge. */}
      <span
        aria-hidden
        className="absolute -top-3 left-1/2 h-6 w-24 bg-[repeating-linear-gradient(45deg,rgba(145,161,124,0.55),rgba(145,161,124,0.55)_6px,rgba(145,161,124,0.3)_6px,rgba(145,161,124,0.3)_12px)] shadow-sm"
        style={{ transform: `translateX(-50%) rotate(${tape}deg)` }}
      />

      <div className="relative aspect-square overflow-hidden rounded-[1px] bg-[#2C3F25] shadow-[inset_0_2px_10px_rgba(0,0,0,0.25)]">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={title}
            className="size-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex size-full items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.14),rgba(0,0,0,0.08)),repeating-linear-gradient(45deg,#4a5c3c,#4a5c3c_10px,#556d47_10px,#556d47_20px)]">
            <span className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#c7d1b6]/80">
              photo · {caption.replace(/\s*♡$/, '')}
            </span>
          </div>
        )}
        {/* Handwritten note across the bottom of the frame. */}
        <figcaption className="absolute inset-x-0 bottom-1.5 text-center font-script text-lg text-[#f5efdd] drop-shadow-[0_1px_3px_rgba(0,0,0,0.5)]">
          {caption}
        </figcaption>
      </div>
    </figure>
  );
}

/** Hand-drawn camera charm from the source design, recoloured cream-on-green. */
function CameraCharm({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 148 150"
      className={className}
      fill="none"
      aria-hidden
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="os-camera-sketch" x="-12%" y="-12%" width="124%" height="124%">
          <feTurbulence type="fractalNoise" baseFrequency="0.026" numOctaves="2" seed="7" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="5.5" xChannelSelector="R" yChannelSelector="G" />
        </filter>
      </defs>
      <g stroke="#f5efdd" strokeWidth="2.2" strokeLinecap="round" filter="url(#os-camera-sketch)">
        {/* strap */}
        <path d="M40 120 L38 143 Q38 147 43 147 L105 147 Q110 147 109 143 L107 120" fill="#2C3F25" stroke="#f5efdd" strokeWidth="2" />
        <path d="M46 138 L100 138" stroke="#91A17C" strokeWidth="2" strokeLinecap="round" />
        {/* body */}
        <path d="M18 40 Q16 34 24 33 L124 32 Q132 33 131 41 L132 112 Q132 120 123 119 L23 120 Q15 120 16 111 Z" fill="#3a4d30" />
        <path d="M24 33 L124 32" stroke="#f5efdd" strokeWidth="1.3" opacity="0.45" />
        {/* viewfinder bump */}
        <rect x="31" y="20" width="18" height="15" rx="4" fill="#3a4d30" />
        {/* lens */}
        <circle cx="74" cy="78" r="25" fill="none" />
        <circle cx="74" cy="78" r="16" fill="none" />
        <circle cx="74" cy="78" r="8" fill="none" />
        {/* flash window */}
        <rect x="100" y="44" width="20" height="14" rx="3" fill="none" />
        {/* film accent stripes */}
        <path d="M30 46 L30 100" stroke="#b7c2a1" strokeWidth="3" />
        <path d="M35 46 L35 100" stroke="#91A17C" strokeWidth="3" />
        <path d="M40 46 L40 100" stroke="#6f7f5c" strokeWidth="3" />
        {/* little shutter tick */}
        <path d="M52 20 Q56 15 62 18" stroke="#f5efdd" strokeWidth="1.6" opacity="0.5" />
      </g>
    </svg>
  );
}
