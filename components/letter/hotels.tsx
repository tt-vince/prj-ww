import { MapPin, Phone, Star } from 'lucide-react';

import { letterButton } from '@/components/letter/letter-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

/**
 * Recommended hotels — white section after Location. Same header pattern as
 * the other sections (font-script h2 + font-countdown label), then a short
 * list of nearby places to stay as cards. Placeholder recommendations — edit
 * freely (names, blurbs and map links are dummy data).
 */
const HOTELS = [
  {
    name: 'Palmwind Beach Hotel',
    rating: 4.5,
    tag: '5-min walk to the venue',
    blurb:
      'Steps from the ceremony, with sea-view rooms and a quiet garden pool — the easy choice if you’d rather not drive.',
    address: '12 Seaside Road, Barangay Anvy, Batangas',
    phone: '+63 917 123 4567',
    maps:
      'https://www.google.com/maps/search/?api=1&query=Palmwind+Beach+Hotel+Anvy',
  },
  {
    name: 'Macatimbol Garden Inn',
    rating: 4,
    tag: '10-min drive',
    blurb:
      'A cosy, well-kept inn a short ride inland — great value, with breakfast included and free parking.',
    address: '48 Macatimbol Street, Barangay Anvy, Batangas',
    phone: '+63 918 765 4321',
    maps:
      'https://www.google.com/maps/search/?api=1&query=Macatimbol+Garden+Inn',
  },
];

/**
 * Five ink stars, filled up to `value` (halves supported: the half star is a
 * filled star clipped to its left half over an outline star). Decorative on
 * its own — the numeric rating is announced by the sibling text.
 */
function Stars({ value }: { value: number }) {
  return (
    <span aria-hidden className="inline-flex items-center gap-0.5">
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.min(1, Math.max(0, value - i));
        return (
          <span key={i} className="relative block size-3.5">
            <Star className="size-3.5 text-ink/25" strokeWidth={1.5} />
            {fill > 0 && (
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star
                  className="size-3.5 fill-ink text-ink"
                  strokeWidth={1.5}
                />
              </span>
            )}
          </span>
        );
      })}
    </span>
  );
}

/**
 * Peony border that closes the section: full-bleed and flush with the top of
 * the RSVP band, so the drawing reads as standing on the green. Same asset as
 * the one closing `Prenup`, turned 180° so the blooms hang down into the band
 * instead of growing up out of it. The asset ships as a single flat colour, so
 * it is painted through a CSS mask to match the RSVP background (the letter's
 * ink). Aspect ratio is the viewBox's (1032.1908 x 270.9679).
 */
function FloralBorderPeonies() {
  const mask = "url('/icons/hand_drawn/illustrations/floral-border-peonies.svg')";
  return (
    <span
      aria-hidden
      className="block aspect-[1032.1908/270.9679] w-full rotate-180 bg-ink"
      style={{
        maskImage: mask,
        WebkitMaskImage: mask,
        maskRepeat: 'no-repeat',
        WebkitMaskRepeat: 'no-repeat',
        // 20px wider than the box (scaled, so taller too) and centred: the
        // SVG's own transparent margin gets cropped off instead of holding the
        // drawing back from the screen edges.
        maskSize: 'calc(100% + 20px) auto',
        WebkitMaskSize: 'calc(100% + 20px) auto',
        maskPosition: 'center',
        WebkitMaskPosition: 'center',
      }}
    />
  );
}

export function Hotels() {
  return (
    <section className="bg-white pt-24">
      <div className="mx-auto max-w-[56rem] px-5 text-center sm:px-9 lg:max-w-[64rem]">
        <h2 className="font-script text-4xl leading-tight text-[color:var(--script)] sm:text-5xl">
          Where you can stay
        </h2>
        <p className="mx-auto mt-2 max-w-md font-countdown text-sm leading-relaxed tracking-wide text-ink">
          We want to make your visit as comfortable as possible. Here are our
          recommended places to stay.
        </p>

        {/* Capped to one readable column on mobile; from sm up the pair fills
            the section's measure, which widens again at lg. */}
        <div className="mx-auto mt-10 grid max-w-2xl gap-5 text-left sm:max-w-none sm:grid-cols-2 lg:gap-6">
          {HOTELS.map((h) => (
            <Card
              key={h.name}
              className="flex flex-col border-2 border-ink px-2 py-8 shadow-[0_20px_44px_-26px_rgba(30,42,24,0.45)] ring-0 sm:px-6"
            >
              <CardHeader>
                <CardTitle className="font-heading text-lg text-ink">
                  {h.name}
                </CardTitle>
                <CardDescription className="flex items-center gap-2 font-countdown text-xs tracking-wide">
                  <Stars value={h.rating} />
                  <span className="sr-only">{h.rating} out of 5 stars — </span>
                  {h.tag}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {h.blurb}
                </p>

                {/* Address and phone: caption-sized, same muted tone as the
                    blurb, one row each with the icon on the first line of
                    wrapped text. */}
                <dl className="mt-3 space-y-1 text-xs leading-relaxed text-muted-foreground">
                  <div className="flex gap-1.5">
                    <dt className="pt-px">
                      <MapPin aria-hidden className="size-3" strokeWidth={1.5} />
                      <span className="sr-only">Address</span>
                    </dt>
                    <dd>{h.address}</dd>
                  </div>
                  <div className="flex gap-1.5">
                    <dt className="pt-px">
                      <Phone aria-hidden className="size-3" strokeWidth={1.5} />
                      <span className="sr-only">Contact number</span>
                    </dt>
                    <dd>
                      <a
                        href={`tel:${h.phone.replace(/\s+/g, '')}`}
                        className="underline decoration-ink/25 underline-offset-2 transition hover:text-ink hover:decoration-ink"
                      >
                        {h.phone}
                      </a>
                    </dd>
                  </div>
                </dl>

                {/* From sm up the cards sit side by side and stretch to equal
                    height, so `mt-auto` pins this row to the bottom of its
                    card: the two buttons stay level however many lines the
                    blurb or address above them run to. `pt-4` keeps a floor of
                    breathing room when the text nearly fills the card. */}
                <div className="mt-4 sm:mt-auto sm:pt-4">
                  <a
                    href={h.maps}
                    target="_blank"
                    rel="noreferrer"
                    className={letterButton()}
                  >
                    <MapPin aria-hidden strokeWidth={1.5} />
                    Open in Google Maps
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Full-bleed, no bottom padding: the illustration's baseline meets the
          RSVP section's green edge. */}
      <div className="mt-16">
        <FloralBorderPeonies />
      </div>
    </section>
  );
}
