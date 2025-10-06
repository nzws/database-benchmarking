import { bench } from "bench";

const ASIA_REGIONS = new Set(["sin", "nrt", "bom"]);

async function main() {
  const {
    AXIOM_TOKEN,
    AXIOM_DATASET,
    CLOUDFLARE_WORKERS_ENDPOINT,
    FLY_REGION = "unknown",
  } = process.env;
  if (!AXIOM_TOKEN || !AXIOM_DATASET || !CLOUDFLARE_WORKERS_ENDPOINT) {
    throw new Error("Missing required environment variables");
  }

  console.log(`Current region: ${FLY_REGION}`);
  console.log(
    `Triggering Cloudflare Workers endpoint: ${CLOUDFLARE_WORKERS_ENDPOINT}`,
  );
  await fetch(CLOUDFLARE_WORKERS_ENDPOINT, { method: "POST" });

  const isAsia = ASIA_REGIONS.has(FLY_REGION);
  console.log(`isAsia: ${isAsia}`);
  const regionKey = isAsia ? "sin" : "iad";

  const database = {
    sin: process.env.DB_SIN,
    iad: process.env.DB_IAD,
  }[regionKey];
  if (!database) {
    throw new Error(`No database configured for region: ${regionKey}`);
  }

  console.log(`Benchmarking database in region: ${regionKey}`);
  await bench({
    connectionString: database,
    AXIOM_TOKEN,
    AXIOM_DATASET,
    environment: `Fly.io (region: ${FLY_REGION}, DB: ${regionKey})`,
  });
}

void (async () => {
  try {
    await main();
  } catch (e) {
    console.error(e);
    process.exit(1);
  } finally {
    process.exit(0);
  }
})();
