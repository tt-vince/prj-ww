import { WeddingLetter } from '@/components/wedding-letter';

/**
 * Landing page — the wedding site contents, rendered directly.
 *
 * The `searchParams` promise (carrying the `?id=<token>` invite link) is
 * forwarded, unawaited, into the closing RSVP section, which awaits it under
 * its own <Suspense>. The page itself reads nothing request-time, so the shell
 * stays statically prerendered (Cache Components / PPR) and only the RSVP body
 * streams in. See docs/rsvp-spec.md.
 *
 * The envelope intro is retired: components/envelope-reveal.tsx is kept for
 * reuse but no longer wraps the content. The vinyl intro
 * (components/vinyl-player.tsx) is likewise kept but unused.
 */
export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  return (
    <main>
      <WeddingLetter searchParams={searchParams} />
    </main>
  );
}
