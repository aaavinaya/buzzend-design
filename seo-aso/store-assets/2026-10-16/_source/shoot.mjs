import { chromium } from 'playwright';
import { readFileSync } from 'fs';

// usage: node shoot.mjs <jobs.json>
// job: { url, out, width, height, scale, settle, hideCss, localStorage }
const jobs = JSON.parse(readFileSync(process.argv[2], 'utf8'));

const browser = await chromium.launch();
for (const j of jobs) {
  const ctx = await browser.newContext({
    viewport: { width: j.width, height: j.height },
    deviceScaleFactor: j.scale ?? 1,
    colorScheme: j.colorScheme ?? 'light',
  });
  if (j.localStorage) {
    await ctx.addInitScript((entries) => {
      for (const [k, v] of Object.entries(entries)) localStorage.setItem(k, v);
    }, j.localStorage);
  }
  const page = await ctx.newPage();
  await page.goto(j.url, { waitUntil: 'networkidle', timeout: 30000 });
  if (j.hideCss) await page.addStyleTag({ content: j.hideCss });
  await page.waitForTimeout(j.settle ?? 1200);
  await page.screenshot({ path: j.out });
  await ctx.close();
  console.log('OK', j.out);
}
await browser.close();
