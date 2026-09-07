import * as z from "zod";

/**
 * @template {z.ZodType} T
 * @param {T} schema
 */
const envValue = (schema) =>
  z.preprocess((value) => (typeof value === "string" ? value.trim() || undefined : value), schema);
const optionalString = envValue(z.string().optional());

// Compile the final schema once, including normalization and cross-field checks.
const configSchema = z.compile(
  z
    .object({
      URL: envValue(
        z.string({ error: "URL is required" }).pipe(
          z.url({
            protocol: /^https?$/,
            error: "URL must be an absolute HTTP or HTTPS URL",
          }),
        ),
      ),
      BUCKET_NAME: envValue(
        z
          .string({ error: "BUCKET_NAME is required" })
          .regex(
            /^(?!.*\.\.)(?!\d+\.\d+\.\d+\.\d+$)[a-z0-9][a-z0-9.-]{1,61}[a-z0-9]$/,
            "BUCKET_NAME must be an S3 bucket name, not a URL or path",
          ),
      ),
      SUBDIR_PATH: optionalString,
      AWS_REGION: optionalString,
      REGION: optionalString,
      BROWSER_CHANNEL: envValue(
        z
          .enum(["chrome", "msedge", "chromium"], {
            error: "BROWSER_CHANNEL must be chrome, msedge, or chromium",
          })
          .optional(),
      ),
      BROWSER_EXECUTABLE_PATH: optionalString,
    })
    .refine((env) => !(env.BROWSER_CHANNEL && env.BROWSER_EXECUTABLE_PATH), {
      error: "Set only one of BROWSER_CHANNEL and BROWSER_EXECUTABLE_PATH",
    })
    .transform((env) => ({
      url: env.URL,
      bucket: env.BUCKET_NAME,
      prefix: (env.SUBDIR_PATH ?? "").replace(/^\/+|\/+$/g, ""),
      region: env.AWS_REGION ?? env.REGION,
      browser: {
        headless: true,
        channel: env.BROWSER_CHANNEL,
        executablePath: env.BROWSER_EXECUTABLE_PATH,
      },
    })),
  { strict: true },
);

/** @typedef {z.output<typeof configSchema>} Config */

/**
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {Config}
 */
export function readConfig(env = process.env) {
  const result = configSchema.safeParse(env);
  if (!result.success) {
    throw new Error(
      `Invalid configuration: ${result.error.issues.map((issue) => issue.message).join("; ")}`,
    );
  }
  return result.data;
}
