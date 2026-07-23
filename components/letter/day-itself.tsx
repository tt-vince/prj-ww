import { cn } from '@/lib/utils';

/**
 * Sequence of events — EDGE-TO-EDGE white section. It slides up (-mt)
 * BEHIND Our Story's bottom dome (z-0 under its z-10), so the reverse dome
 * reveals this through the green's bottom corner notches.
 *
 * Layout: a single centre rail runs down the middle. Each event alternates
 * sides — a line-icon illustration on one half, the description on the other,
 * with a short horizontal connector from the centre rail to the title. On
 * mobile the rail shifts left, a short connector runs from it to each title,
 * and the illustration sits in the item body AFTER the description. Dummy
 * data for now.
 */

type EventIconName =
  | 'drink'
  | 'rings'
  | 'camera'
  | 'dinner'
  | 'dance'
  | 'sparkler';

const EVENTS: {
  time: string;
  what: string;
  detail: string;
  icon: EventIconName;
}[] = [
  { time: '2:00 pm', what: 'Guests arrive', detail: 'Welcome drinks on the terrace.', icon: 'drink' },
  { time: '2:30 pm', what: 'Ceremony', detail: 'In the garden, weather permitting.', icon: 'rings' },
  { time: '3:15 pm', what: 'Cocktails & photos', detail: 'Canapés and a string quartet.', icon: 'camera' },
  { time: '5:00 pm', what: 'Dinner', detail: 'Four seasonal courses in the Garden House.', icon: 'dinner' },
  { time: '7:30 pm', what: 'First dance & party', detail: 'The dance floor opens.', icon: 'dance' },
  { time: '10:00 pm', what: 'Sparkler send-off', detail: 'One last hurrah on the lawn.', icon: 'sparkler' },
];

export function DayItself() {
  return (
    <section className="relative z-0 -mt-48 bg-white pr-5 pt-56 pb-24 sm:px-9">
      <div className="mx-auto max-w-[56rem] text-center">
        <h2 className="font-script text-4xl leading-tight text-[color:var(--script)] sm:text-5xl">
          The day itself
        </h2>
        <p className="mt-2 font-countdown text-sm tracking-wide text-[#2C3F25]">
          What we have planned
        </p>

        <ol className="relative mx-auto mt-14 max-w-[46rem]">
          {/* The single centre rail: left on mobile, dead-centre on md+. */}
          <span
            aria-hidden
            className="absolute inset-y-1 left-6 w-0.5 bg-[#91A17C]/60 md:left-1/2 md:-translate-x-1/2"
          />

          {EVENTS.map((e, i) => {
            // Even rows: illustration left, description right. Odd: swapped.
            const illoRight = i % 2 === 1;
            return (
              <li
                key={e.time}
                className="relative flex flex-col items-start gap-3 pb-12 pl-16 last:pb-0 md:grid md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-x-10 md:pl-0"
              >
                {/* Connector from the LEFT rail to the title (mobile only) —
                    stops short of the title (small gap) and is vertically
                    centred on the title's first line. */}
                <span
                  aria-hidden
                  className="absolute left-6 top-[0.95rem] h-0.5 w-8 bg-[#91A17C]/60 md:hidden"
                />

                {/* Illustration — a side cell on md+; on mobile it sits in the
                    item body, after the description (order-2). */}
                <div
                  className={cn(
                    'order-2 flex shrink-0 justify-center md:order-2 md:shrink',
                    illoRight ? 'md:order-3' : 'md:order-1'
                  )}
                >
                  <span className="flex size-12 items-center justify-center rounded-full border border-[#91A17C]/60 bg-white/70 text-[#556D47] shadow-[0_2px_10px_-4px_rgba(85,109,71,0.5)] backdrop-blur-sm md:size-20">
                    <EventIcon name={e.icon} className="size-[19px] md:size-9" />
                  </span>
                </div>

                {/* Spacer for the centre rail track (md grid middle column). */}
                <span aria-hidden className="hidden md:order-2 md:block md:w-0" />

                {/* Description + connector to the centre rail. */}
                <div
                  className={cn(
                    'order-1 relative pt-1 text-left md:pt-0',
                    illoRight
                      ? 'md:order-1 md:pr-2 md:text-right'
                      : 'md:order-3 md:pl-2 md:text-left'
                  )}
                >
                  {/* Horizontal connector from centre rail to the title (md+). */}
                  <span
                    aria-hidden
                    className={cn(
                      'absolute top-[0.7rem] hidden h-0.5 w-10 bg-[#91A17C]/60 md:block',
                      illoRight ? 'md:-right-10' : 'md:-left-10'
                    )}
                  />
                  <p className="font-heading text-lg leading-snug text-[#556D47]">
                    {e.what}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {e.detail}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}

/** Minimal sage line-icons, one per event. */
function EventIcon({
  name,
  className,
}: {
  name: EventIconName;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {name === 'drink' ? (
        <>
          <path d="M6 4h12l-5 7v6" />
          <path d="M9 20h6" />
          <path d="M8 8h8" />
        </>
      ) : null}
      {name === 'rings' ? (
        <>
          <circle cx="9" cy="14" r="5" />
          <circle cx="15" cy="14" r="5" />
          <path d="M10.5 4.5 12 3l1.5 1.5L12 6z" />
        </>
      ) : null}
      {name === 'camera' ? (
        <>
          <path d="M3 8.5A1.5 1.5 0 0 1 4.5 7h2l1.2-2h6.6L15.5 7h4A1.5 1.5 0 0 1 21 8.5V18a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 18z" />
          <circle cx="12" cy="12.5" r="3.2" />
        </>
      ) : null}
      {name === 'dinner' ? (
        <>
          <path d="M6 3v7a2 2 0 0 0 4 0V3" />
          <path d="M8 10v11" />
          <path d="M17 3c-1.7 0-3 1.8-3 4s1.3 4 3 4" />
          <path d="M17 3v18" />
        </>
      ) : null}
      {name === 'dance' ? (
        <>
          <circle cx="8" cy="18" r="2.4" />
          <path d="M10.4 17V6l7 2" />
          <path d="M17.4 8v7" />
          <circle cx="15" cy="15" r="2" />
        </>
      ) : null}
      {name === 'sparkler' ? (
        <>
          <path d="M14 21 8 9" />
          <path d="M17 3v3M20.5 4.5 18.5 6.5M21 9h-3M13 3.5 15 6" />
        </>
      ) : null}
    </svg>
  );
}
