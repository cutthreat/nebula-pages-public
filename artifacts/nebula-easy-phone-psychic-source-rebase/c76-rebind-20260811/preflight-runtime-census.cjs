const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const out = path.join(__dirname, 'preflight-runtime-census.json');
const widths = [1200, 992, 768, 576, 320];
const url = 'http://127.0.0.1:8765/nebula-easy-phone-psychic.html';

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const consoleErrors = [];
    const requestErrors = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('requestfailed', (r) => requestErrors.push(`${r.url()} :: ${r.failure()?.errorText || 'failed'}`));
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))); });
    const snapshot = await page.evaluate(() => {
      const box = (selector) => { const e = document.querySelector(selector); if (!e) return null; const r = e.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height, visible: !!(r.width && r.height && getComputedStyle(e).visibility !== 'hidden' && getComputedStyle(e).display !== 'none') }; };
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        scrollHeight: document.documentElement.scrollHeight,
        duplicateIds: [...document.querySelectorAll('[id]')].map((e) => e.id).filter((id, i, a) => a.indexOf(id) !== i),
        brokenImages: [...document.images].filter((i) => !i.complete || !i.naturalWidth).map((i) => i.currentSrc || i.src),
        sourceOwners: { hero: box('.pp-hero'), experts: box('.pp-experts'), reviews: box('.pp-reviews'), faq: box('.pp-faq'), seo: box('.pp-seo'), footer: box('.site-footer') },
        faq: { count: document.querySelectorAll('.pp-faq__item').length, open: [...document.querySelectorAll('.pp-faq__item')].map((i, n) => i.classList.contains('is-open') ? n + 1 : null).filter(Boolean) },
        seo: { count: document.querySelectorAll('.pp-seo__item').length, open: [...document.querySelectorAll('.pp-seo__item')].map((i, n) => i.classList.contains('pp-seo__item--open') ? n + 1 : null).filter(Boolean) },
        reviewNav: [...document.querySelectorAll('.pp-reviews__nav button')].map((e) => ({ className: e.className, visible: box(`.${e.className}`)?.visible }))
      };
    });
    results.push({ width, http: response?.status(), snapshot, consoleErrors, requestErrors });
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(out, JSON.stringify({ url, captureMethod: 'fresh-context-per-width', results }, null, 2));
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
