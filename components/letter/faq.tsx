/**
 * FAQ — white section after Gifts (last in the letter). Same header pattern as
 * the other sections (font-script h2 + font-countdown label), then a stack of
 * question/answer items, each in its own deep-forest-green card (#2C3F25 — the
 * same green as the Rsvp section background). Placeholder copy — edit freely.
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
    <section className="bg-white px-5 py-24 sm:px-9">
      <div className="mx-auto max-w-[56rem] text-center">
        <h2 className="font-script text-4xl leading-tight text-[color:var(--script)] sm:text-5xl">
          Good to know
        </h2>
        <p className="mt-2 font-countdown text-sm tracking-wide text-[#2C3F25]">
          FAQ
        </p>

        <div className="mx-auto mt-10 grid max-w-2xl gap-5 text-left">
          {FAQS.map((f) => (
            <div
              key={f.q}
              className="rounded-xl bg-[#2C3F25] px-6 py-6 sm:px-8"
            >
              <p className="font-heading text-lg text-[#f5efdd]">{f.q}</p>
              <p className="mt-2 text-sm leading-relaxed text-[#f5efdd]/75">
                {f.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
