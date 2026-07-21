import Image from 'next/image';

/**
 * Attire guide — white section after DayItself, same header pattern. Shows
 * the palette/outfit illustration (public/attire-guide.png) with short
 * guidance notes below. Placeholder copy — edit freely. Swatch row and
 * richer guidance deliberately deferred (see 2026-07-21 discussion).
 */
export function AttireGuide() {
  return (
    <section className="bg-white px-6 pb-24 sm:px-9">
      <div className="mx-auto max-w-[min(80%,56rem)] text-center">
        <h2 className="font-script text-4xl leading-tight text-[color:var(--script)] sm:text-5xl">
          What to wear
        </h2>
        <p className="mt-2 font-countdown text-sm tracking-wide text-[#2C3F25]">
          Attire guide
        </p>
        <Image
          src="/attire-guide.png"
          alt="Illustrated guests wearing the wedding palette — wine, raspberry, lilac, mauve, olive, forest green and pale gold"
          width={3168}
          height={1344}
          className="mx-auto mt-10 h-auto w-full"
          sizes="(max-width: 640px) 92vw, min(80vw, 56rem)"
        />
        <div className="mx-auto mt-8 max-w-md space-y-3">
          <p className="font-heading text-lg leading-snug text-[#556D47]">
            Semi-formal — garden party
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            We would love to see you in the colours above — wear one, or mix a
            few.
          </p>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Please leave white and ivory for the couple.
          </p>
        </div>
      </div>
    </section>
  );
}
