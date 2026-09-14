const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt';
const out = path.join(root, 'artifacts/nebula-easy-all-psychic-source-rebase/c76-rebind-20260811/live');
const url = 'http://127.0.0.1:8765/nebula-easy-all-psychic.html';
const widths = process.argv.slice(2).length ? process.argv.slice(2).map(Number) : [1200, 992, 768, 576, 320];
const viewportHeight = 900;

(async () => {
  fs.mkdirSync(out, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const results = [];
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: viewportHeight }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const consoleErrors = [];
    const requestFailures = [];
    page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
    page.on('requestfailed', (r) => requestFailures.push(`${r.method()} ${r.url()} ${r.failure()?.errorText || ''}`));
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await page.evaluate(async () => {
      await document.fonts.ready;
      await Promise.all([...document.images]
        .filter((image) => image.loading !== 'lazy')
        .map((image) => image.complete ? null : new Promise((resolve) => {
          image.addEventListener('load', resolve, { once: true });
          image.addEventListener('error', resolve, { once: true });
        })));
    });
    const snapshot = await page.evaluate(() => ({
      bodyWidth: document.body.scrollWidth,
      viewport: innerWidth,
      pageHeight: document.documentElement.scrollHeight,
      brokenImages: [...document.images].filter((image) => image.loading !== 'lazy' && (!image.complete || !image.naturalWidth)).map((image) => image.currentSrc || image.src),
      duplicateIds: [...document.querySelectorAll('[id]')].map((n) => n.id).filter((id, index, all) => all.indexOf(id) !== index),
      sections: [...document.querySelectorAll('[data-figma-node]')].map((node) => ({ node: node.dataset.figmaNode, top: Math.round(node.getBoundingClientRect().top + scrollY), height: Math.round(node.getBoundingClientRect().height) })),
      chips: [...document.querySelectorAll('.apn-chip')].length,
      carouselControls: [...document.querySelectorAll('.apn-online__nav[aria-hidden="true"] .apn-online__nav-btn')].length,
      faqCount: document.querySelectorAll('.apn-faq details').length,
      faqOpen: document.querySelectorAll('.apn-faq details[open]').length
    }));
    const interaction = { menu: null, faq: null, chips: 'static-source-composition', carousel: 'static-visible-next-source-composition', theme: null };
    const menu = page.locator('button[data-target="#navbarOffcanvasAllPsychic"]:visible').first();
    if (await menu.count()) {
      await menu.click();
      const opened = await menu.getAttribute('aria-expanded');
      const closer = page.locator('.site-header__offcanvas-close:visible').first();
      if (await closer.count()) await closer.evaluate((node) => node.click());
      interaction.menu = { opened, closed: await menu.getAttribute('aria-expanded') };
    }
    const faq = page.locator('.apn-faq details');
    interaction.faq = [];
    for (let index = 0; index < await faq.count(); index += 1) {
      const item = faq.nth(index);
      await item.locator('summary').evaluate((node) => node.click());
      interaction.faq.push(await item.evaluate((node) => ({ open: node.open, expanded: node.querySelector('summary')?.getAttribute('aria-expanded') })));
    }
    if (await faq.count()) await faq.nth((await faq.count()) - 1).locator('summary').evaluate((node) => node.click());
    const theme = page.locator('.site-header__theme-toggle').first();
    if (await theme.count() && await theme.isVisible()) { await theme.click(); interaction.theme = true; }
    for (const [name, selector] of Object.entries({
      hero: '[data-figma-node="924:16999"]',
      rail: '[data-figma-node="926:20877"]',
      catalog: '[data-figma-node="924:17017"]',
      faq: '[data-figma-node="924:17102"]'
    })) {
      const target = page.locator(selector).first();
      if (!(await target.count())) continue;
      await target.scrollIntoViewIfNeeded();
      await page.waitForTimeout(80);
      await page.screenshot({ path: path.join(out, `live-${width}-${name}.png`) });
    }
    results.push({ width, httpStatus: response ? response.status() : null, overflow: snapshot.bodyWidth > width, consoleErrors, requestFailures, snapshot, interaction });
    await context.close();
  }
  await browser.close();
  const sourceHtml = fs.readFileSync(path.join(root, 'nebula-easy-all-psychic.html'), 'utf8');
  const rawHrefs = [...sourceHtml.matchAll(/<a\b[^>]*\bhref="([^"]+)"/g)].map((match) => match[1]);
  const localRoutes = [...new Set(rawHrefs.filter((href) => href && !href.startsWith('http') && !href.startsWith('#')).map((href) => href.split('#')[0]))];
  const routeAudit = localRoutes.map((href) => ({ href, exists: fs.existsSync(path.join(root, '_unzipped', href)) }));
  fs.writeFileSync(path.join(out, 'five-width-runtime.json'), JSON.stringify({ url, widths, captureMethod: 'fresh-context-per-width', results, routeAudit }, null, 2));
})().catch((error) => { console.error(error.stack || error); process.exit(1); });
