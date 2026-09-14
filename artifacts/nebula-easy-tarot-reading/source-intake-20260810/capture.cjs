const fs = require('fs');
const path = require('path');
const { chromium } = require('C:/Users/alexe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root = path.resolve(__dirname, '..', '..', '..');
const out = path.join(__dirname, 'postimages');
const url = 'http://127.0.0.1:8765/nebula-easy-tarot-reading.html';
const widths = [1200, 992, 768, 576, 320];
fs.mkdirSync(out, { recursive: true });

(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', headless: true });
  const proof = { schema: 'nebula_easy_tarot_reading_static_pass.v1', generatedAt: new Date().toISOString(), url, status: 'pass', widths: [] };
  for (const width of widths) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
    const errors = []; const failed = []; const bad = [];
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', e => errors.push(String(e)));
    page.on('requestfailed', r => failed.push(`${r.method()} ${r.url()}`));
    page.on('response', r => { if (r.status() >= 400) bad.push(`${r.status()} ${r.url()}`); });
    await page.goto(url, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    const menu = page.locator('.menu-toggle');
    let menuPass = 'desktop_not_required';
    if (width < 768) { await menu.click(); const open = await menu.getAttribute('aria-expanded'); await menu.click(); const closed = await menu.getAttribute('aria-expanded'); menuPass = open === 'true' && closed === 'false' ? 'pass' : 'fail'; }
    const faq = page.locator('#faq details').nth(0); const before = await faq.getAttribute('open'); await faq.locator('summary').click(); const after = await faq.getAttribute('open');
    const dims = await page.evaluate(() => ({ clientWidth: document.documentElement.clientWidth, scrollWidth: document.documentElement.scrollWidth, scrollHeight: document.documentElement.scrollHeight }));
    const images = await page.locator('img').evaluateAll(nodes => ({ total: nodes.length, broken: nodes.filter(n => !n.complete || !n.naturalWidth).map(n => n.currentSrc) }));
    const screenshot = path.join(out, `candidate-${width}.png`); await page.screenshot({ path: screenshot, fullPage: true, animations: 'disabled' });
    const failures = []; if (dims.scrollWidth > dims.clientWidth) failures.push('horizontal_overflow'); if (images.broken.length) failures.push('broken_images'); if (errors.length || failed.length || bad.length) failures.push('runtime'); if (menuPass === 'fail') failures.push('menu'); if (before !== null || after === null) failures.push('faq_toggle');
    proof.widths.push({ width, dims, images, interactions: { menu: menuPass, faq_toggle: before === null && after !== null ? 'pass' : 'fail' }, errors, failed, bad, screenshot: path.relative(root, screenshot).replaceAll('\\', '/'), failures });
    if (failures.length) proof.status = 'fail'; await page.close();
  }
  await browser.close(); fs.writeFileSync(path.join(__dirname, 'five-width-static-proof.json'), JSON.stringify(proof, null, 2) + '\n');
  console.log(JSON.stringify({ status: proof.status, widths: proof.widths.map(({ width, dims, images, interactions, failures }) => ({ width, dims, images, interactions, failures })) }, null, 2)); process.exit(proof.status === 'pass' ? 0 : 1);
})().catch(error => { console.error(error); process.exit(1); });
