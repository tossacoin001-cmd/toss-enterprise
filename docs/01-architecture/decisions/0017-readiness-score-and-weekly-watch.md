# ADR-0017: The readiness score says what it measures, and someone watches it every week

- **Status:** Accepted
- **Date:** 2026-10-13
- **Deciders:** Founder (asked why a 100 would ever need the product, and what real gap it fills), implemented by AI

## Context

The scan scored our own site 100 out of 100 while hardly anyone could find it. The score measures the foundations (the site opens, it is secure, it has a title and description, it fits a phone, contact details are visible, social links work). It does not measure whether people find you, your Google listing and reviews, whether AI assistants mention you, or how you compare with others. A bare "100 out of 100" claims more than we measured, and gives nobody a reason to come back.

Research on existing tools (free scans from larger companies, website monitoring tools, open-source AI-visibility trackers) showed two things people pay for: being watched (uptime, certificates, links, weekly reports) and outcomes (listings, reviews, search presence, AI mentions). None serves businesses that live on Instagram and WhatsApp.

## Decision

1. **Name it for what it is.** The number is a **readiness score**: how ready you are to be found. Every result also lists what is **not measured yet** (search presence, Google Maps listing and reviews, AI assistants, comparison with others, visits), so a good score is never mistaken for the whole picture.
2. **A perfect score leads to the next level.** When no fix is left, the headline says "You are ready to be found. Next: ..." and shows free next steps (Google Business Profile, reviews, mentions and links from others, weekly freshness).
3. **The weekly watch is the reason to stay.** Each weekly run keeps the findings (`VisibilityScore.findings`, a nullable column) and compares them with last week's:
   - a check that was fine and is now certainly missing is an alert;
   - a break is looked at a second time before anyone is told, so one bad moment never causes a scare;
   - a check we could not make is a quiet note, never an alert, and never changes the score;
   - the score change is worked out only from checks made both times;
   - fixes are told as good news; a certificate about to end is a heads-up before it hurts.
   The weekly email puts what changed first, and its subject says when something needs attention.
4. **"Could not look" never becomes "does not exist".** A missing domain is only reported when an independent resolver (Cloudflare DNS over HTTPS) agrees (found while scanning our own site).

## Consequences

- One expand-only migration (`findings` JSONB, nullable). The first run for a business has nothing to compare, so it reports nothing new.
- The watch promise on the result page is only true if weekly emails are delivered: the sending domain must be verified in Resend. This is a launch precondition.
- Not built yet, by design: reviews and Google listing (needs the Google Places key), AI-assistant visibility (needs budget), alerts by WhatsApp.
