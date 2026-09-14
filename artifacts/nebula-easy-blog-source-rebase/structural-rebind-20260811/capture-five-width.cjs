const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt';
const output = __dirname;
const url = 'http://127.0.0.1:8765/nebula-easy-blog.html';
const widths = [1200, 992, 768, 576, 320];
const source = {
  1200: 'blog-1200-642-5788.png', 992: 'blog-992-1001-20800.png',
  768: 'blog-768-1002-21942.png', 576: 'blog-576-1002-23955.png', 320: 'blog-320-1005-22168.png',
};
const proof = { schema: 'nebula_easy_blog_structural_rebind_runtime.v1', url, generatedAt: new Date().toISOString(), status: 'pass', widths: [] };

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const consoleErrors = [], failedLocalRequests = [];
      page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); });
      page.on('requestfailed', r => { if (r.url().startsWith('http://127.0.0.1:8765/')) failedLocalRequests.push(r.url()); });
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
      await page.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.complete ? null : new Promise(done => { i.onload = i.onerror = done; }))); });
      const metrics = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight, duplicateIds: [...document.querySelectorAll('[id]')].filter((e, i, all) => all.findIndex(x => x.id === e.id) !== i).map(e => e.id),
        brokenImages: [...document.images].filter(i => !i.complete || !i.naturalWidth).map(i => i.currentSrc || i.src),
        cards: document.querySelectorAll('.blog-card').length, experts: document.querySelectorAll('.blog-advisor__expert').length,
      }));
      let menu = 'n/a', theme = 'n/a', cta = 'n/a';
      const ctaHref = await page.locator('.blog-promo__btn').getAttribute('href');
      const ctaResponse = ctaHref ? await context.request.get(new URL(ctaHref, url).href) : null;
      cta = ctaResponse?.status() === 200 ? 'pass' : 'fail';
      if (width < 992) {
        await page.locator('.navbar-toggler').press('Enter');
        await page.waitForTimeout(80);
        const opened = await page.locator('#navbarOffcanvasBlog').evaluate(n => n.classList.contains('show'));
        await page.locator('.site-header__offcanvas-close').press('Enter');
        await page.waitForTimeout(80);
        const closed = await page.locator('#navbarOffcanvasBlog').evaluate(n => !n.classList.contains('show'));
        menu = opened && closed ? 'pass' : 'fail';
      }
      if (width >= 768) {
        const toggle = page.locator('.site-header__theme');
        await toggle.focus(); await toggle.press('Space'); theme = await toggle.isChecked() ? 'pass' : 'fail';
      }
      await page.screenshot({ path: path.join(output, `live-${width}.png`), fullPage: true });
      const record = { width, http: response?.status() || 0, sourcePath: path.join(root, 'compare-board-sources', 'c76-normalized-export-20260727', source[width]), sourceExists: fs.existsSync(path.join(root, 'compare-board-sources', 'c76-normalized-export-20260727', source[width])), metrics, interactions: { menu, theme, cta }, consoleErrors, failedLocalRequests };
      if (record.http !== 200 || !record.sourceExists || metrics.scrollWidth > metrics.clientWidth || metrics.duplicateIds.length || metrics.brokenImages.length || consoleErrors.length || failedLocalRequests.length || menu === 'fail' || theme === 'fail' || cta === 'fail') proof.status = 'fail';
      proof.widths.push(record);
      await context.close();
    }
  } finally { await browser.close(); }
  fs.writeFileSync(path.join(output, 'five-width-runtime-proof.json'), JSON.stringify(proof, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ status: proof.status, widths: proof.widths.map(x => ({ width: x.width, http: x.http, scroll: `${x.metrics.scrollWidth}/${x.metrics.clientWidth}`, height: x.metrics.scrollHeight, images: x.metrics.brokenImages.length, errors: x.consoleErrors.length, failed: x.failedLocalRequests.length, interactions: x.interactions })) }, null, 2));
})().catch(error => { console.error(error.stack || error); process.exit(1); });
