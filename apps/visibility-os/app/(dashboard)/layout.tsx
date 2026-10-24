import { ClerkProvider } from "@clerk/nextjs";
import "../workspace.css";
import DashboardShell from "@/components/DashboardShell";

// The provider lives here, not in the root layout: signed-in pages need Clerk
// (its script also refreshes the short-lived session token that API calls
// rely on), but the public front door must not pay for it. ADR-0014.
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const shell = <DashboardShell>{children}</DashboardShell>;
  if (!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) return shell;
  return (
    <ClerkProvider signInUrl="/sign-in" signUpUrl="/sign-up">
      {shell}
    </ClerkProvider>
  );
}
