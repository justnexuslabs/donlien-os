# Production Security Hardening

## Controls Added

- Secrets are referenced only from server routes: `OPENAI_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_ACCESS_CODE`, and `NEW_LIEN_WEBHOOK_URL`.
- `.env*` is ignored while `.env.example` remains committed.
- All mutation API payloads are validated with Zod.
- Portrait uploads are limited to JPG, PNG, or WEBP, maximum 8 MB, and validated with magic bytes to reject MIME mismatches.
- `/api/transform`, `/api/liens`, and `/api/admin/login` include in-memory rate limits.
- Mutation routes enforce same-origin checks before processing.
- Security headers are set globally in `next.config.ts`, including CSP, HSTS, `nosniff`, referrer policy, permissions policy, and `frame-ancestors 'none'`.
- Public `/api/liens` enumeration is blocked.
- Admin authentication uses a long `ADMIN_ACCESS_CODE`, constant-time comparison, rate limiting, and an httpOnly secure same-site session cookie that expires after one hour.
- User-generated text is sanitized before server persistence and rendered through React text nodes.
- Structured logs redact keys, secrets, codes, tokens, webhook URLs, and portrait data.
- OpenAI generation is only available through `/api/transform`, with file validation and rate limiting.
- Supabase RLS is enabled in `supabase/schema.sql`; public select/insert/update/delete policies are denied.
- Portraits are not written to unrestricted public storage. Production portrait storage must use a private Supabase Storage bucket with signed access.

## Remaining Risks Before Public Production

- In-memory rate limits reset on serverless cold starts. Use a durable rate-limit store such as Upstash Redis or Supabase-backed counters before high-traffic launch.
- Supabase migration must be run manually and verified in the Supabase dashboard.
- Private Supabase Storage bucket and signed URL flow must be provisioned before storing portraits.
- Admin access code is an acceptable minimum only if it is long and random; a real identity provider should replace it before broader operational use.
- OpenAI spend controls should also be enforced in the OpenAI dashboard and billing limits, not only in app rate limits.
- `npm audit` and dependency review must be rerun during each production release.
