# ADR-0016: Instant scan API, daily limits and Turnstile

- **Status:** Accepted
- **Date:** 2026-10-11
- **Deciders:** Founder (approved the abuse limits and Decision A, created the Cloudflare account), implemented by AI

## Context

The free instant scan has no sign-up, so anyone on the internet can start a scan that makes our server fetch other people's sites. It must be cheap, hard to abuse and kind to honest visitors, including the many Nigerian mobile users who share one carrier address.

## Decision

1. **Request order:** input check, then Cloudflare Turnstile, then the shared cache, then the limits, then the scan. A bad input costs nothing and never uses a human-check token. Cached results are free for everyone, even when limits are hit.
2. **Limits (Lagos day, UTC+1, no clock changes):** 3 new sites per browser per day (signed, HttpOnly cookie), 30 scans per network per day, 300 new scans per day for the whole service, one fresh scan per site per 24 hours shared by everyone. A refused request uses no quota. Hitting the whole-service cap raises one alert per day.
3. **Identity without keeping it:** only `x-vercel-forwarded-for` is trusted; a visitor-sent `x-forwarded-for` changes nothing. No address is stored: the visitor hash is `sha256(salt:day:ip)` with a daily-changing salt. Visitors with no usable address share one cautious bucket instead of getting free scans.
4. **Fails closed:** if Turnstile or its key is missing or unreachable, the scan does not start and says "try again". If the database fails, the visitor still gets their result, marked not stored.
5. **One scan per site at a time:** creation is serialised by a database lock on the site key, so two people scanning the same new site at the same moment cause one scan (verified against a real Postgres).
6. **Scan ids** are 128-bit random hex; unknown, malformed and expired ids all get the same 404. A scan still "running" after 90 seconds is reported as incomplete, never a stuck spinner. Unclaimed scans expire after 30 days.
7. **Secrets:** the cookie secret and visitor salt are derived from the Turnstile secret, so there is nothing new to configure.

## Consequences

- Two new Production variables: `NEXT_PUBLIC_TURNSTILE_SITE_KEY` and `TURNSTILE_SECRET_KEY`.
- One new table, `Scan` (expand-only migration, no foreign keys yet; the claim link to a user arrives in S4).
- A determined attacker with many addresses can still use the 300-a-day cap and show "busy" to honest visitors. Accepted; mitigations are in the plan (raise the cap, per-/24 rule, alert).
- The cap, per-network and per-browser numbers are constants in `lib/scan-limits/service.ts` and are meant to be tuned with real traffic.
