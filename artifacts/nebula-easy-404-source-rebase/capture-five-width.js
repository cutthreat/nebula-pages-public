const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt';
const out = path.join(root, 'artifacts/nebula-easy-404-source-rebase/postimage');
const url = 'http://127.0.0.1:8765/nebula-easy-404.html';
const widths = [1200, 992, 768, 576, 320];

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const consoleErrors = [];
    const requestFailures = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('requestfailed', (r) => requestFailures.push(`${r.method()} ${r.url()} ${r.failure()?.errorText || ''}`));
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map((i) => i.complete ? null : new Promise((resolve) => { i.addEventListener('load', resolve, { once: true }); i.addEventListener('error', resolve, { once: true }); }))); });
    const menu = page.locator('.ne404-menu');
    const nav = page.locator('#ne404-mobile-nav');
    let menuProof = 'desktop-static-source-nav';
    if (await menu.isVisible()) { await menu.focus(); await menu.press('Enter'); menuProof = { opened: await menu.getAttribute('aria-expanded'), visible: await nav.isVisible() }; await page.keyboard.press('Escape'); menuProof.closedByEscape = await menu.getAttribute('aria-expanded'); }
    const theme = page.locator('.ne404-theme');
    let themeProof = 'source-hidden';
    if (await theme.isVisible()) { await theme.focus(); await theme.press('Enter'); themeProof = { checked: await theme.getAttribute('aria-checked'), visibleState: await page.locator('body').evaluate((body) => body.classList.contains('ne404-dark')) }; }
    const cta = page.getByRole('link', { name: /Explore our site/ });
    const snapshot = await page.evaluate(() => ({
      viewport: innerWidth,
      pageHeight: document.documentElement.scrollHeight,
      scrollWidth: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth > innerWidth,
      brokenImages: [...document.images].filter((i) => !i.complete || !i.naturalWidth).map((i) => i.currentSrc || i.src),
      duplicateIds: [...document.querySelectorAll('[id]')].map((n) => n.id).filter((id, n, all) => all.indexOf(id) !== n),
      hero: Object.fromEntries(['.ne404-header','.ne404-art','.ne404-hero h1','.ne404-copy','.ne404-cta','.ne404-footer'].map((s) => { const r = document.querySelector(s)?.getBoundingClientRect(); return [s, r && { x: Math.round(r.x), y: Math.round(r.y), width: Math.round(r.width), height: Math.round(r.height) }]; })),
      ctaHref: document.querySelector('.ne404-cta')?.getAttribute('href'),
      links: [...document.querySelectorAll('a[href]')].map((a) => a.getAttribute('href')).filter(Boolean)
    }));
    await page.evaluate(() => document.activeElement?.blur());
    await page.screenshot({ path: path.join(out, `live-${width}.png`), fullPage: true });
    const ctaRoute = { href: await cta.getAttribute('href'), status: null, url: null };
    const ctaResponse = page.waitForResponse((next) => next.url().endsWith('/home.html'), { timeout: 10000 });
    await cta.click();
    ctaRoute.status = (await ctaResponse).status();
    ctaRoute.url = page.url();
    results.push({ width, httpStatus: response?.status() || null, consoleErrors, requestFailures, menuProof, themeProof, ctaVisible: true, ctaRoute, snapshot });
    await context.close();
  }
  await browser.close();
  const candidateFiles = ['nebula-easy-404.html', 'nebula-easy-404.css', 'nebula-easy-404.js'];
  const hashes = Object.fromEntries(candidateFiles.map((file) => { const data = fs.readFileSync(path.join(root, file)); const crypto = require('crypto'); return [file, crypto.createHash('sha256').update(data).digest('hex')]; }));
  fs.writeFileSync(path.join(out, 'five-width-runtime.json'), JSON.stringify({ url, captureMethod: 'fresh-headless-context-per-width', results, hashes }, null, 2));
})().catch((error) => { console.error(error.stack || error); process.exit(1); });
