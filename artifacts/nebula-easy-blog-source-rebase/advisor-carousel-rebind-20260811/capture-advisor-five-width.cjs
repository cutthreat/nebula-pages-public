const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');

const root = 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt';
const output = __dirname;
const url = 'http://127.0.0.1:8765/nebula-easy-blog.html';
const widths = [1200, 992, 768, 576, 320];
const sourceHeight = { 1200: 3142, 992: 3292, 768: 3632, 576: 3318, 320: 6286 };
const proof = { schema: 'nebula_easy_blog_advisor_rebind_runtime.v1', url, generatedAt: new Date().toISOString(), status: 'pass', widths: [], routeChecks: null };

const box = async (page, selector) => page.locator(selector).first().evaluate((node) => {
  const rect = node.getBoundingClientRect();
  return { x: +rect.x.toFixed(1), y: +(rect.y + scrollY).toFixed(1), width: +rect.width.toFixed(1), height: +rect.height.toFixed(1) };
});

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
      const page = await context.newPage();
      const consoleErrors = [];
      const failedLocalRequests = [];
      page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
      page.on('requestfailed', (request) => { if (request.url().startsWith('http://127.0.0.1:8765/')) failedLocalRequests.push(request.url()); });

      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
      await page.evaluate(async () => {
        await Promise.race([document.fonts.ready, new Promise((resolve) => setTimeout(resolve, 3000))]);
        await Promise.all([...document.images].map((image) => image.complete ? null : new Promise((resolve) => { image.onload = image.onerror = resolve; })));
      });

      const metrics = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        duplicateIds: [...document.querySelectorAll('[id]')].filter((element, index, all) => all.findIndex((candidate) => candidate.id === element.id) !== index).map((element) => element.id),
        brokenImages: [...document.images].filter((image) => !image.complete || !image.naturalWidth).map((image) => image.currentSrc || image.src),
        activeAnimations: [...document.querySelectorAll('*')].filter((element) => getComputedStyle(element).animationName !== 'none').length
      }));

      const advisor = {
        carrier: await box(page, '.blog-advisor'),
        title: await box(page, '.blog-advisor h2'),
        list: await box(page, '.blog-advisor__list'),
        track: await box(page, '.blog-advisor__experts'),
        card: await box(page, '.blog-advisor__expert'),
        cta: await box(page, '.blog-advisor__button'),
        controlsVisible: await page.locator('.blog-advisor__controls').isVisible()
      };

      let carousel = { status: 'n/a' };
      if (width === 320) {
        const previous = page.locator('.blog-advisor__control--previous');
        const next = page.locator('.blog-advisor__control--next');
        const track = page.locator('.blog-advisor__experts');
        const initial = { previousDisabled: await previous.isDisabled(), nextDisabled: await next.isDisabled(), scrollLeft: await track.evaluate((node) => node.scrollLeft) };
        await next.focus();
        await next.press('Enter');
        await page.waitForTimeout(120);
        const second = { previousDisabled: await previous.isDisabled(), nextDisabled: await next.isDisabled(), scrollLeft: await track.evaluate((node) => Math.round(node.scrollLeft)), focusMovedToAvailableControl: await previous.evaluate((node) => document.activeElement === node) };
        await track.focus();
        await track.press('ArrowLeft');
        await page.waitForTimeout(120);
        const returned = { scrollLeft: await track.evaluate((node) => Math.round(node.scrollLeft)), previousDisabled: await previous.isDisabled() };
        carousel = {
          status: initial.previousDisabled && !initial.nextDisabled && initial.scrollLeft === 0 && second.scrollLeft === 220 && second.previousDisabled === false && second.nextDisabled && second.focusMovedToAvailableControl && returned.scrollLeft === 0 && returned.previousDisabled ? 'pass' : 'fail',
          initial,
          second,
          returned
        };
      }

      let menu = 'n/a';
      let theme = 'n/a';
      if (width < 992) {
        await page.locator('.navbar-toggler').press('Enter');
        await page.waitForTimeout(80);
        const opened = await page.locator('#navbarOffcanvasBlog').evaluate((node) => node.classList.contains('show'));
        await page.locator('.site-header__offcanvas-close').press('Enter');
        await page.waitForTimeout(80);
        const closed = await page.locator('#navbarOffcanvasBlog').evaluate((node) => !node.classList.contains('show'));
        menu = opened && closed ? 'pass' : 'fail';
      }
      if (width >= 768) {
        const toggle = page.locator('.site-header__theme');
        await toggle.focus();
        await toggle.press('Space');
        theme = await toggle.isChecked() ? 'pass' : 'fail';
      }

      if (width === 1200) {
        const hrefs = await page.locator('a[href]').evaluateAll((nodes) => [...new Set(nodes.map((node) => node.href).filter((href) => href.startsWith('http://127.0.0.1:8765/') && !href.includes('#')))]);
        const checks = [];
        for (const href of hrefs) {
          const routeResponse = await context.request.get(href);
          checks.push({ path: new URL(href).pathname, status: routeResponse.status() });
        }
        proof.routeChecks = { total: checks.length, failures: checks.filter((check) => check.status < 200 || check.status >= 400) };
      }

      await page.screenshot({ path: path.join(output, `live-${width}.png`), fullPage: true });
      const record = { width, http: response?.status() || 0, sourceHeight: sourceHeight[width], metrics, advisor, interactions: { menu, theme, carousel }, consoleErrors, failedLocalRequests };
      if (record.http !== 200 || metrics.scrollWidth > metrics.clientWidth || metrics.duplicateIds.length || metrics.brokenImages.length || metrics.activeAnimations || consoleErrors.length || failedLocalRequests.length || menu === 'fail' || theme === 'fail' || carousel.status === 'fail') proof.status = 'fail';
      proof.widths.push(record);
      await context.close();
    }
  } finally {
    await browser.close();
  }

  if (proof.routeChecks?.failures.length) proof.status = 'fail';
  fs.writeFileSync(path.join(output, 'five-width-runtime-proof.json'), JSON.stringify(proof, null, 2) + '\n');
  process.stdout.write(JSON.stringify({ status: proof.status, routeChecks: proof.routeChecks, widths: proof.widths.map((record) => ({ width: record.width, height: record.metrics.scrollHeight, sourceHeight: record.sourceHeight, advisor: record.advisor, interactions: record.interactions, errors: record.consoleErrors.length, failedRequests: record.failedLocalRequests.length })) }, null, 2));
})().catch((error) => { console.error(error.stack || error); process.exit(1); });
