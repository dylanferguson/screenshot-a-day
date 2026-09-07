import { run } from "./run.js";

try {
  await run();
} catch (error) {
  console.error(`Screenshot failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
}
