import { Card, CardContent } from '@/components/ui/card';
import { SectionHeading } from '@/components/letter/section-heading';

/**
 * FAQ — white section after Gifts (last in the letter). Same header pattern as
 * the other sections (SectionHeading), then a stack of
 * question/answer items, each in its own solid ink card (#1E2A18 — the same ink
 * as the Rsvp section background). Placeholder copy — edit freely.
 */
const FAQS = [
  {
    q: 'Can I bring a plus-one?',
    a: 'Seats are reserved for the names on your invite. If your invite includes extra seats, you’ll see them when you RSVP — otherwise we’re keeping it intimate.',
  },
  {
    q: 'Are kids welcome?',
    a: 'We love your little ones. When you RSVP you can let us know how many children are coming so we can plan seating and food.',
  },
  {
    q: 'When should I RSVP by?',
    a: 'Please reply as early as you can so we can finalise numbers with the venue. If your plans change afterwards, just reach out to us directly.',
  },
];

export function Faq() {
  return (
    <section className="bg-white px-gutter py-section">
      <div className="mx-auto max-w-[56rem] text-center">
        <SectionHeading title="Good to know" kicker="FAQ" />

        <div className="mx-auto mt-heading grid max-w-2xl gap-5 text-left">
          {/* A real shadcn Card, not a bare div: the map card and the hotel
              cards are Cards too, and their inner text is inset by
              `CardContent`'s own `--card-spacing` on top of the shell padding.
              Hand-rolled markup got the shell padding alone, so the questions
              sat half as far from the edge as every other card in the letter. */}
          {FAQS.map((f) => (
            <Card
              key={f.q}
              className="gap-0 rounded-xl bg-ink px-2 py-8 ring-0 sm:px-6"
            >
              <CardContent>
                <p className="font-sans text-subhead text-white">{f.q}</p>
                <p className="mt-2 text-body text-white">
                  {f.a}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
