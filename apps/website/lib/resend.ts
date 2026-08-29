import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

// null when unconfigured, so callers can fail gracefully instead of
// throwing on a missing API key.
export const resend = apiKey ? new Resend(apiKey) : null;

export const CONTACT_NOTIFY_EMAIL = process.env.CONTACT_NOTIFY_EMAIL || "tossacoin001@gmail.com";

// Resend's shared sending address; works before a custom domain is
// verified on the account. Swap once a domain (e.g. toss-enterprise.com)
// is verified in the Resend dashboard.
export const CONTACT_FROM_EMAIL = process.env.CONTACT_FROM_EMAIL || "Toss Enterprise <onboarding@resend.dev>";
