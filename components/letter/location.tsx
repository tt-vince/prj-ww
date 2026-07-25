import Image from 'next/image';
import { MapPin } from 'lucide-react';

import { cn } from '@/lib/utils';
import { WEDDING_VENUE } from '@/lib/wedding';
import { letterButton } from '@/components/letter/letter-button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const VENUE = {
  name: WEDDING_VENUE,
  tag: 'Ceremony & reception',
  address: 'Gumasa, Glan, Sarangani, Philippines',
  /* Sits under the map, directly above the maps link. Interpolates the venue
     name so it can't drift from WEDDING_VENUE. */
  caption: `Join us at ${WEDDING_VENUE} as we exchange our vows, surrounded by the people we love most.`,
  embed:
    'https://www.google.com/maps?q=Anvy+Beach+Resort&ll=5.8086321,125.1743154&z=17&output=embed',
  maps:
    'https://www.google.com/maps/place/Anvy+Beach+Resort+(Resort+Hotel)/@5.8086321,125.1743154,17z/data=!3m1!4b1!4m6!3m5!1s0x32f7abe38273c2df:0x97f91a6833d5039d!8m2!3d5.8086321!4d125.1743154!16s%2Fg%2F11j8l9rqnb',
};

/**
 * Location — section after AttireGuide. Centred header (font-script h2 +
 * font-countdown label) over a single venue card built from the same shadcn
 * Card pieces as the Hotels section, so the two read as one family. The card
 * holds the keyless Google Map embed (?output=embed) plus a link out to the
 * place page.
 */
export function Location() {
  return (
    <section className="px-5 py-24 sm:px-9">
      <div className="mx-auto max-w-[56rem] text-center lg:max-w-[64rem]">
        <h2 className="font-script text-4xl leading-tight text-ink sm:text-5xl">
          Where we’ll be
        </h2>
        <p className="mt-2 font-countdown text-sm tracking-wide text-ink">
          Location
        </p>

        {/* Roughly three quarters of the section's measure: the card is a
            single column of text over a map, so it reads better slimmer than
            the two-up Hotels grid that shares the same container width. */}
        <div className="relative mx-auto mt-10 max-w-2xl md:max-w-[42rem] lg:max-w-[48rem]">
          {/* Two hand-drawn stamps, affixed to the card's real corners. They
              sit on this wrapper rather than inside the Card because the Card
              is `overflow-hidden` — from here they can straddle the border the
              way a stamp overlaps the edge of an envelope, instead of being
              clipped flush to it. Decorative only: aria-hidden, and
              pointer-events-none so neither one steals a click from the map. */}
          <Image
            src="/icons/hand_drawn/wedding_2/beach-umbrella.svg"
            alt=""
            aria-hidden
            width={93}
            height={89}
            className="pointer-events-none absolute -top-8 -right-3 z-10 h-14 w-auto rotate-12 select-none opacity-80 sm:-top-10 sm:-right-5 sm:h-16"
          />
          <Image
            src="/icons/hand_drawn/wedding_2/palm-tree-2.svg"
            alt=""
            aria-hidden
            width={63}
            height={102}
            className="pointer-events-none absolute -bottom-6 -left-3 z-10 h-16 w-auto -rotate-6 select-none opacity-80 sm:-left-5 sm:h-20"
          />

          {/* 2px ink border, the same stroke and colour as the timeline rail
              in components/letter/day-itself.tsx. `ring-0` kills the Card's
              default hairline ring so the two don't draw one over the other. */}
          <Card className="flex flex-col border-2 border-ink px-2 py-8 shadow-[0_20px_44px_-26px_rgba(30,42,24,0.45)] ring-0 sm:px-6">
            <CardHeader className="text-center">
              <CardTitle className="font-heading text-lg text-ink">
                {VENUE.name}
              </CardTitle>
              <CardDescription className="font-countdown text-xs tracking-wide">
                {VENUE.tag}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col text-center">
              {/* Same address row as the Hotels cards, centred: pin icon and
                  street line on one line, icon aligned to the first line of
                  wrapped text. */}
              <dl className="text-sm text-muted-foreground">
                <div className="flex justify-center gap-2">
                  <dt className="pt-0.5">
                    <MapPin aria-hidden className="size-3.5" strokeWidth={1.5} />
                    <span className="sr-only">Address</span>
                  </dt>
                  <dd className="leading-relaxed">{VENUE.address}</dd>
                </div>
              </dl>

              <div className="mt-4 overflow-hidden rounded-md border border-ink/15">
                <iframe
                  title={`Map — ${VENUE.name}`}
                  src={VENUE.embed}
                  className="block h-[20rem] w-full border-0 md:h-[24rem]"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  allowFullScreen
                />
              </div>

              {/* Measure-capped so the centred line doesn't run the full
                  width of the widened card on desktop. */}
              <p className="mx-auto mt-5 max-w-prose text-sm leading-relaxed text-muted-foreground">
                {VENUE.caption}
              </p>

              <a
                href={VENUE.maps}
                target="_blank"
                rel="noreferrer"
                className={cn(letterButton(), 'mx-auto mt-4')}
              >
                <MapPin aria-hidden strokeWidth={1.5} />
                Open in Google Maps
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

