import { bench } from "bench";

async function main() {
  const {
    DATABASE_URL,
    AXIOM_TOKEN,
    AXIOM_DATASET,
    CLOUDFLARE_WORKERS_ENDPOINT,
    FLY_REGION = "unknown",
  } = process.env;
  if (
    !DATABASE_URL ||
    !AXIOM_TOKEN ||
    !AXIOM_DATASET ||
    !CLOUDFLARE_WORKERS_ENDPOINT
  ) {
    throw new Error("Missing required environment variables");
  }

  await fetch(CLOUDFLARE_WORKERS_ENDPOINT, { method: "POST" });

  await bench({
    connectionString: DATABASE_URL,
    AXIOM_TOKEN,
    AXIOM_DATASET,
    environment: `fly-${FLY_REGION}`,
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
