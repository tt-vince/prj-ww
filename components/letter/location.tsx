/**
 * Location — full-bleed section after AttireGuide, with the palm-beach photo
 * (public/beach-location.jpg) as its backdrop and a dark overlay for text
 * legibility (same pattern as Hero's lily backdrop). Shows the venue name and
 * an embedded Google Map of Anvy Beach Resort (keyless ?output=embed) plus a
 * link out to the place page.
 */
export function Location() {
  return (
    <section
      className="relative bg-[#eaf3f6] px-5 py-24 sm:px-9"
      style={{
        backgroundImage:
          'linear-gradient(to bottom, #ffffff 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0) 62%, #ffffff 100%), linear-gradient(rgba(255,255,255,0.45), rgba(255,255,255,0.45)), url(/beach-location.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: '50% bottom',
      }}
    >
      <div className="mx-auto max-w-[56rem] text-center">
        <h2 className="font-script text-4xl leading-tight text-[#1f4453] drop-shadow-[0_1px_10px_rgba(255,255,255,0.8)] sm:text-5xl">
          Where we’ll be
        </h2>
        <p className="mt-2 font-countdown text-sm tracking-wide text-[#1f4453]/70 drop-shadow-[0_1px_6px_rgba(255,255,255,0.8)]">
          Location
        </p>

        <p className="mx-auto mt-10 font-heading text-2xl leading-snug text-[#142a36] drop-shadow-[0_1px_10px_rgba(255,255,255,0.85)]">
          Anvy Beach Resort
        </p>
        <p className="mt-2 text-sm leading-relaxed text-[#142a36]/80 drop-shadow-[0_1px_6px_rgba(255,255,255,0.85)]">
          Where we’ll say “I do,” toes in the sand.
        </p>

        <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-md border border-white/70 shadow-[0_24px_50px_-24px_rgba(20,42,54,0.5)]">
          <iframe
            title="Map — Anvy Beach Resort"
            src="https://www.google.com/maps?q=Anvy+Beach+Resort&ll=5.8086321,125.1743154&z=17&output=embed"
            className="block h-[30rem] w-full border-0"
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
            className="inline-flex items-center gap-1 rounded-full bg-white/95 px-5 py-2 text-sm font-medium text-[#142a36] shadow-sm transition hover:bg-white"
          >
            Open in Google Maps
          </a>
        </div>
      </div>
    </section>
  );
}
