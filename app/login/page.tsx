import type { ComponentProps } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Heart } from 'lucide-react';

type LoginSearchParams = { pending?: string; error?: string };

const ERROR_MESSAGES: Record<string, string> = {
  oauth: 'Sign-in was cancelled or failed. Please try again.',
  state: 'Your sign-in session expired. Please try again.',
  unverified: 'Your Google email is not verified.',
  auth: 'We could not sign you in. Please try again.',
  denied: 'This Google account is not an authorized admin.',
};

function GoogleIcon(props: ComponentProps<'svg'>) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden {...props}>
      <path
        fill="#FFC107"
        d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"
      />
      <path
        fill="#FF3D00"
        d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"
      />
    </svg>
  );
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  const params = await searchParams;
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] ?? 'Something went wrong.' : null;

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-accent/40 via-background to-secondary/40 p-6">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -left-24 size-72 rounded-full bg-primary/15 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -bottom-24 size-72 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative flex w-full max-w-sm flex-col items-center gap-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Heart className="size-6" />
          </div>
          <div className="flex flex-col gap-1">
            <h1 className="font-serif text-2xl font-semibold tracking-tight">Wedding RSVP</h1>
            <p className="text-sm text-muted-foreground">Admin console</p>
          </div>
        </div>

        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-xl">Admin sign in</CardTitle>
            <CardDescription>Sign in to manage guest responses.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {params.pending && (
              <Alert>
                <AlertTitle>Account pending approval</AlertTitle>
                <AlertDescription>
                  An administrator must activate your account before you can sign in.
                </AlertDescription>
              </Alert>
            )}
            {errorMessage && (
              <Alert variant="destructive">
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            {/* Plain anchor (via render) so the GET is never prefetched. */}
            <Button
              variant="outline"
              size="lg"
              className="w-full"
              nativeButton={false}
              render={<a href="/api/auth/google" />}
            >
              <GoogleIcon data-icon="inline-start" />
              Continue with Google
            </Button>
          </CardContent>
        </Card>

        <p className="max-w-xs text-center text-xs text-muted-foreground">
          Access is restricted to approved administrators.
        </p>
      </div>
    </main>
  );
}
