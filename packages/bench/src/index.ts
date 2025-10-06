import { Axiom } from "@axiomhq/js";
import { Client } from "pg";

interface Stats {
  min: number;
  max: number;
  avg: number;
  p50: number;
  p95: number;
  p99: number;
}

function calculateStats(durations: number[]): Stats {
  const sorted = [...durations].sort((a, b) => a - b);
  const sum = sorted.reduce((a, b) => a + b, 0);

  return {
    min: sorted[0] ?? 0,
    max: sorted[sorted.length - 1] ?? 0,
    avg: sum / sorted.length,
    p50: sorted[Math.floor(sorted.length * 0.5)] ?? 0,
    p95: sorted[Math.floor(sorted.length * 0.95)] ?? 0,
    p99: sorted[Math.floor(sorted.length * 0.99)] ?? 0,
  };
}

async function benchSelect(
  sql: Client,
  iterations: number,
): Promise<{ durations: number[]; errors: number }> {
  const durations: number[] = [];
  let errors = 0;

  for (let i = 0; i < iterations; i++) {
    const userId = Math.floor(Math.random() * 1000) + 1;
    const start = performance.now();
    try {
      await sql.query("SELECT * FROM users WHERE id = $1", [userId]);
      durations.push(performance.now() - start);
    } catch (e) {
      errors++;
      console.error("SELECT error:", (e as Error).message);
    }
  }

  return { durations, errors };
}

async function benchUpdate(
  sql: Client,
  iterations: number,
): Promise<{ durations: number[]; errors: number }> {
  const durations: number[] = [];
  let errors = 0;

  for (let i = 0; i < iterations; i++) {
    const postId = Math.floor(Math.random() * 7500) + 1;
    const start = performance.now();
    try {
      await sql.query(
        "UPDATE posts SET view_count = view_count + 1 WHERE id = $1",
        [postId],
      );
      durations.push(performance.now() - start);
    } catch (e) {
      errors++;
      console.error("UPDATE error:", (e as Error).message);
    }
  }

  return { durations, errors };
}

export async function bench({
  connectionString,
  environment,
  AXIOM_TOKEN,
  AXIOM_DATASET,
}: {
  connectionString: string;
  environment: string;
  AXIOM_TOKEN: string;
  AXIOM_DATASET: string;
}) {
  const axiom = new Axiom({
    token: AXIOM_TOKEN,
  });
  const sql = new Client({ connectionString });
  const iterations = 100;

  try {
    await sql.connect();

    // Warm up
    await benchSelect(sql, 10);
    await benchUpdate(sql, 10);

    // Benchmark - SELECT
    const selectResult = await benchSelect(sql, iterations);
    const selectStats = calculateStats(selectResult.durations);
    axiom.ingest(AXIOM_DATASET, {
      timestamp: new Date().toISOString(),
      environment,
      operation: "SELECT",
      iterations,
      successCount: selectResult.durations.length,
      errorCount: selectResult.errors,
      stats: selectStats,
    });

    // Benchmark - UPDATE
    const updateResult = await benchUpdate(sql, iterations);
    const updateStats = calculateStats(updateResult.durations);
    axiom.ingest(AXIOM_DATASET, {
      timestamp: new Date().toISOString(),
      environment,
      operation: "UPDATE",
      iterations,
      successCount: updateResult.durations.length,
      errorCount: updateResult.errors,
      stats: updateStats,
    });
  } catch (e) {
    console.error(e);

    axiom.ingest(AXIOM_DATASET, {
      timestamp: new Date().toISOString(),
      environment,
      operation: "ERROR",
      error: (e as Error).message,
    });
  } finally {
    await axiom.flush();
    await sql.end();
  }
}
