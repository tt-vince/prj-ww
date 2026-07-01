import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

type LoginSearchParams = { pending?: string; error?: string };

const ERROR_MESSAGES: Record<string, string> = {
  oauth: 'Sign-in was cancelled or failed. Please try again.',
  state: 'Your sign-in session expired. Please try again.',
  unverified: 'Your Google email is not verified.',
  auth: 'We could not sign you in. Please try again.',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<LoginSearchParams>;
}) {
  const params = await searchParams;
  const errorMessage = params.error ? ERROR_MESSAGES[params.error] ?? 'Something went wrong.' : null;

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle>Admin sign in</CardTitle>
          <CardDescription>Wedding RSVP management</CardDescription>
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
          <Button size="lg" className="w-full" render={<a href="/api/auth/google" />}>
            Continue with Google
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
