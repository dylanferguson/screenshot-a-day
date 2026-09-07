import { chromium } from "playwright-core";

/** @import {Config} from './config.js' */

/**
 * @param {Pick<Config, 'url' | 'browser'>} config
 * @param {string} [filename] Omit to return PNG bytes without writing a file.
 * @returns {Promise<Buffer>}
 */
export async function captureScreenshot(config, filename) {
  const browser = await chromium.launch(config.browser);
  try {
    const page = await browser.newPage({ viewport: { width: 1042, height: 1600 } });
    await page.goto(config.url, { waitUntil: "load", timeout: 30_000 });
    return await page.screenshot({ path: filename, type: "png", timeout: 30_000 });
  } finally {
    await browser.close();
  }
}
