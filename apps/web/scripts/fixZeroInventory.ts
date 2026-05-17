/**
 * One-time: set variant inventory to 25 where it is 0 or missing.
 * Run from repo root: npm run fix-inventory -w web
 */
import "./bootstrap-env";
import { connectMongo } from "../src/server/db/mongoose";
import { Product } from "../src/server/models/Product";

const DEFAULT_STOCK = 25;

async function main() {
  await connectMongo();
  const products = await Product.find({});
  let updated = 0;
  for (const p of products) {
    let changed = false;
    for (const v of p.variants ?? []) {
      if (!v.inventory || v.inventory <= 0) {
        v.inventory = DEFAULT_STOCK;
        changed = true;
      }
    }
    if (changed) {
      await p.save();
      updated++;
      console.log(`Updated: ${p.title}`);
    }
  }
  console.log(`Done. ${updated} product(s) updated to stock ${DEFAULT_STOCK}.`);
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
