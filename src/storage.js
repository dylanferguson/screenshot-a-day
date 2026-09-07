import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

/**
 * @param {Pick<import('./config.js').Config, 'bucket' | 'region'>} config
 * @param {string} key
 * @param {Buffer} image
 * @returns {Promise<void>}
 */
export async function uploadScreenshot(config, key, image) {
  // The default provider chain supports CLI sessions, SSO, OIDC, and IAM roles.
  const client = new S3Client({ region: config.region });
  try {
    await client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: image,
        ContentType: "image/png",
      }),
    );
  } finally {
    client.destroy();
  }
}
