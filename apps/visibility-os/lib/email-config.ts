/**
 * Sender settings for outgoing mail, read from the environment. Both are
 * optional: unset `EMAIL_FROM` falls back to Resend's shared sender (which
 * only delivers to the account owner), unset `EMAIL_REPLY_TO` means replies
 * go to the From address. Set `EMAIL_REPLY_TO` to a mailbox that exists
 * whenever `EMAIL_FROM` is an address nobody reads (for example
 * hello@tossvisibilityos.com before a mailbox is set up there), otherwise
 * customers' replies are lost.
 */
export type EmailSettings = { from?: string; replyTo?: string };

const clean = (value: string | undefined) => {
  const v = value?.trim();
  return v ? v : undefined;
};

export function emailSettings(env: Record<string, string | undefined> = process.env): EmailSettings {
  return { from: clean(env.EMAIL_FROM), replyTo: clean(env.EMAIL_REPLY_TO) };
}
