# Product: Toss Enterprise Website

- **Package:** `@toss/website` at `apps/website`
- **Status:** Live on Vercel
- **Job:** convert visitors into booked calls, paid projects, and retainers.

## Pages and features (current)

- Home with animated sections, services, process, pricing with Flutterwave CTAs, work/portfolio, digital products with notify-me form, retainer builder, contact (form to Supabase plus WhatsApp button and floating WhatsApp CTA).
- Canonical contact and payment endpoints live in `apps/website/lib/config.ts`: Calendly booking URL, Flutterwave payment URL, WhatsApp number, email. **Change them there, nowhere else.**

## Conversion paths (the product logic)

1. Visitor reads services or pricing, clicks a tier CTA, lands on Flutterwave.
2. Visitor books a call via Calendly (retainer and consultation paths).
3. Visitor messages WhatsApp directly (highest-volume real-world path in the NG market).
4. Visitor submits the contact form (stored in Supabase; the sales agent will consume these).

Any redesign must preserve all four paths and keep them measurable.

## Data

Contact submissions and notify-me signups go to Supabase (see [../01-architecture/data-architecture.md](../01-architecture/data-architecture.md)). Confirm RLS on these tables (open question in security.md).

## Target improvements (roadmap-gated, see roadmap.md)

- Analytics: no measurement exists today; add privacy-sane analytics before optimizing anything.
- SEO pass: metadata, OG images, sitemap.
- Case study pages per portfolio item instead of a flat work page.
- Free visibility audit form feeding the audit agent (the funnel's future front door).
