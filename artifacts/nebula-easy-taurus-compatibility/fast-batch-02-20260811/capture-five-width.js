const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');

const root = 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt';
const out = path.join(root, 'artifacts/nebula-easy-taurus-compatibility/fast-batch-02-20260811/postimages');
const url = 'http://127.0.0.1:8765/nebula-easy-taurus-compatibility.html';
const widths = [1200, 992, 768, 576, 320];

const hash = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const consoleErrors = [];
      const requestFailures = [];
      page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
      page.on('requestfailed', (request) => requestFailures.push(`${request.method()} ${request.url()} ${request.failure()?.errorText || ''}`));
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.evaluate(async () => { await document.fonts.ready; });
      const before = await page.evaluate(() => ({
        viewport: innerWidth,
        pageHeight: document.documentElement.scrollHeight,
        scrollWidth: document.documentElement.scrollWidth,
        overflow: document.documentElement.scrollWidth > innerWidth,
        brokenImages: [...document.images].filter((image) => !image.complete || !image.naturalWidth).map((image) => image.currentSrc || image.src),
        duplicateIds: [...document.querySelectorAll('[id]')].map((node) => node.id).filter((id, index, ids) => ids.indexOf(id) !== index)
      }));
      await page.screenshot({ path: path.join(out, `taurus-${width}.png`), fullPage: true });
      const faq = page.locator('[data-accordion] button');
      const faqStates = [];
      for (let index = 0; index < 5; index += 1) {
        await faq.nth(index).press('Enter');
        faqStates.push(await faq.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('aria-expanded'))));
      }
      const menu = page.locator('.tc-header__menu');
      let menuState = 'desktop-source-nav';
      if (await menu.isVisible()) {
        await menu.press('Enter');
        menuState = { opened: await menu.getAttribute('aria-expanded') };
        await page.keyboard.press('Escape');
        menuState.closed = await menu.getAttribute('aria-expanded');
      }
      await page.locator('[data-consultation-intent]').first().press('Enter');
      const consultation = await page.locator('#tc-host-intent').evaluate((node) => ({ open: node.open, videoHidden: node.querySelector('.tc-host-intent__video').hidden }));
      await page.locator('.tc-host-intent__close').press('Enter');
      await page.locator('[data-video-host-intent]').press('Enter');
      const video = await page.locator('#tc-host-intent').evaluate((node) => ({ open: node.open, consultationHidden: node.querySelector('.tc-host-intent__consultation').hidden }));
      await page.locator('.tc-host-intent__close').press('Enter');
      results.push({ width, httpStatus: response?.status() || null, before, consoleErrors, requestFailures, faqStates, menuState, consultation, video });
      await context.close();
    }
  } finally {
    await browser.close();
  }
  const files = ['nebula-easy-taurus-compatibility.html', 'nebula-easy-taurus-compatibility.css', 'nebula-easy-taurus-compatibility.js'];
  fs.writeFileSync(path.join(out, '..', 'five-width-runtime-proof.json'), JSON.stringify({ url, captureMethod: 'fresh-playwright-context-per-width', results, hashes: Object.fromEntries(files.map((file) => [file, hash(path.join(root, file))])) }, null, 2));
})().then(() => process.exit(0)).catch((error) => { console.error(error.stack || error); process.exit(1); });
