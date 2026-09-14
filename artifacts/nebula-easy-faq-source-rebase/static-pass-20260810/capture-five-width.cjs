const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt';
const output = __dirname;
const widths = [1200, 992, 768, 576, 320];
const source = Object.fromEntries(widths.map((width) => [width, path.join(root, 'compare-board-sources', `faq-91ku-${width}.png`)]));
const result = { route: 'http://127.0.0.1:8765/nebula-easy-faq.html', widths: [], generatedAt: new Date().toISOString() };

(async () => {
  const browser = await chromium.launch({ headless: true });
  try {
    for (const width of widths) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
      const page = await context.newPage();
      const consoleErrors = [];
      const failedLocalRequests = [];
      page.on('console', (message) => { if (message.type() === 'error') consoleErrors.push(message.text()); });
      page.on('requestfailed', (request) => {
        if (request.url().startsWith('http://127.0.0.1:8765/')) failedLocalRequests.push({ url: request.url(), error: request.failure()?.errorText || 'failed' });
      });
      await page.goto(result.route, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((resolve) => setTimeout(resolve, 35)); }
        window.scrollTo(0, 0);
      });
      const state = await page.evaluate(() => ({
        bodyHeight: document.documentElement.scrollHeight,
        horizontalOverflow: document.documentElement.scrollWidth > window.innerWidth,
        faqItems: document.querySelectorAll('.faq-item').length,
        initialOpenItems: document.querySelectorAll('.faq-item--open').length,
        menuControl: Boolean(document.querySelector('.navbar-toggler')),
        openGlyph: {
          before: getComputedStyle(document.querySelector('.faq-item--open .faq-item__plus'), '::before').transform,
          after: getComputedStyle(document.querySelector('.faq-item--open .faq-item__plus'), '::after').transform,
        },
        theme: (() => {
          const control = document.querySelector('.site-header__theme');
          const style = control ? getComputedStyle(control) : null;
          const thumb = control ? getComputedStyle(control, '::before') : null;
          return control ? { checked: control.checked, background: style.backgroundColor, thumb: thumb.backgroundColor } : null;
        })(),
      }));
      await page.addStyleTag({ content: '.site-header.fixed-top{position:absolute!important}' });
      await page.screenshot({ path: path.join(output, `live-${width}.png`), fullPage: true });
      const interactiveQuestion = page.locator('.faq-item__question:not([disabled])').first();
      const interactiveItem = page.locator('.faq-item:has(.faq-item__question:not([disabled]))').first();
      await interactiveQuestion.click();
      const accordionToggled = await interactiveItem.evaluate((element) => !element.classList.contains('faq-item--open'));
      await interactiveQuestion.click();
      const accordionRestored = await interactiveItem.evaluate((element) => element.classList.contains('faq-item--open'));
      let themeToggled = null;
      if (width >= 992) {
        const theme = page.locator('.site-header__theme');
        await theme.click();
        const flipped = await theme.isChecked();
        await theme.click();
        themeToggled = !flipped && await theme.isChecked();
      }
      let menuToggled = null;
      let menuRestored = null;
      if (width < 992) {
        const menuButton = page.locator('.navbar-toggler');
        await menuButton.click();
        await page.waitForTimeout(400);
        menuToggled = await page.locator('#navbarOffcanvas').evaluate((element) => element.classList.contains('show'));
        await page.locator('.site-header__offcanvas-close').click();
        await page.waitForTimeout(400);
        menuRestored = await page.locator('#navbarOffcanvas').evaluate((element) => !element.classList.contains('show'));
      }
      result.widths.push({ width, source: path.relative(root, source[width]).replaceAll('\\', '/'), sourceExists: fs.existsSync(source[width]), ...state, accordionToggled, accordionRestored, themeToggled, menuToggled, menuRestored, consoleErrors, failedLocalRequests });
      await context.close();
    }
  } finally {
    await browser.close();
  }
  result.pass = result.widths.every((entry) => entry.sourceExists && !entry.horizontalOverflow && entry.faqItems === 17 && entry.initialOpenItems === 1 && entry.openGlyph.before.includes('0.707107') && entry.openGlyph.after.includes('0.707107') && entry.accordionToggled && entry.accordionRestored && entry.consoleErrors.length === 0 && entry.failedLocalRequests.length === 0 && (entry.width >= 992 ? entry.themeToggled && entry.theme && entry.theme.checked && entry.theme.background === 'rgb(103, 62, 218)' && entry.theme.thumb === 'rgb(255, 196, 120)' : entry.menuToggled && entry.menuRestored));
  fs.writeFileSync(path.join(output, 'runtime-interaction-proof.json'), `${JSON.stringify(result, null, 2)}\n`);
  process.stdout.write(`${JSON.stringify({ pass: result.pass, widths: result.widths.map(({ width, bodyHeight, horizontalOverflow, faqItems, accordionToggled, menuToggled, consoleErrors, failedLocalRequests }) => ({ width, bodyHeight, horizontalOverflow, faqItems, accordionToggled, menuToggled, consoleErrors: consoleErrors.length, failedLocalRequests: failedLocalRequests.length })) }, null, 2)}\n`);
})().catch((error) => { console.error(error.stack || error); process.exit(1); });
