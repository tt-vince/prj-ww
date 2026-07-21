import { COUPLE_NAMES } from '@/lib/wedding';

const [NAME_A, NAME_B] = COUPLE_NAMES;

/**
 * Our story — EDGE-TO-EDGE with a FULL DOME top: one elliptical arc across
 * the whole width (no flat part — horizontal radii meet at center). Its
 * `-mt-48` pulls it up into the Hero's `pb-48` lily backdrop, so the lily
 * shows above the dome; below the curve, the green merges into the paper
 * body. The next section (DayItself) slides up BEHIND this one (z-0 under
 * this z-10).
 */
export function OurStory() {
  return (
    <section className="relative z-10 -mt-48">
      <div className="rounded-[50%_50%_50%_50%_/_180px_180px_180px_180px] bg-[#2C3F25] px-6 pt-28 pb-20 text-center sm:px-9 sm:pt-32 sm:pb-24">
        <div className="mx-auto max-w-[min(80%,56rem)] space-y-4">
          <div className="text-center">
            <h2 className="font-script text-4xl leading-tight text-[#91A17C] sm:text-5xl">
              Our Story
            </h2>
            <p className="mt-2 font-countdown text-sm tracking-wide text-[#f5efdd]">
              How it began
            </p>
          </div>
          {/* Center-line story timeline: on desktop the rail runs down the
              middle, image on one side and date + copy on the other, sides
              alternating each row. On mobile it collapses to a single left
              rail with the image stacked above the copy. */}
          <div className="relative mx-auto mt-10 max-w-2xl text-left">
            <span
              aria-hidden
              className="absolute top-2 bottom-2 left-4 w-px bg-[#f5efdd]/30 sm:left-1/2 sm:-translate-x-1/2"
            />
            <ol className="space-y-12 sm:space-y-20">
              {[
                {
                  date: 'April 2019',
                  title: 'A broken umbrella',
                  body: `${NAME_B} and ${NAME_A} shelter under the same café awning in Nakameguro. The offered umbrella turns out to be broken — the argument about whether it still counts as chivalry lasts two hours.`,
                  caption: 'The café awning',
                },
                {
                  date: 'September 2020',
                  title: 'First apartment',
                  body: 'Two suitcases, one very small kitchen, and a shared conviction that a rice cooker counts as furniture.',
                  caption: 'Moving day',
                },
                {
                  date: 'June 2022',
                  title: 'Enter Mochi',
                  body: 'A very opinionated cat adopts us. Sunday-morning pancake experiments begin in earnest (success rate: improving).',
                  caption: 'Mochi arrives',
                },
                {
                  date: 'October 2025',
                  title: 'The proposal',
                  body: 'Back on the same street corner where it began — with a working umbrella this time, and a ring hidden in its handle.',
                  caption: 'Same corner',
                },
                {
                  date: 'Next summer',
                  title: 'The next chapter',
                  body: 'Gathering everyone we love in one garden, under one hopefully unnecessary canopy of umbrellas.',
                  caption: 'The garden',
                },
              ].map((s, i) => {
                const imageLeft = i % 2 === 0
                return (
                  <li key={s.date} className="relative">
                    <span
                      aria-hidden
                      className="absolute top-2 left-4 z-10 size-3 -translate-x-1/2 rounded-full border border-[#556D47] bg-[#f5efdd] shadow-[0_0_0_4px_rgba(85,109,71,0.6)] sm:left-1/2"
                    />
                    <div className="grid gap-4 pl-10 sm:grid-cols-2 sm:items-center sm:gap-12 sm:pl-0">
                      <div className={imageLeft ? 'sm:order-1 sm:pr-12' : 'sm:order-2 sm:pl-12'}>
                        <div className="overflow-hidden rounded-md border border-[#f5efdd]/25 shadow-[0_14px_34px_-16px_rgba(0,0,0,0.6)]">
                          <div className="flex aspect-[4/3] items-center justify-center bg-gradient-to-br from-[#91A17C]/85 via-[#556D47]/60 to-[#2C3F25]/50">
                            <span className="font-script text-lg text-[#182516]/80">
                              {s.caption}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div
                        className={
                          imageLeft
                            ? 'sm:order-2 sm:pl-12 sm:text-left'
                            : 'sm:order-1 sm:pr-12 sm:text-right'
                        }
                      >
                        <p className="font-script text-xl leading-none text-[#91A17C]">
                          {s.date}
                        </p>
                        <h3 className="mt-1.5 font-heading text-lg tracking-wide text-[#f5efdd]">
                          {s.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#e6e8d0]">
                          {s.body}
                        </p>
                      </div>
                    </div>
                  </li>
                )
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
