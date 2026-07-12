# DONLIEN OS

Production foundation for `DONLIEN.XYZ`, built from `DONLIEN_CODEX_DEPLOY_KIT_V1`.

## Commands

```bash
npm install
npm run build
npm run lint
npm run security:secret-scan
npm run security:auth-tests
```

## Netlify

- Base directory: blank
- Build command: `npm run build`
- Publish directory: blank
- Node: `22`

## Environment

Copy `.env.example` into Netlify environment variables. Never commit real secrets.

Required credential-dependent features:

- `OPENAI_API_KEY`
- `OPENAI_IMAGE_MODEL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ADMIN_ACCESS_CODE`
- `NEW_LIEN_WEBHOOK_URL` optional

## Supabase

Run `supabase/schema.sql` before enabling production writes. RLS is enabled in the migration and public enumeration is blocked.

## Admin Access

Admin lives at `/admin`.

Set `ADMIN_ACCESS_CODE` to a long random value of at least 32 characters. The login route validates the code server-side, rate-limits failed attempts, and creates an httpOnly secure same-site session cookie that expires after one hour.

## Signup Stages

The Become a LIEN flow tracks these stages through `/api/signup-events`:

- `human_input`: name and role selection
- `upload`: portrait upload step
- `transform`: AI LIENification request started
- `review`: user reviews generated or demo identity
- `activation`: identity save/activation completed

Tracking is best-effort and never blocks the user-facing wizard. Without Supabase credentials, tracking returns a safe warning and does not persist.

## Abandonment

A signup is considered `abandoned` when it is incomplete and has had no activity for more than 24 hours. Admin and CSV exports compute that state from `signup_completed` and `last_activity_at`.

## CSV Export

CSV export is available only after admin login:

`/api/admin/liens/export`

The export honors the same filters as the admin table: role, Genesis status, from date, and to date. Public CSV export is not available.

## Webhooks

Set `NEW_LIEN_WEBHOOK_URL` to receive server-side webhook notifications for saved identities and completed signup events. The webhook URL is never returned to the browser and is redacted from logs. The admin table and CSV include `webhook_status`.

## Security Limitations

- In-memory rate limits reset on serverless cold starts. Use a durable store before serious traffic.
- Admin code auth is the minimum acceptable protection; replace with a real identity provider before broad operations.
- OpenAI spend controls should also be configured in the OpenAI dashboard.
- Supabase private Storage must be provisioned before storing portraits persistently.

## Credential-Dependent Features

- OpenAI LIEN image generation requires `OPENAI_API_KEY`.
- Persistent identity saves and signup tracking require Supabase URL and service role credentials.
- Admin record viewing and CSV export require Supabase plus `ADMIN_ACCESS_CODE`.
- Webhook delivery requires `NEW_LIEN_WEBHOOK_URL`.
