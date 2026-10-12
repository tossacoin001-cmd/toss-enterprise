# Visibility OS: brief for the legal read (privacy notice and terms)

Give this page, plus the live pages, to the lawyer or data protection compliance organisation. Written 2026-10-12.

- Privacy notice (draft): https://tossvisibilityos.com/privacy
- Terms (draft): https://tossvisibilityos.com/terms
- Source of both: `apps/visibility-os/app/privacy/page.tsx` and `app/terms/page.tsx`
- Technical record of what is stored and why: [ADR-0016](../01-architecture/decisions/0016-instant-scan-api-limits-and-turnstile.md)

## What the product does

Visibility OS is a free check of how easy a business or a person is to find online. A visitor types a website address, or a business or personal name with social handles and an optional WhatsApp number. No sign-up, email or card is asked for before the result. We read only public pages (the home page, robots.txt, sitemap.xml, the security certificate, and whether a public social profile exists on X, YouTube and LinkedIn). Operated by Toss Enterprise, Nigeria.

## What we collect and keep

| Data | Why | How long | Where |
|---|---|---|---|
| Website address typed in | To run the check and show the result | 30 days if the visitor does not save it, until deleted if they sign up and save | Supabase Postgres |
| Business or personal name, city, what they do, social handles (platform names kept with the result), WhatsApp number (used for a chat link) | To make the result personal | Same as above | Same |
| The result of the check | To show it, and to serve a repeat check within 24 hours | Same as above | Same |
| A one-way daily code made from the visitor's network address (never the address) | To limit abuse (daily limits per network) | Kept with the scan row, same retention | Same |
| One essential cookie (signed, 1 day): which new sites this browser checked today | To keep the free check fair | 1 day | Visitor's browser |
| Cloudflare Turnstile safety check | To tell people from automated programs | Cloudflare's own terms | Cloudflare |

We do not store network (IP) addresses, do not ask for email or card before the result, do not run advertising cookies, and do not sell data.

## Third parties

Vercel (hosting, United States), Supabase (database; region to be confirmed by the founder), Cloudflare (Turnstile). A visitor who signs up later also meets Clerk (sign-in) and Resend (email); these are covered when that part of the product is documented.

## Questions for the reviewer

1. Under the Nigeria Data Protection Act 2023 and the NDPC's rules, is Toss Enterprise a data controller or processor here, and does it need to register with the NDPC (including as a data controller of major importance) or file an annual audit return?
2. What is our lawful basis for the free check (consent, legitimate interest, or contract), and is the wording on the page enough, given the notice is linked next to the button rather than a tick box?
3. Is the one-way daily code from a network address personal data? Is "we do not store IP addresses" accurate as written?
4. Cross-border transfer: data is processed in the United States (and possibly elsewhere). What do we need to say or arrange?
5. Cookies: is a notice needed for the essential limit cookie and Cloudflare's technical data, and what should it say?
6. Children: do we need an age line? (The check is for businesses and professionals.)
7. Rights: is "message us on WhatsApp, we reply in a few days" an acceptable way to take access, correction and deletion requests, and what response time should we promise?
8. Terms: are the "as is" and "guidance, not a guarantee" wording, the fair-use rules, and the limit on liability enforceable and suitable? Is anything missing for the paid help we offer after the free check?
9. Is it a problem that the check looks at other people's public websites and public profiles on request (for example a competitor), and is our statement that it reads public information only sufficient?
10. Anything we say that we should not, or should say that we do not?

## What to ask for back

Marked-up changes to the two pages (or replacement text), a short list of anything we must register or file, and a rough cost and time for each.
