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
