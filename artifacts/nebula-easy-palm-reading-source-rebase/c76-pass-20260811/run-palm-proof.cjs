const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const root = 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt';
const out = path.join(root, 'artifacts/nebula-easy-palm-reading-source-rebase/c76-pass-20260811');
const url = 'http://127.0.0.1:8765/nebula-easy-palm-reading.html';
const widths = [1200, 992, 768, 576, 320];
const sourceHeights = {1200: 4392, 992: 4297, 768: 4345, 576: 4272, 320: 5886};
const manifestSha = 'F9188F6EB1BC9E807F92AA1E84B891CE2CFE7DBC0925363E64381720679D4897';
const sourceSha = {
  1200: '9C5ED6D9EA914A1FBBF8363859A82BB00CA389F37222957FF2374FB8E10C0EC6',
  992: '7345DAB94707039DA6A2A3D314CF0AC8E19650528B960EFBF9B56B6DC4011F59',
  768: 'F50C73949261191B832E9B4897A03F6F8EB7017F3E7728D485F29B87A4996CF3',
  576: '6851FC738EAB224EBC49E3AA4A5FD9A7B7E3357BB58B1307A4D469B22D66816C',
  320: '90B590C8EBBB8FB5E8D925A83D02CC328C9D59F6FB27EAD0CB25F9B7E8E878DE'
};
const clipTargets = [
  ['hero', '.palm-hero'], ['story', '.palm-story'], ['questions', '.palm-questions'],
  ['seo', '.palm-seo'], ['footer', '.site-footer']
];

const waitForIdleAssets = async page => {
  await page.waitForFunction(() => document.fonts && document.fonts.status === 'loaded');
  await page.waitForFunction(() => [...document.images].every(i => i.complete));
};

(async () => {
  const browser = await chromium.launch({headless: true});
  const report = { schema: 'nebula_easy_palm_reading_fresh_context_proof.v1', url, manifestSha, widths: {}, status: 'pass' };
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const consoleErrors = [], pageErrors = [], failedRequests = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', err => pageErrors.push(String(err)));
    page.on('requestfailed', req => failedRequests.push({ url: req.url(), error: req.failure()?.errorText || 'requestfailed' }));
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await waitForIdleAssets(page);
    const keyboard = { seo: null, menu: null, cta: null, theme: null };
    const seoToggles = page.locator('.palm-seo__toggle:visible');
    if (await seoToggles.count()) {
      const exercised = [await seoToggles.first().getAttribute('aria-expanded')];
      for (let i = 1; i < await seoToggles.count(); i += 1) {
        await seoToggles.nth(i).focus();
        await page.keyboard.press('Enter');
        await page.waitForTimeout(50);
        exercised.push(await seoToggles.nth(i).getAttribute('aria-expanded'));
      }
      await seoToggles.first().focus();
      await page.keyboard.press('Enter');
      await page.waitForTimeout(80);
      keyboard.seo = { count: exercised.length, eachOpened: exercised, defaultRestored: await seoToggles.first().getAttribute('aria-expanded') };
    }
    if (width <= 768) {
      const opener = page.locator('.navbar-toggler');
      const close = page.locator('.site-header__offcanvas-close');
      await opener.focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('#navbarOffcanvasPalm')?.classList.contains('show'));
      const opened = await opener.getAttribute('aria-expanded');
      await close.focus();
      await page.keyboard.press('Enter');
      await page.waitForFunction(() => {
        const panel = document.querySelector('#navbarOffcanvasPalm');
        return panel && !panel.classList.contains('show') && !panel.classList.contains('collapsing');
      });
      keyboard.menu = { opened, closed: await opener.getAttribute('aria-expanded') };
    }
    const ctaLocator = page.locator('.palm-cta');
    if (await ctaLocator.count()) {
      await ctaLocator.focus();
      keyboard.cta = await page.evaluate(() => document.activeElement?.matches('.palm-cta'));
    }
    const theme = page.locator('#switchTheme');
    if (await theme.count() && await theme.isVisible()) {
      const before = await theme.isChecked();
      await theme.focus();
      await page.keyboard.press('Space');
      const changed = await theme.isChecked();
      await page.keyboard.press('Space');
      keyboard.theme = { before, changed, restored: await theme.isChecked() };
    }
    // Keep the visual evidence in the C76 default state; keyboard proof is retained in JSON.
    await page.evaluate(() => document.activeElement?.blur());
    const state = await page.evaluate(() => {
      const duplicateIds = [...document.querySelectorAll('[id]')].map(n => n.id).filter((id, i, all) => all.indexOf(id) !== i);
      const images = [...document.images].filter(i => !i.complete || i.naturalWidth === 0).map(i => i.currentSrc || i.src);
      const de = document.documentElement;
      const overflow = Math.max(de.scrollWidth, document.body.scrollWidth) > window.innerWidth;
      const cta = document.querySelector('.palm-cta');
      const links = [...document.querySelectorAll('a[href]')].map(a => ({ text: a.textContent.trim().replace(/\s+/g, ' '), href: a.href })).filter(x => x.href.startsWith(location.origin));
      return {
        pageHeight: Math.max(document.body.scrollHeight, de.scrollHeight), overflow, duplicateIds, brokenImages: images,
        seo: { keyboardOwner: document.querySelector('.palm-seo__toggle')?.tagName || null, defaultState: document.querySelector('.palm-seo__toggle')?.getAttribute('aria-expanded') || null },
        cta: { href: cta?.href || null, tag: cta?.tagName || null, focusable: cta ? cta.tabIndex >= 0 : false },
        links, reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches
      };
    });
    state.keyboard = keyboard;
    const uniqueLinks = [...new Set(state.links.map(x => x.href))];
    const linkResults = [];
    for (const href of uniqueLinks) {
      try { const r = await page.request.get(href, { timeout: 10000 }); linkResults.push({ href, status: r.status() }); }
      catch (e) { linkResults.push({ href, error: String(e) }); }
    }
    const clips = [];
    for (const [name, selector] of clipTargets) {
      const locator = page.locator(selector).first();
      if (await locator.count()) {
        const file = path.join(out, `live-${width}-${name}.png`);
        await locator.screenshot({ path: file, timeout: 30000 });
        clips.push(path.basename(file));
      }
    }
    report.widths[width] = {
      httpStatus: response?.status() || null, sourceHeight: sourceHeights[width], sourceSha: sourceSha[width],
      ...state, linkResults, clips, consoleErrors, pageErrors, failedRequests,
      clean: response?.ok() && !state.overflow && !state.duplicateIds.length && !state.brokenImages.length && !consoleErrors.length && !pageErrors.length && !failedRequests.length && linkResults.every(x => x.status === 200)
    };
    if (!report.widths[width].clean) report.status = 'fail';
    await context.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(out, 'five-width-runtime-proof.json'), JSON.stringify(report, null, 2));
  process.stdout.write(JSON.stringify(report, null, 2));
})().catch(err => { console.error(err.stack || String(err)); process.exit(1); });
