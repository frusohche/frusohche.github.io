// Full-page screenshot: node screenshot.mjs <url> [label]
// Saves to ./temporary screenshots/screenshot-N[-label].png (auto-incremented)
import { mkdir, readdir } from 'node:fs/promises';
import { join } from 'node:path';

let puppeteer;
try {
  puppeteer = (await import('puppeteer')).default;
} catch {
  console.error('Puppeteer not found. Run: npm install puppeteer');
  process.exit(1);
}

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3];
const dir = 'temporary screenshots';

await mkdir(dir, { recursive: true });
const nums = (await readdir(dir))
  .map((f) => /^screenshot-(\d+)/.exec(f)?.[1])
  .filter(Boolean)
  .map(Number);
const n = (nums.length ? Math.max(...nums) : 0) + 1;
const out = join(dir, `screenshot-${n}${label ? `-${label}` : ''}.png`);

const browser = await puppeteer.launch();
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
  // Scroll through the page so scroll-triggered reveals fire, then return to top
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 400) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise((r) => setTimeout(r, 150)); }
    await new Promise((r) => setTimeout(r, 400));
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
  await new Promise((r) => setTimeout(r, 1200)); // let fonts/animations settle
  await page.screenshot({ path: out, fullPage: true });
  console.log(`Saved ${out}`);
} finally {
  await browser.close();
}
