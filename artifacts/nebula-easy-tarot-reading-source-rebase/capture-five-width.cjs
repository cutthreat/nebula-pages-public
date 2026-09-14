const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt';
const output = __dirname;
const widths = process.argv[3] ? [Number(process.argv[3])] : [1200, 992, 768, 576, 320];
const prefix = process.argv[2] || 'post';
const proof = { url: 'http://127.0.0.1:8765/nebula-easy-tarot-reading.html', prefix, status: 'pass', widths: [], generatedAt: new Date().toISOString() };

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const consoleErrors = [];
      const failedLocalRequests = [];
      page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
      page.on('requestfailed', (request) => { if (request.url().startsWith('http://127.0.0.1:8765/')) failedLocalRequests.push(request.url()); });
      const response = await page.goto(proof.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((resolve) => setTimeout(resolve, 8)); } window.scrollTo(0, 0); });
      const metrics = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight, readerCount: document.querySelectorAll('.tarot-experts__grid > .apn-love-card').length, faqCount: document.querySelectorAll('.faq-section__toggle').length }));
      await page.screenshot({ path: path.join(output, `${prefix}-${width}.png`), fullPage: true });
      let menu = 'n/a';
      if (width < 992) {
        await page.locator("button[aria-label='Open menu'][data-target='#navbarOffcanvasTarot']").first().click();
        await page.waitForTimeout(150);
        const opened = await page.locator('#navbarOffcanvasTarot').evaluate((node) => node.classList.contains('show'));
        await page.locator('.site-header__offcanvas-close').click();
        await page.waitForTimeout(150);
        const closed = await page.locator('#navbarOffcanvasTarot').evaluate((node) => !node.classList.contains('show'));
        menu = opened && closed ? 'pass' : 'fail';
      }
      const record = { width, http: response?.status() || 0, metrics, menu, consoleErrors, failedLocalRequests };
      if (record.http !== 200 || record.metrics.scrollWidth > record.metrics.clientWidth || record.metrics.readerCount !== 6 || record.metrics.faqCount !== 6 || record.menu === 'fail' || consoleErrors.length || failedLocalRequests.length) proof.status = 'fail';
      proof.widths.push(record);
      await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(output, `${prefix}-runtime-proof.json`), `${JSON.stringify(proof, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ status: proof.status, widths: proof.widths.map(({ width, http, metrics, menu, consoleErrors, failedLocalRequests }) => ({ width, http, metrics, menu, consoleErrors: consoleErrors.length, failedLocalRequests: failedLocalRequests.length })) }, null, 2)}\n`);
})().catch((error) => { console.error(error.stack || error); process.exit(1); });
