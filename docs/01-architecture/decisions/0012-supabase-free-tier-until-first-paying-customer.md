# ADR-0012: Stay on the free Supabase tier, with monitoring, until the first paying customer

- **Status:** Accepted
- **Date:** 2026-10-10
- **Deciders:** Founder (database options discussion, 2026-10-10), implemented by AI per that direction

## Context

Visibility OS's Postgres is a free-tier Supabase project
(`supabase-champagne-nest`, via the Vercel integration, ADR-0007). Free
projects pause after about a week of inactivity. Because the Vercel build runs
`prisma migrate deploy` first, a paused database fails every deploy. That
happened from 2026-08-29 to 2026-10-10 and nobody was alerted, so production
quietly stayed on a July build and shipped work never went live. The same
pausing had already hit the website's database on 2026-07-31 (solved there by
moving the contact form to MongoDB). `docs/01-architecture/infrastructure.md`
requires an ADR with a monthly cost before any component leaves a free tier.

## Decision

1. **Until the first paying customer, stay on the free tier**, and make
   failure loud and unlikely instead of paying early:
   - `GET /api/health` reads the database and returns 200 or 503; an external
     uptime monitor calls it every 5 minutes and emails the operator. The
     regular read also counts as database activity, as does the daily cron.
   - Vercel deploy-failure and GitHub CI notifications must be on, so a red
     production deploy cannot go unnoticed again.
   - A written runbook ([database-and-deploy-runbook.md](../../05-operations/database-and-deploy-runbook.md)).
2. **Before the first paying customer, upgrade to Supabase Pro.** Estimated
   $25 a month (about ₦33,000 at ₦1,333 per dollar), which includes compute
   credit. It removes pausing and adds backups. With the planned ₦9,900
   Growth plan that is about four customers to break even (about seven at the
   ₦4,900 founding price). The trigger is concrete: upgrade before billing is
   switched on or any real customer is invited, whichever is first.
3. **The migration-in-build stays**, because skipping migrations risks schema
   drift between code and database, and the monitoring above now makes the
   failure visible. Revisit if build-time database coupling causes repeated
   pain.

## Alternatives considered

- **Pay for Pro now.** Safest, but about ₦33,000 a month while there are no
  customers, and the founder's own account is the only production user.
- **Move to Neon.** Free tier scales compute to zero but wakes on use, and I
  found no policy that deletes idle projects (not confirmed). Costs a data
  move, cold-start latency, and unverified terms, to save money Pro would cost
  only once there are customers. Remains the fallback if cash is too tight for
  Pro.
- **Keep-alive only, no monitor.** A keep-alive does not tell anyone when it
  stops working; the monitor does.
- **Self-host Postgres.** Operational burden that does not fit a one-operator
  company.

## Consequences

- Until the upgrade, the free tier has no uptime promise and no automatic
  backups. This is accepted only because production holds one account
  (the founder's) and no customer data.
- A new unauthenticated endpoint (`/api/health`) exists; it returns only
  `ok` or `down`.
- Exact Supabase Pro terms (per organization or per project, compute credit)
  come from third-party sources and must be confirmed on Supabase's pricing
  page at upgrade time.
- TE-OS uses a separate free Supabase project with its own daily keep-alive;
  it is out of scope here.
