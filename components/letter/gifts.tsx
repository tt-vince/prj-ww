import QRCode from 'qrcode';

/**
 * Gifts — white section after Rsvp. Same header pattern as the other letter
 * sections (font-script h2 + font-countdown label), an intro line, then a
 * cash-gift block with one QR for GCash and one for BDO, each labelled below.
 *
 * The QR SVGs are generated server-side from each method's `payload`. Replace
 * the payloads with the couple's real GCash / BDO transfer strings (or the raw
 * value their banking app's “show QR” screen encodes) to make them scannable.
 */
const CASH_METHODS = [
  { method: 'GCash', payload: 'gcash:transfer?account=REPLACE_WITH_REAL' },
  { method: 'BDO', payload: 'bdo:transfer?account=REPLACE_WITH_REAL' },
];

export async function Gifts() {
  const codes = await Promise.all(
    CASH_METHODS.map(async (m) => ({
      method: m.method,
      svg: await QRCode.toString(m.payload, {
        type: 'svg',
        width: 176,
        margin: 1,
        errorCorrectionLevel: 'M',
        color: { dark: '#1c1c1c', light: '#ffffff' },
      }),
    })),
  );

  return (
    <section className="bg-white px-5 py-24 sm:px-9">
      <div className="mx-auto max-w-[56rem] text-center">
        <h2 className="font-script text-4xl leading-tight text-[color:var(--script)] sm:text-5xl">
          A little something
        </h2>
        <p className="mt-2 font-countdown text-sm tracking-wide text-[#2C3F25]">
          Gift guide
        </p>

        <p className="mx-auto mt-8 max-w-md text-sm leading-relaxed text-muted-foreground">
          Your presence is the only gift we’re hoping for. But if you’d like to
          give a little more, you can scan a code below with your banking app.
        </p>

        {/* Cash gift — QR codes */}
        <div className="mx-auto mt-10 flex max-w-xl flex-wrap justify-center gap-10">
          {codes.map((c) => (
            <div key={c.method} className="flex flex-col items-center">
              <div
                className="rounded-md border border-[#e6e2d4] bg-white p-2 [&>svg]:block"
                dangerouslySetInnerHTML={{ __html: c.svg }}
              />
              <p className="mt-4 font-heading text-lg text-[#556D47]">
                {c.method}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
