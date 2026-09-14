const { chromium } = require('playwright');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = __dirname;
const url = 'http://127.0.0.1:8765/nebula-easy-phone-psychic.html';
const widths = [1200, 992, 768, 576, 320];
const expected = {
  1200: { page: 8552, hero: [0, 855], experts: [855, 1451], reviews: [2306, 1385], faq: [5481, 1240], seo: [6721, 1411], footer: [8132, 420] },
  992: { page: 8223, hero: [0, 750], experts: [700, 1242], reviews: [1942, 1400], faq: [5072, 1210], seo: [6282, 1371], footer: [7653, 570] },
  768: { page: 8649, hero: [0, 700], experts: [610, 1732], reviews: [2342, 1420], faq: [5564, 1050], seo: [6614, 1311], footer: [7925, 724] },
  576: { page: 8946, hero: [0, 740], experts: [740, 1550], reviews: [2290, 1610], faq: [5706, 1060], seo: [6766, 1360], footer: [8126, 680] },
  320: { page: 10554, hero: [0, 800], experts: [800, 1300], reviews: [2100, 1830], faq: [6246, 1550], seo: [7796, 1693], footer: [9519, 1035] }
};
const source = {
  1200: 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt/compare-board-sources/phone-psychic-c76-1200.png',
  992: 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt/compare-board-sources/phone-psychic-c76-992.png',
  768: 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt/compare-board-sources/phone-psychic-c76-768.png',
  576: 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt/compare-board-sources/phone-psychic-c76-576.png',
  320: 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt/compare-board-sources/phone-psychic-c76-320.png'
};
const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();

(async () => {
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const consoleErrors = [];
    const requestErrors = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('requestfailed', (r) => { if (r.method() !== 'HEAD') requestErrors.push(`${r.url()} :: ${r.failure()?.errorText || 'failed'}`); });
    const response = await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))); });

    const geometry = await page.evaluate(() => {
      const rect = (selector) => { const e = document.querySelector(selector); const r = e?.getBoundingClientRect(); return r ? [Math.round(r.y + scrollY), Math.round(r.height)] : null; };
      return {
        page: document.documentElement.scrollHeight,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        duplicateIds: [...document.querySelectorAll('[id]')].map((e) => e.id).filter((id, i, a) => a.indexOf(id) !== i),
        brokenImages: [...document.images].filter((i) => !i.complete || !i.naturalWidth).map((i) => i.currentSrc || i.src),
        hero: rect('.pp-hero'), experts: rect('.pp-experts'), reviews: rect('.pp-reviews'), faq: rect('.pp-faq'), seo: rect('.pp-seo'), footer: rect('.site-footer'),
        reviewControls: document.querySelectorAll('.pp-reviews__nav button').length,
        faqOpen: [...document.querySelectorAll('.pp-faq__item')].map((i, n) => i.classList.contains('is-open') ? n + 1 : null).filter(Boolean),
        seoOpen: [...document.querySelectorAll('.pp-seo__item')].map((i, n) => i.classList.contains('pp-seo__item--open') ? n + 1 : null).filter(Boolean),
        reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches
      };
    });

    const screenshot = path.join(root, `postimage-${width}.png`);
    await page.screenshot({ path: screenshot, fullPage: true });

    const interactions = { menu: 'n/a', faq: [], seo: [], ctas: [], localLinks: [] };

    if (width <= 768) {
      const menu = page.locator('.navbar-toggler');
      await menu.focus();
      await menu.press('Enter');
      await page.waitForTimeout(120);
      const opened = await menu.getAttribute('aria-expanded');
      await menu.press('Enter');
      interactions.menu = opened === 'true' ? 'pass' : `fail:${opened}`;
    }

    const faqButtons = page.locator('.pp-faq__item .faq-section__toggle');
    for (let i = 0; i < await faqButtons.count(); i++) {
      const button = faqButtons.nth(i);
      await button.scrollIntoViewIfNeeded();
      await button.focus();
      const before = await button.getAttribute('aria-expanded');
      await button.press('Enter');
      const after = await button.getAttribute('aria-expanded');
      interactions.faq.push(before !== after ? 'pass' : 'fail');
    }

    const seoButtons = page.locator('.pp-seo__item button');
    for (let i = 0; i < await seoButtons.count(); i++) {
      const button = seoButtons.nth(i);
      await button.scrollIntoViewIfNeeded();
      await button.focus();
      const before = await button.getAttribute('aria-expanded');
      await button.press('Enter');
      const after = await button.getAttribute('aria-expanded');
      interactions.seo.push(before !== after ? 'pass' : 'fail');
    }

    const ctas = page.locator('.pp-expert-card__cta, .pp-experts__more .pp-ghost-btn');
    for (let i = 0; i < await ctas.count(); i++) {
      const cta = ctas.nth(i);
      await cta.focus();
      const href = await cta.evaluate((e) => e.href);
      const status = await page.evaluate(async (target) => (await fetch(target, { method: 'HEAD' })).status, href);
      interactions.ctas.push(status === 200 ? 'pass' : `fail:${status}`);
    }

    const linkHrefs = await page.locator('a[href$=".html"]').evaluateAll((links) => [...new Set(links.map((a) => a.href))]);
    for (const href of linkHrefs) {
      const status = await page.evaluate(async (target) => (await fetch(target, { method: 'HEAD' })).status, href);
      if (status !== 200) interactions.localLinks.push({ href, status });
    }

    const geometryPass = geometry.page === expected[width].page && geometry.scrollWidth === geometry.clientWidth && ['hero', 'experts', 'reviews', 'faq', 'seo', 'footer'].every((key) => JSON.stringify(geometry[key]) === JSON.stringify(expected[width][key]));
    const interactionPass = (interactions.menu === 'n/a' || interactions.menu === 'pass') && interactions.faq.every((x) => x === 'pass') && interactions.seo.every((x) => x === 'pass') && interactions.ctas.every((x) => x === 'pass') && interactions.localLinks.length === 0;
    results.push({ width, http: response?.status(), geometry, geometryPass, interactions, interactionPass, consoleErrors, requestErrors, screenshot, screenshotSha256: sha(screenshot), sourceRaster: source[width], sourceSha256: sha(source[width]) });
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(root, 'five-width-runtime-and-interaction-proof.json'), JSON.stringify({ url, sourceManifestSha256: 'F008D6A0609080F6D2D69C21F68B69D7D0CEC064D7803823C9770CB2CC2B0760', captureMethod: 'fresh-context-per-width/full-page-once', results }, null, 2));
})().catch((error) => { console.error(error.stack || error); process.exitCode = 1; });
