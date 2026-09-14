const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const root = __dirname;
const url = 'http://127.0.0.1:8765/nebula-easy-phone-psychic.html';
const output = path.join(root, 'focused-faq-proof.json');
const result = { url, startedAt: new Date().toISOString(), widths: [], infrastructure: null };
const sha = (file) => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex').toUpperCase();

function deadline(stage, ms, work) {
  return Promise.race([
    work(),
    new Promise((_, reject) => setTimeout(() => reject(new Error(`${stage}_timeout_${ms}ms`)), ms))
  ]);
}

async function capture(width) {
  const row = { width, stages: [], consoleErrors: [], pageErrors: [], requestErrors: [] };
  let browser;
  let context;
  try {
    row.stages.push('launch');
    browser = await deadline('launch', 15000, () => chromium.launch({
      headless: true,
      executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe',
      args: ['--disable-dev-shm-usage']
    }));
    row.stages.push('context');
    context = await deadline('context', 5000, () => browser.newContext({ viewport: { width, height: 900 }, reducedMotion: 'reduce' }));
    const page = await deadline('page', 5000, () => context.newPage());
    page.on('console', (m) => { if (m.type() === 'error') row.consoleErrors.push(m.text()); });
    page.on('pageerror', (e) => row.pageErrors.push(e.message));
    page.on('requestfailed', (r) => row.requestErrors.push(`${r.method()} ${r.url()} ${r.failure()?.errorText || ''}`));
    await page.addStyleTag({ content: '*,*::before,*::after{animation:none!important;transition:none!important;scroll-behavior:auto!important}' });
    row.stages.push('navigate');
    const response = await deadline('navigate', 10000, () => page.goto(url, { waitUntil: 'domcontentloaded', timeout: 9000 }));
    await deadline('fonts', 5000, () => page.evaluate(() => document.fonts.ready));
    const faq = page.locator('.pp-faq');
    row.stages.push('faq-locate');
    await deadline('faq-locate', 5000, () => faq.scrollIntoViewIfNeeded());
    row.geometry = await deadline('geometry', 5000, () => page.evaluate(() => {
      const faq = document.querySelector('.pp-faq');
      const r = faq.getBoundingClientRect();
      return {
        http: document.readyState,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        overflow: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
        faq: [Math.round(r.y + scrollY), Math.round(r.height)],
        brokenImages: [...document.images].filter((i) => !i.complete || !i.naturalWidth).map((i) => i.currentSrc || i.src),
        duplicateIds: [...document.querySelectorAll('[id]')].map((e) => e.id).filter((id, i, a) => a.indexOf(id) !== i),
        textFrame: (() => { const e = document.querySelector('.faq-section__toggle-content'); const c = getComputedStyle(e); return { background: c.backgroundColor, radius: c.borderRadius }; })()
      };
    }));
    row.http = response?.status() || null;
    row.stages.push('open-capture');
    const openFile = path.join(root, `live-faq-${width}-open-final.png`);
    await deadline('open-capture', 7000, () => faq.screenshot({ path: openFile }));
    await deadline('toggle-close', 5000, () => page.locator('.pp-faq__item:nth-child(3) .faq-section__toggle').click());
    const closed = await deadline('closed-state', 5000, () => page.locator('.pp-faq__item:nth-child(3)').evaluate((e) => ({ open: e.classList.contains('is-open'), expanded: e.querySelector('button').getAttribute('aria-expanded') })));
    row.stages.push('closed-capture');
    const closedFile = path.join(root, `live-faq-${width}-closed-final.png`);
    await deadline('closed-capture', 7000, () => faq.screenshot({ path: closedFile }));
    row.captures = { open: { file: openFile, sha256: sha(openFile) }, closed: { file: closedFile, sha256: sha(closedFile) } };
    row.closedState = closed;
    row.status = 'pass';
  } catch (error) {
    row.status = 'infrastructure_error';
    row.error = error.message || String(error);
  } finally {
    if (context) { try { await deadline('context-close', 5000, () => context.close()); } catch (error) { row.closeError = error.message || String(error); } }
    if (browser) { try { await deadline('browser-close', 5000, () => browser.close()); } catch (error) { row.closeError = row.closeError || error.message || String(error); } }
  }
  result.widths.push(row);
  return row.status === 'pass';
}

(async () => {
  for (const width of [576, 768]) {
    if (!(await capture(width))) break;
  }
  result.finishedAt = new Date().toISOString();
  fs.writeFileSync(output, JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result));
  process.exit(result.widths.every((row) => row.status === 'pass') ? 0 : 2);
})().catch((error) => {
  result.infrastructure = error.message || String(error);
  result.finishedAt = new Date().toISOString();
  fs.writeFileSync(output, JSON.stringify(result, null, 2));
  console.error(JSON.stringify(result));
  process.exit(2);
});
