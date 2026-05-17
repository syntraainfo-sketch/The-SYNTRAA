/**
 * Smoke test: public home + admin login page (no Mongo required).
 * Run `npm run dev:web` from repo root first, then: `npm run dev:smoke -w web`
 */
const base = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

async function check(path, label) {
  const url = `${base}${path}`;
  const res = await fetch(url, {
    redirect: "manual",
    signal: AbortSignal.timeout(15_000),
  });
  if (res.status >= 200 && res.status < 400) {
    console.info(`OK ${label}: ${url} (${res.status})`);
    return;
  }
  throw new Error(`${label} ${url} returned ${res.status}`);
}

async function main() {
  await check("/", "home");
  await check("/admin/login", "admin login");
  console.info("dev:smoke passed — site and admin login route respond.");
}

main().catch((e) => {
  console.error(e?.message ?? e);
  console.error(
    "\nTip: start the app first (`npm run dev:web` from repo root), then ensure NEXT_PUBLIC_SITE_URL matches the URL in the terminal (port 3000 vs 3001)."
  );
  process.exit(1);
});
