import { ClerkProvider } from "@clerk/nextjs";
import "../workspace.css";

// Onboarding saves with signed-in fetch calls, so Clerk's script must run here
// to keep the session token fresh while the owner fills the form. ADR-0014.
export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return <>{children}</>;
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
      {children}
    </ClerkProvider>
  );
}
