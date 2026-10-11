# ADR-0013: Migrations run only in production builds; migrations are expand-only; one URL-safety module

- **Status:** Accepted
- **Date:** 2026-10-11
- **Deciders:** Founder (answers of 2026-10-10: fix the security gaps now, make the shared-database risk impossible, tests first), implemented by AI per that direction

## Context

Two problems were found on 2026-10-10 while testing for the instant scan.

1. **Previews share the production database.** Read from Vercel's API: the `POSTGRES_*` variables apply to Production, Preview and Development alike, and the build command ran `prisma migrate deploy` for every build. So building **any branch preview applied that branch's migrations to the production database** before anything was merged. The 2026-10-09 migration reached production this way. It was additive and harmless; a destructive one would not have been.
2. **The URL guard let dangerous requests through.** A probe of 33 dangerous addresses against the real code found 10 still requested: non-standard ports (6379, 22, 25, 8443), credentials in the URL, and reserved ranges (100.64/10, 198.18/15, 192.0.0.0/24, multicast, broadcast). The signed-in audit has the hole today and the public instant scan would inherit it, letting a stranger use our servers to probe other machines.

## Decision

1. **Migrations run only when `VERCEL_ENV` is exactly `production`.** `vercel.json` wraps `prisma migrate deploy` in `if [ "$VERCEL_ENV" = "production" ]`. Preview and development builds build the app and never touch the database. Anything else (unset, empty, `Production`, `staging`) counts as not production, so a mistake fails safe. Previews therefore run against the production schema; that is acceptable because previews cannot sign in (Clerk keys exist only in Production) and use the database only for the health check.
2. **Migrations are expand-only.** Production migrates *before* the new code goes live, and old code keeps running during the build, so every migration must be safe for the release that is currently running: add tables, columns (nullable or with a default) and indexes; do not drop, rename, retype, truncate, or make an existing column required in the same release. Removing something takes two releases (stop using it, then drop it). A test reads every migration and fails on the destructive forms. A destructive migration needs a recorded decision and a `-- DESTRUCTIVE-APPROVED: <reason>` line in the file.
3. **A separate preview database is deferred, with a trigger.** Isolating previews fully needs a second database (a second Supabase project or a Neon branch). Not worth the cost or the second pausing risk today. Trigger: the first time a preview must run database-backed behaviour, or before the first paying customer, whichever comes first.
4. **One URL-safety module, `lib/url-safety.ts`.** It decides which addresses may be fetched, for the first request and for every redirect: only `http` and `https`; only the scheme's own port; no credentials; no IP addresses of any kind (we scan websites by name); no local or internal names (`.local`, `.localhost`, `.internal`, `.lan`, `.home.arpa`, `.corp`, `.intranet`, `.private`); length limits; and, after DNS, no address in any IANA special-use range (IPv4 and IPv6, including IPv4-mapped, NAT64, 6to4 and Teredo forms), using Node's `BlockList`. Anything that is not a valid IP fails closed.

## Alternatives considered

- **Keep migrating in previews and rely on review.** Depends on a person noticing every migration of every branch. Rejected.
- **Move migrations out of the build into a manual step.** Risks the code going live without its schema. Rejected; gating on production keeps the safe order.
- **Create a preview database now.** The real fix, but adds cost and a second database that can pause. Deferred (decision 3).
- **Allow-list of ports (80, 443, 8080, 8443).** Websites on alternative ports are rare among the businesses we serve, and each extra port is a probing opportunity. Rejected.
- **Pin the connection to the resolved IP to close the DNS time-of-check gap.** Needs a custom connector (a new dependency) and belongs with the instant-scan engine (slice S1, test SE-06). Not in this change.

## Consequences

- Preview builds are faster and can no longer change production data.
- A new migration must be additive. The test names the exact rule broken; the author either redesigns the change or records the approval.
- The build log for previews will show no migration step; production still shows it. The runbook documents both.
- Addresses typed as an IP, with a port, or with credentials now get "that is not a valid website address" in the audit instead of being scanned. Real small-business sites do not need them.
- Remaining known gap, tracked as SE-06: the address is checked and then fetched again, so a hostile DNS server could answer differently the second time. Planned for S1.
