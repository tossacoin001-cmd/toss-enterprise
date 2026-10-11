# @toss/email

Shared Resend client and `sendEmail` helper. Extracted from `apps/website/lib/resend.ts`
at its second occurrence (`apps/visibility-os`'s weekly digest), per the dedup rule in
[docs/01-architecture/monorepo.md](../../docs/01-architecture/monorepo.md).

`resend` is `null` when `RESEND_API_KEY` is unset; `sendEmail` returns `{ ok: false, error }`
in that case instead of throwing, so callers degrade gracefully.
