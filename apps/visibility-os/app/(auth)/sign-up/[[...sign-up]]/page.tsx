import { SignUp } from "@clerk/nextjs";

// Prerender the bare /sign-up so it is served from the edge instead of being
// built by a server on every visit (ADR-0014). Later steps such as verifying
// the email are still built on demand.
export function generateStaticParams() {
  return [{ "sign-up": [] as string[] }];
}

// Routes are set in code, not env: props take precedence in Clerk, which
// shields the flow from malformed dashboard-pasted env values (a BOM-prefixed
// env value once sent every new user to a 404).
export default function SignUpPage() {
  // Key-less builds (CI) prerender this page too: say so instead of crashing.
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return <p>Sign-up is not configured here.</p>;
  return <SignUp signInUrl="/sign-in" fallbackRedirectUrl="/onboarding" />;
}
