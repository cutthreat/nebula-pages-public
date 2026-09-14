import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/alexe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root = 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt';
const url = 'http://127.0.0.1:8765/nebula-easy-blog-input.html';
const output = path.join(root, 'artifacts/nebula-easy-blog-input-source-rebase/static-pass-20260811/fresh-context-captures/INTERACTION-RUNTIME.json');
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const browser = await chromium.launch({ headless: true, executablePath: chrome });
const proof = { url, captureMethod: 'fresh_playwright_context_per_width', widths: [] };

try {
  for (const width of [1200, 992, 768, 576, 320]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const requestFailures = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('requestfailed', request => requestFailures.push({ url: request.url(), error: request.failure()?.errorText || 'unknown' }));
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.evaluate(async () => { await document.fonts.ready; });
      const toc = await page.locator('.article-detail__toc a').evaluateAll(links => links.map(link => ({ href: link.getAttribute('href'), target: link.getAttribute('target') })));
      const routes = await page.locator('.article-banner__button,.article-related__cta-link').evaluateAll(links => links.map(link => link.getAttribute('href')));
      const routeStatuses = Object.fromEntries(await Promise.all(routes.map(async href => [href, (await page.request.get(new URL(href, url).toString())).status()])));
      const theme = page.locator('#switchThemeBlogInput');
      await theme.focus();
      const themeFocused = await theme.evaluate(node => node === document.activeElement);
      const themeBefore = await theme.isChecked();
      await page.keyboard.press('Space');
      const themeAfter = await theme.isChecked();
      let menu = { applicable: false };
      const menuButton = page.locator('.navbar-toggler');
      if (await menuButton.isVisible()) {
        await menuButton.focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(80);
        const panel = page.locator('#navbarOffcanvasBlogInput');
        menu = { applicable: true, opened: await panel.evaluate(node => node.classList.contains('show')), expanded: await menuButton.getAttribute('aria-expanded') };
        await page.keyboard.press('Escape');
        await page.waitForTimeout(80);
        menu.closed = !(await panel.evaluate(node => node.classList.contains('show')));
        menu.openerFocused = await menuButton.evaluate(node => node === document.activeElement);
      }
      const ctaPage = await context.newPage();
      await ctaPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      const cta = ctaPage.locator('.article-banner__button');
      await cta.focus();
      const ctaFocused = await cta.evaluate(node => node === document.activeElement);
      await Promise.all([ctaPage.waitForURL(/signup-step-1\.html$/), ctaPage.keyboard.press('Enter')]);
      const ctaTarget = { route: ctaPage.url(), status: await ctaPage.evaluate(() => document.readyState), formPresent: await ctaPage.locator('form').count() > 0 };
      await ctaPage.close();
      proof.widths.push({ width, httpStatus: response?.status() ?? null, toc, routes, routeStatuses, theme: { themeFocused, themeBefore, themeAfter }, menu, cta: { ctaFocused, ...ctaTarget }, consoleErrors, pageErrors, requestFailures });
    } finally {
      await page.close();
      await context.close();
    }
  }
} finally {
  await browser.close();
}
await fs.writeFile(output, JSON.stringify(proof, null, 2));
console.log(JSON.stringify(proof, null, 2));
