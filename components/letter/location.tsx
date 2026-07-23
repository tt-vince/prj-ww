/**
 * Location — section after AttireGuide. A pill-shaped palm-beach photo
 * (public/beach-location.jpg) sits alongside the text column instead of
 * behind it: image left, venue details + embedded Google Map right (stacks on
 * mobile). Map is keyless (?output=embed) plus a link out to the place page.
 */
export function Location() {
  return (
    <section className="px-5 py-24 sm:px-9">
      <div className="mx-auto grid max-w-[72rem] items-center gap-10 md:grid-cols-[minmax(0,24rem)_1fr] md:gap-14">
        {/* Pill-shaped photo alongside the content */}
        <div className="order-2 mx-auto w-full max-w-[24rem] overflow-hidden rounded-full shadow-[0_28px_60px_-28px_rgba(20,42,54,0.55)] md:order-1 md:mx-0">
          <img
            src="/beach-location.jpg"
            alt="Palm-lined beach at Anvy Beach Resort"
            className="h-[32rem] w-full object-cover md:h-[42rem]"
            loading="lazy"
          />
        </div>

        <div className="order-1 text-center md:order-2 md:text-left">
          <h2 className="font-script text-4xl leading-tight text-[#1f4453] sm:text-5xl">
            Where we’ll be
          </h2>
          <p className="mt-2 font-countdown text-sm tracking-wide text-[#1f4453]/70">
            Location
          </p>

          <p className="mt-8 font-heading text-2xl leading-snug text-[#142a36]">
            Anvy Beach Resort
          </p>
          <p className="mt-2 text-sm leading-relaxed text-[#142a36]/80">
            Where we’ll say “I do,” toes in the sand.
          </p>

          <div className="mt-8 overflow-hidden rounded-md border border-white/70 shadow-[0_24px_50px_-24px_rgba(20,42,54,0.5)]">
            <iframe
              title="Map — Anvy Beach Resort"
              src="https://www.google.com/maps?q=Anvy+Beach+Resort&ll=5.8086321,125.1743154&z=17&output=embed"
              className="block h-[24rem] w-full border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>

          <div className="mt-6">
            <a
              href="https://www.google.com/maps/place/Anvy+Beach+Resort+(Resort+Hotel)/@5.8086321,125.1743154,17z/data=!3m1!4b1!4m6!3m5!1s0x32f7abe38273c2df:0x97f91a6833d5039d!8m2!3d5.8086321!4d125.1743154!16s%2Fg%2F11j8l9rqnb"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 rounded-full bg-[#2C3F25] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#37502f]"
            >
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
