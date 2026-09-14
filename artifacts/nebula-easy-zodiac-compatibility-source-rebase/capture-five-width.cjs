const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/alexe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const output = __dirname;
const previewUrl = process.env.NEBULA_PREVIEW_URL || 'http://127.0.0.1:8765/nebula-easy-zodiac-compatibility.html';
const widths = [1200, 992, 768, 576, 320];
const proof = {
  schema: 'nebula_easy.zodiac_compatibility.runtime_proof.v1',
  url: previewUrl,
  source: 'C76M54fY7z926wIQoWFh8Y',
  status: 'pass',
  widths: [],
  generatedAt: new Date().toISOString(),
};

async function accordionProof(page) {
  const toggles = page.locator('.faq-section__toggle');
  if (await toggles.count() < 3) return 'missing';
  await toggles.nth(0).click();
  await page.waitForTimeout(80);
  const firstOpen = await toggles.nth(0).getAttribute('aria-expanded');
  const thirdOpen = await toggles.nth(2).getAttribute('aria-expanded');
  return firstOpen === 'true' && thirdOpen === 'false' ? 'pass' : 'fail';
}

async function lowerAccordionProof(page) {
  const items = page.locator('.zcn-lower details');
  if (await items.count() < 2) return 'missing';
  await items.nth(1).locator('summary').evaluate((node) => node.click());
  await page.waitForTimeout(80);
  const firstOpen = await items.nth(0).evaluate((node) => node.open);
  const secondOpen = await items.nth(1).evaluate((node) => node.open);
  return !firstOpen && secondOpen ? 'pass' : 'fail';
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const consoleErrors = [];
      const failedLocalRequests = [];
      page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
      page.on('requestfailed', (request) => { if (request.url().startsWith(new URL(previewUrl).origin)) failedLocalRequests.push(request.url()); });
      const response = await page.goto(proof.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          window.scrollTo(0, y);
          await new Promise((resolve) => setTimeout(resolve, 8));
        }
        window.scrollTo(0, 0);
      });
      const metrics = await page.evaluate(() => ({
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        scrollHeight: document.documentElement.scrollHeight,
        zodiacCards: document.querySelectorAll('.zcn-sign-card').length,
        advisorCards: document.querySelectorAll('.zcn-advisor').length,
        faqToggles: document.querySelectorAll('.faq-section__toggle').length,
        seoAccordions: document.querySelectorAll('.zcn-lower details').length,
        ctaHrefs: Array.from(document.querySelectorAll('.zcn-hero a, .zcn-banner a, .zcn-expert a')).map((a) => a.getAttribute('href')).filter(Boolean),
      }));
      let menu = 'not_applicable';
      if (width < 992) {
        const toggleMenu = () => page.evaluate(() => {
          const control = Array.from(document.querySelectorAll("button[aria-label='Open menu'][data-target='#navbarOffcanvas']")).find((node) => node.offsetParent !== null);
          if (!control) return false;
          control.click();
          return true;
        });
        const openedByVisibleControl = await toggleMenu();
        await page.waitForTimeout(100);
        const opened = await page.locator('#navbarOffcanvas').evaluate((node) => node.classList.contains('show'));
        const closedByVisibleControl = await toggleMenu();
        await page.waitForTimeout(100);
        const closed = await page.locator('#navbarOffcanvas').evaluate((node) => !node.classList.contains('show'));
        menu = openedByVisibleControl && closedByVisibleControl && opened && closed ? 'pass' : 'fail';
      }
      const faq = await accordionProof(page);
      const seo = await lowerAccordionProof(page);
      const zodiacSelection = 'source_default_only_no_prototype_target';
      const carousel = await page.locator('.zcn-expert__nav button, .zcn-expert .swiper-button-next, .zcn-expert .slick-next').count() > 0 ? 'control_present' : 'source_static_or_swipe_only';
      await page.screenshot({ path: path.join(output, `post-${width}.png`), fullPage: true });
      const record = { width, http: response?.status() || 0, metrics, menu, faq, seo, zodiacSelection, carousel, consoleErrors, failedLocalRequests };
      const loaded = previewUrl.startsWith('file:') ? true : record.http === 200;
      if (!loaded || metrics.scrollWidth > metrics.clientWidth || metrics.zodiacCards !== 12 || metrics.advisorCards < 2 || metrics.faqToggles !== 5 || metrics.seoAccordions !== 8 || !metrics.ctaHrefs.length || menu === 'fail' || faq !== 'pass' || seo !== 'pass' || consoleErrors.length || failedLocalRequests.length) proof.status = 'fail';
      proof.widths.push(record);
      await context.close();
    }
  } finally {
    await browser.close();
  }
  fs.writeFileSync(path.join(output, 'post-runtime-proof.json'), `${JSON.stringify(proof, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ status: proof.status, widths: proof.widths.map(({ width, http, metrics, menu, faq, seo, consoleErrors, failedLocalRequests }) => ({ width, http, height: metrics.scrollHeight, overflow: metrics.scrollWidth - metrics.clientWidth, zodiacCards: metrics.zodiacCards, advisorCards: metrics.advisorCards, faqToggles: metrics.faqToggles, seoAccordions: metrics.seoAccordions, menu, faq, seo, consoleErrors: consoleErrors.length, failedLocalRequests: failedLocalRequests.length })) }, null, 2)}\n`);
})().catch((error) => { console.error(error.stack || error); process.exit(1); });
