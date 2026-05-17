This is a [Next.js](https://nextjs.org) app (`web` workspace) for THE-SYNTRAA.

## Run locally

From the **repository root**:

```bash
npm run dev:web
```

Or from `apps/web`:

```bash
npm run dev
```

### Dev server port (3000 vs fallback)

`next dev` binds to port **3000** by default. If that port is already in use, Next.js picks the next free port (**3001**, **3002**, …) and prints the exact **Local** URL in the terminal. Always open the URL shown there, not an assumed port.

Set these to the same origin you open (including port), so absolute links, redirects, and sitemap generation stay correct:

- `NEXT_PUBLIC_SITE_URL` (browser-facing site origin)
- `CLIENT_ORIGIN` and `WEB_PUBLIC_URL` (server defaults for CORS / callbacks)

Example if the terminal shows `http://localhost:3001`:

```env
NEXT_PUBLIC_SITE_URL=http://localhost:3001
CLIENT_ORIGIN=http://localhost:3001
WEB_PUBLIC_URL=http://localhost:3001
```

Copy `apps/web/.env.example` to `apps/web/.env.local` and adjust. For MongoDB Atlas credentials and `MONGODB_URI`, see the comments in `.env.example`. Verify connectivity with:

```bash
npm run mongo:ping
```

(from repo root; uses `apps/web/.env.local`)

If `mongo:ping` fails with **TLS** / `tlsv1 alert internal error`, the Atlas host is reachable but SSL on the path is being broken (common with antivirus HTTPS inspection on Windows). Try another network or VPN, pause SSL scanning for dev, or add Atlas’s **standard** `mongodb://…` string as `MONGODB_URI_DIRECT` per [`.env.example`](.env.example).

After rotating credentials in Atlas → Database Access, paste the new connection string from **Connect → Drivers → Node.js** into `MONGODB_URI` in `.env.local` so the URI always matches Atlas.

Create or update the admin user (needs a working Mongo connection):

```bash
npm run seed:admin -w web
```

### Admin UI smoke test (no database)

With the dev server running (`npm run dev:web` from repo root), in a second terminal:

```bash
npm run dev:smoke
```

This checks that `/` and `/admin/login` return a successful response using `NEXT_PUBLIC_SITE_URL`. Full login still requires MongoDB + a seeded admin.

### npm audit

From the repository root, `npm audit` may still list **moderate** issues on transitive packages (for example PostCSS nested under Next.js). Avoid `npm audit fix --force` here: npm may try to install an incompatible old Next.js release. Run `npm audit fix` without `--force` first, and prefer upgrading direct dependencies when advisories target them. Re-check with `npm audit`.

## Production (optional)

Deploy the `web` app (for example on [Vercel](https://vercel.com)) and set the same variables as in [`.env.example`](.env.example) in the project’s **Environment Variables** UI. Minimum for a working shop + admin API:

- `MONGODB_URI` (and optionally `MONGODB_URI_DIRECT` / `MONGODB_DNS_SERVERS` if you hit the same DNS/TLS issues as locally)
- `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`
- `NEXT_PUBLIC_SITE_URL`, `CLIENT_ORIGIN`, `WEB_PUBLIC_URL` — all set to your **live** origin (for example `https://yourdomain.com`)
- Payment and media keys when you enable those features

After deploy, run `npm run seed:admin -w web` once against production `MONGODB_URI` (or run an equivalent seed from a secure admin machine) so an admin user exists before logging in at `/admin/login`.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Next.js GitHub](https://github.com/vercel/next.js)
