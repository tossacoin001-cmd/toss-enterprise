export const CONTACT_NOTIFY_EMAIL = process.env.CONTACT_NOTIFY_EMAIL || "tossacoin001@gmail.com";

// Resend's shared sending address; works before a custom domain is
// verified on the account. Swap once a domain (e.g. toss-enterprise.com)
// is verified in the Resend dashboard.
export const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Toss Enterprise <onboarding@resend.dev>";
