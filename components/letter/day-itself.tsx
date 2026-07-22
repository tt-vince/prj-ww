/**
 * Sequence of events — EDGE-TO-EDGE white section. It slides up (-mt)
 * BEHIND Our Story's bottom dome (z-0 under its z-10), so the reverse dome
 * reveals this through the green's bottom corner notches. Wedding-day
 * timeline (dummy data for now).
 */
export function DayItself() {
  return (
    <section className="relative z-0 -mt-48 bg-white px-5 pt-56 pb-24 sm:px-9">
      <div className="mx-auto max-w-[56rem] text-center">
        <h2 className="font-script text-4xl leading-tight text-[color:var(--script)] sm:text-5xl">
          The day itself
        </h2>
        <p className="mt-2 font-countdown text-sm tracking-wide text-[#2C3F25]">
          What we have planned
        </p>
        <ol className="mx-auto mt-10 max-w-md text-left">
          {[
            { time: '2:00 pm', what: 'Guests arrive', detail: 'Welcome drinks on the terrace.' },
            { time: '2:30 pm', what: 'Ceremony', detail: 'In the garden, weather permitting.' },
            { time: '3:15 pm', what: 'Cocktails & photos', detail: 'Canapés and a string quartet.' },
            { time: '5:00 pm', what: 'Dinner', detail: 'Four seasonal courses in the Garden House.' },
            { time: '7:30 pm', what: 'First dance & party', detail: 'The dance floor opens.' },
            { time: '10:00 pm', what: 'Sparkler send-off', detail: 'One last hurrah on the lawn.' },
          ].map((e, i, arr) => (
            <li key={e.time} className="relative flex gap-5 pb-9 last:pb-0">
              {/* Connector rail down to the next event's badge. */}
              {i < arr.length - 1 ? (
                <span
                  aria-hidden
                  className="absolute left-[23px] top-12 -bottom-1 w-px bg-[#91A17C]/60"
                />
              ) : null}
              {/* Icon badge — placeholder clock for every event; swap per
                  event later by adding an `icon` to the data above. */}
              <span className="relative z-10 flex size-12 shrink-0 items-center justify-center rounded-full border border-[#91A17C]/60 bg-white/70 text-[#556D47] shadow-[0_2px_10px_-4px_rgba(85,109,71,0.5)] backdrop-blur-sm">
                <svg
                  viewBox="0 0 24 24"
                  className="size-[19px]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7.5V12l3 2" />
                </svg>
              </span>
              <div className="pt-1.5">
                <p className="font-heading text-lg leading-snug text-[#556D47]">
                  {e.what}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {e.detail}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
