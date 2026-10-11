/**
 * Phone numbers as owners write them. Nigerian mobile numbers (0803 123 4567,
 * +234 803 123 4567, 08031234567 and friends) become +234803..., and other
 * countries' numbers are kept when they carry a +country prefix. Anything that
 * merely looks like digits (years, prices, order numbers) is ignored.
 */

const NG_MOBILE = /^[789][01]\d{8}$/;

/** Turns the digits of one candidate into E.164, or null when it is not a phone number. */
function toE164(candidate: string): string | null {
  const hasPlus = candidate.trimStart().startsWith("+");
  const digits = candidate.replace(/\D/g, "");

  if (hasPlus) {
    if (digits.startsWith("234")) return NG_MOBILE.test(digits.slice(3)) ? `+${digits}` : null;
    // Another country: a plausible length and no leading zero after the +.
    return digits.length >= 8 && digits.length <= 15 && digits[0] !== "0" ? `+${digits}` : null;
  }
  if (digits.startsWith("234") && digits.length === 13) return NG_MOBILE.test(digits.slice(3)) ? `+${digits}` : null;
  if (digits.length === 11 && digits.startsWith("0")) return NG_MOBILE.test(digits.slice(1)) ? `+234${digits.slice(1)}` : null;
  return null;
}

/** Every phone number found in free text, as E.164, without duplicates. */
export function extractPhones(text: string): string[] {
  const found: string[] = [];
  for (const m of text.matchAll(/(?<![\d+])(\+?\d[\d\s().-]{6,22}\d)(?!\d)/g)) {
    const e164 = toE164(m[1]);
    if (e164 && !found.includes(e164)) found.push(e164);
  }
  return found;
}

export type Whatsapp = { e164: string; link: string };

/** A WhatsApp number from a number or a wa.me / api.whatsapp.com link, with a chat link. */
export function normalizeWhatsapp(input: string): Whatsapp | null {
  const text = input.trim();
  if (!text) return null;

  const fromLink = text.match(/wa\.me\/\+?(\d{8,15})/i) ?? text.match(/[?&]phone=\+?(\d{8,15})/i);
  const e164 = fromLink ? toE164(`+${fromLink[1]}`) : extractPhones(text)[0] ?? null;
  return e164 ? { e164, link: `https://wa.me/${e164.slice(1)}` } : null;
}
