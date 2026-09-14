import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/alexe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp = require('C:/Users/alexe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const root = path.resolve('artifacts/nebula-easy-taurus-compatibility');
const screenshotDir = path.join(root, 'screenshots');
const url = process.env.NEBULA_PREVIEW_URL ?? 'http://127.0.0.1:8765/nebula-easy-taurus-compatibility.html';
const widths = [1200, 992, 768, 576, 320];
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';

await fs.mkdir(screenshotDir, { recursive: true });
const browser = await chromium.launch({ headless: true, executablePath: chrome });
const proof = { url, generatedAt: new Date().toISOString(), widths: [] };
const routeStatus = async (page, href) => {
  if (url.startsWith('file:')) {
    try {
      await fs.access(path.resolve(href));
      return 200;
    } catch {
      return 404;
    }
  }
  return (await page.request.get(new URL(href, url).toString())).status();
};

const captureTiled = async (page, width, output) => {
  const scrollStyle = await page.addStyleTag({ content: 'html{scroll-behavior:auto!important}' });
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  const tileHeight = 900;
  const tiles = [];
  const requestedPositions = [];
  for (let top = 0; top < height; top += tileHeight) requestedPositions.push(Math.min(top, Math.max(0, height - tileHeight)));
  const positions = [...new Set(requestedPositions)];
  for (const requestedTop of positions) {
    await page.evaluate(y => window.scrollTo(0, y), requestedTop);
    await page.waitForTimeout(30);
    const top = await page.evaluate(() => Math.round(window.scrollY));
    const input = await page.screenshot({ type: 'png', fullPage: false });
    tiles.push({ input, left: 0, top });
  }
  await sharp({ create: { width, height, channels: 3, background: '#ffffff' } }).composite(tiles).png().toFile(output);
  await page.evaluate(() => window.scrollTo(0, 0));
  await scrollStyle.evaluate(node => node.remove());
};

for (const width of widths) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  const page = await context.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const requestFailures = [];
  page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
  page.on('pageerror', error => pageErrors.push(error.message));
  page.on('requestfailed', request => requestFailures.push({ url: request.url(), error: request.failure()?.errorText || 'unknown' }));

  const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  await captureTiled(page, width, path.join(screenshotDir, `taurus-${width}.png`));

  const metrics = await page.evaluate(() => {
    const root = document.documentElement;
    const sections = [...document.querySelectorAll('main > section')].map(section => {
      const bounds = section.getBoundingClientRect();
      const descendants = [...section.querySelectorAll('*')].filter(node => {
        const style = getComputedStyle(node);
        return style.display !== 'none' && style.visibility !== 'hidden';
      });
      const descendantBounds = descendants.map(node => node.getBoundingClientRect()).filter(rect => rect.width > 0 && rect.height > 0);
      const contentTop = descendantBounds.length ? Math.min(...descendantBounds.map(rect => rect.top)) : bounds.top;
      const contentBottom = descendantBounds.length ? Math.max(...descendantBounds.map(rect => rect.bottom)) : bounds.bottom;
      return {
        className: section.className,
        top: Math.round(bounds.top + scrollY),
        height: Math.round(bounds.height),
        contentOverflowTop: Math.max(0, Math.round(bounds.top - contentTop)),
        contentOverflowBottom: Math.max(0, Math.round(contentBottom - bounds.bottom))
      };
    });
    const images = [...document.images];
    return {
      viewportWidth: innerWidth,
      scrollWidth: root.scrollWidth,
      clientWidth: root.clientWidth,
      scrollHeight: root.scrollHeight,
      horizontalOverflow: Math.max(0, root.scrollWidth - root.clientWidth),
      images: { total: images.length, complete: images.filter(image => image.complete && image.naturalWidth > 0).length },
      h1: document.querySelector('h1')?.textContent?.trim(),
      faqInitialOpen: document.querySelectorAll('[data-accordion] .is-open').length,
      faqThirdExpanded: document.querySelectorAll('[data-accordion] button')[2]?.getAttribute('aria-expanded'),
      signupHref: document.querySelector('.tc-header__actions a')?.getAttribute('href'),
      reducedMotion: {
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
        videoTransitionDuration: getComputedStyle(document.querySelector('.tc-video__button span')).transitionDuration
      },
      sections
    };
  });

  const faqButtons = page.locator('[data-accordion] button');
  const faq = [];
  for (let index = 0; index < await faqButtons.count(); index += 1) {
    const button = faqButtons.nth(index);
    const panelId = await button.getAttribute('aria-controls');
    await button.focus();
    await page.keyboard.press('Space');
    const panel = page.locator(`#${panelId}`);
    faq.push({
      index: index + 1,
      expanded: await button.getAttribute('aria-expanded'),
      visible: await panel.isVisible(),
      hasCopy: (await panel.textContent())?.trim().length > 0
    });
    await button.click();
  }

  const videoButton = page.locator('.tc-video__button');
  const video = {
    disabled: await videoButton.isDisabled(),
    fakeActiveState: await videoButton.evaluate(node => node.classList.contains('is-active')),
    unavailableReasonPresent: await page.locator('#tc-video-unavailable').count() === 1
  };

  const navigation = [];
  for (const href of await page.locator('.tc-header__nav a').evaluateAll(links => links.map(link => link.getAttribute('href')))) {
    navigation.push({ href, httpStatus: await routeStatus(page, href) });
  }

  let menu = { applicable: false };
  if (width < 1200) {
    const menuButton = page.locator('.tc-header__menu');
    await menuButton.focus();
    await page.keyboard.press('Enter');
    const opened = await page.locator('#tc-drawer').isVisible();
    const expanded = await menuButton.getAttribute('aria-expanded');
    const closeFocused = await page.locator('.tc-drawer__close').evaluate(node => node === document.activeElement);
    await page.keyboard.press('Escape');
    const closed = !(await page.locator('#tc-drawer').isVisible());
    const openerFocused = await menuButton.evaluate(node => node === document.activeElement);
    menu = { applicable: true, opened, expanded, closeFocused, closed, openerFocused };
  }

  const ctas = [];
  for (let index = 0; index < await page.locator('.tc-banner__cta').count(); index += 1) {
    const cta = page.locator('.tc-banner__cta').nth(index);
    const href = await cta.getAttribute('href');
    await cta.focus();
    const focused = await cta.evaluate(node => node === document.activeElement);
    ctas.push({ index: index + 1, href, httpStatus: await routeStatus(page, href), focused });
  }

  const consultationPage = await context.newPage();
  const consultationErrors = [];
  const consultationConsoleErrors = [];
  const consultationPageErrors = [];
  consultationPage.on('requestfailed', request => consultationErrors.push({ url: request.url(), error: request.failure()?.errorText || 'unknown' }));
  consultationPage.on('console', message => { if (message.type() === 'error') consultationConsoleErrors.push(message.text()); });
  consultationPage.on('pageerror', error => consultationPageErrors.push(error.message));
  await consultationPage.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
  const consultationCta = consultationPage.locator('.tc-banner__cta').first();
  await consultationCta.focus();
  await Promise.all([
    consultationPage.waitForURL(/signup-step-1\.html$/),
    consultationPage.keyboard.press('Enter')
  ]);
  await consultationPage.waitForTimeout(300);
  const targetImages = await consultationPage.evaluate(() => {
    const images = [...document.images];
    return { total: images.length, complete: images.filter(image => image.complete && image.naturalWidth > 0).length };
  });
  const targetFirstControl = consultationPage.locator('form input, form select, form textarea, form button').first();
  await targetFirstControl.focus();
  const targetReadiness = {
    formPresent: await consultationPage.locator('form').count() === 1,
    firstControlFocused: await targetFirstControl.evaluate(node => node === document.activeElement),
    enabledSubmit: await consultationPage.locator('form button[type="submit"]').evaluate(button => !button.disabled)
  };
  const ctaKeyboard = {
    route: consultationPage.url(),
    targetImages,
    targetReadiness,
    targetConsoleErrors: consultationConsoleErrors,
    targetPageErrors: consultationPageErrors,
    targetRequestFailures: consultationErrors
  };
  await consultationPage.close();

  proof.widths.push({
    width,
    httpStatus: response?.status() ?? null,
    metrics,
    interactions: { faq, video, navigation, menu, ctas, ctaKeyboard },
    consoleErrors,
    pageErrors,
    requestFailures
  });
  await context.close();
}

await browser.close();
await fs.writeFile(path.join(root, 'runtime-proof.json'), JSON.stringify(proof, null, 2));
console.log(JSON.stringify(proof, null, 2));
