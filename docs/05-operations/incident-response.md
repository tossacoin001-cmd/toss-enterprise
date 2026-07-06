# Incident Response

This document owns what to do when production breaks. Sized for a solo operator: no on-call rotation, just a clear sequence and an honest log.

## Severity

- **SEV1**: money or trust is bleeding. Payments path broken, site down, data exposed, auth broken.
- **SEV2**: a feature is broken but customers can still pay and reach us.
- **SEV3**: cosmetic or internal.

## The sequence

1. **Stop the bleeding.** Vercel Instant Rollback to the last good deployment ([deployment.md](deployment.md)). For a suspected data exposure, rotate the affected secrets first ([../01-architecture/security.md](../01-architecture/security.md)).
2. **Tell affected customers** honestly and briefly (WhatsApp for active clients). Silence costs more than the bug.
3. **Fix forward** on a branch, verify on a preview deploy, merge, watch it deploy.
4. **Log it** below, same day, while it is fresh.
5. **Prevent it**: the log entry must name one concrete change (a test, an alert, a doc fix). Do it or schedule it in the phases doc.

## Suspected security incident specifics

Rotate first, investigate second. The rotation checklist per secret is in environments-and-secrets.md. If customer PII was exposed, notify affected customers; do not wait for certainty.

## Incident log

| Date | Sev | What happened | Root cause | Prevention |
|---|---|---|---|---|
| (none recorded yet; log every SEV1/SEV2 from now on) | | | | |
