# Vercel + Hostinger (THE SYNTRAA)

The production stack is a **single Next.js app** (`apps/web`) on Vercel. API routes live under **`/api/v1/*`** (App Router Route Handlers). MongoDB Atlas and Cloudinary are unchanged.

## Vercel project

1. Import the GitHub repo in Vercel.
2. **Root Directory:** `apps/web` **or** repository root with **Install** at root (see Monorepo below).
3. **Framework preset:** Next.js.
4. **Build command (from repo root):**  
   `npm install && npm run build -w @syntraa/types --if-present && npm run build -w web`
5. **Output:** default (Next handles it).

### Monorepo install

The web app depends on `@syntraa/types`. If Vercel’s **Root Directory** is `apps/web`, set **Install Command** to run from the repository root, for example:

`cd ../.. && npm install`

If the **Root Directory** is the repo root, use the default install and point the framework at `apps/web` per [Vercel monorepo docs](https://vercel.com/docs/monorepos).

## Environment variables (Vercel)

Copy values from `apps/web/.env.example`. Use **Production** vs **Preview** scopes as needed.

- **Public:** `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` (or alias `NEXT_PUBLIC_CLOUDINARY_PUBLIC_ID`) for image URLs in the browser.
- **Server:** `MONGODB_URI`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `WEB_PUBLIC_URL`, `CLIENT_ORIGIN`, Stripe secrets, Cloudinary (`CLOUDINARY_CLOUD_NAME` or `CLOUDINARY_PUBLIC_ID` / `cloudinary_public_id`; `CLOUDINARY_FOLDER` or `cloudinary_folder`), JazzCash / Easypaisa keys, `PKR_PER_USD`, etc.

Do **not** set `NEXT_PUBLIC_API_URL` for the Vercel-only layout; the client calls same-origin `/api/v1`.

## Stripe webhooks

Dashboard endpoint URL:

`https://<your-production-domain>/api/v1/webhooks/stripe`

Use the signing secret as `STRIPE_WEBHOOK_SECRET` in Vercel.

## PK payment callbacks

Point JazzCash / Easypaisa return/callback URLs to the **same host** as the storefront, for example:

- `https://<your-domain>/api/v1/payments/jazzcash/callback`
- `https://<your-domain>/api/v1/payments/easypaisa/callback`

## Hostinger DNS

1. In Vercel → Project → **Domains**, add `thesyntraa.com` and `www.thesyntraa.com`.
2. In Hostinger DNS:
   - **www:** `CNAME` to the target Vercel shows (e.g. `cname.vercel-dns.com`).
   - **apex:** use Vercel’s recommended **A** records or an **ALIAS/ANAME** if your DNS supports apex flattening.
3. Set `NEXT_PUBLIC_SITE_URL` and `WEB_PUBLIC_URL` to your canonical URL (usually `https://thesyntraa.com` or `https://www.thesyntraa.com`).

## Scripts (from repo root)

- `npm run db:indexes -w web` — sync MongoDB indexes.
- `npm run seed:admin -w web` — upsert super-admin (requires `SEED_ADMIN_PASSWORD`).

## Legacy Render config

`render.yaml` is archived under `docs/archive/` and is not part of the recommended deployment path.
