import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;

/** null when unconfigured, so callers can fail gracefully instead of throwing. */
export const resend = apiKey ? new Resend(apiKey) : null;

/** Resend's shared sending address; works before a custom domain is verified. */
export const DEFAULT_FROM_EMAIL = "Toss Enterprise <onboarding@resend.dev>";

export type SendEmailInput = {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  from?: string;
  replyTo?: string;
  /** Extra headers, e.g. List-Unsubscribe for bulk mail. */
  headers?: Record<string, string>;
};

export type SendEmailResult = { ok: true } | { ok: false; error: string };

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  if (!resend) return { ok: false, error: "RESEND_API_KEY not configured" };

  const { error } = await resend.emails.send({
    from: input.from ?? DEFAULT_FROM_EMAIL,
    to: input.to,
    subject: input.subject,
    text: input.text,
    html: input.html,
    replyTo: input.replyTo,
    headers: input.headers,
  });

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
