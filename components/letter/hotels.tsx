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
    tag: 'Beachfront · 5-min walk to the venue',
    blurb:
      'Steps from the ceremony, with sea-view rooms and a quiet garden pool — the easy choice if you’d rather not drive.',
    maps:
      'https://www.google.com/maps/search/?api=1&query=Palmwind+Beach+Hotel+Anvy',
  },
  {
    name: 'Macatimbol Garden Inn',
    tag: 'Budget-friendly · 10-min drive',
    blurb:
      'A cosy, well-kept inn a short ride inland — great value, with breakfast included and free parking.',
    maps:
      'https://www.google.com/maps/search/?api=1&query=Macatimbol+Garden+Inn',
  },
];

export function Hotels() {
  return (
    <section className="bg-white px-5 py-24 sm:px-9">
      <div className="mx-auto max-w-[56rem] text-center">
        <h2 className="font-script text-4xl leading-tight text-[color:var(--script)] sm:text-5xl">
          Where you can stay
        </h2>
        <p className="mt-2 font-countdown text-sm tracking-wide text-[#2C3F25]">
          Recommended hotels
        </p>

        <div className="mx-auto mt-10 grid max-w-2xl gap-5 text-left sm:grid-cols-2">
          {HOTELS.map((h) => (
            <Card
              key={h.name}
              className="flex flex-col shadow-[0_20px_44px_-26px_rgba(85,109,71,0.5)]"
            >
              <CardHeader>
                <CardTitle className="font-heading text-lg text-[#556D47]">
                  {h.name}
                </CardTitle>
                <CardDescription className="font-countdown text-xs tracking-wide">
                  {h.tag}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {h.blurb}
                </p>
                <a
                  href={h.maps}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex w-fit items-center gap-1 rounded-full bg-[#2C3F25] px-4 py-1.5 text-sm font-medium text-white transition hover:bg-[#37502f]"
                >
                  Open in Maps
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
