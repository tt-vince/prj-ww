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
      className="relative bg-[#7fb6c9] px-6 py-24 sm:px-9"
      style={{
        backgroundImage:
          'linear-gradient(rgba(20,42,54,0.55), rgba(20,42,54,0.55)), url(/beach-location.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: '50% center',
      }}
    >
      <div className="mx-auto max-w-[min(80%,56rem)] text-center">
        <h2 className="font-script text-4xl leading-tight text-[#f7ede3] drop-shadow-[0_2px_14px_rgba(20,42,54,0.7)] sm:text-5xl">
          Where we’ll be
        </h2>
        <p className="mt-2 font-countdown text-sm tracking-wide text-white/90 drop-shadow-[0_1px_8px_rgba(20,42,54,0.7)]">
          Location
        </p>

        <p className="mx-auto mt-10 font-heading text-2xl leading-snug text-white drop-shadow-[0_2px_12px_rgba(20,42,54,0.75)]">
          Anvy Beach Resort
        </p>
        <p className="mt-2 text-sm leading-relaxed text-white/90 drop-shadow-[0_1px_8px_rgba(20,42,54,0.7)]">
          Where we’ll say “I do,” toes in the sand.
        </p>

        <div className="mx-auto mt-8 max-w-2xl overflow-hidden rounded-md border border-white/50 shadow-[0_20px_44px_-20px_rgba(20,42,54,0.8)]">
          <iframe
            title="Map — Anvy Beach Resort"
            src="https://www.google.com/maps?q=Anvy+Beach+Resort&output=embed"
            className="block h-72 w-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
        </div>

        <div className="mt-6">
          <a
            href="https://www.google.com/maps/place/Anvy+Beach+Resort+(Resort+Hotel)/data=!4m2!3m1!1s0x0:0x97f91a6833d5039d?sa=X&ved=1t:2428&ictx=111"
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
