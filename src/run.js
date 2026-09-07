import { readConfig } from "./config.js";
import { captureScreenshot } from "./screenshot.js";
import { uploadScreenshot } from "./storage.js";

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {Promise<{filename: string, key: string}>}
 */
export async function run(env = process.env) {
  const config = readConfig(env);
  const now = new Date();
  const date = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map((part) => String(part).padStart(2, "0"))
    .join("-");
  const filename = `${date}.png`;
  const key = [config.prefix, filename].filter(Boolean).join("/");

  console.log("Getting screenshot...");
  const image = await captureScreenshot(config, filename);
  console.log("Uploading to S3...");
  await uploadScreenshot(config, key, image);
  console.log(`Uploaded to s3://${config.bucket}/${key}`);
  return { filename, key };
}
