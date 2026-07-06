import { SignIn } from "@clerk/nextjs";

// Routes are set in code, not env: props take precedence in Clerk, which
// shields the flow from malformed dashboard-pasted env values (a BOM-prefixed
// env value once sent every new user to a 404).
export default function SignInPage() {
  return <SignIn signUpUrl="/sign-up" fallbackRedirectUrl="/dashboard" />;
}
