import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/alexe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const sharp = require('C:/Users/alexe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');

const projectRoot = 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt';
const outputRoot = path.join(projectRoot, 'artifacts/nebula-easy-blog-input-source-rebase/static-pass-20260811/fresh-context-captures');
const sourceRoot = path.join(projectRoot, 'compare-board-sources/c76-normalized-export-20260727');
const manifestPath = path.join(projectRoot, 'figma-manifest/c76-normalized-export-20260727/blog-input.json');
const url = 'http://127.0.0.1:8765/nebula-easy-blog-input.html';
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const manifestHash = 'e5a9922e6f77eeb1ab2ca58215f25ee94c54e3c71b3d73c4c95a5a3a956d2bc8';
const ownerSelector = '.blog-input-article__post';
const widths = [
  { width: 1200, nodeId: '643:7448', sha: 'c527f2777299ef10417f838eb1fccfe626ecc440363bd20305ea325ddab0241c', source: { x: 45, y: 3607, width: 1110, height: 1530 } },
  { width: 992, nodeId: '1006:23266', sha: '726b032d07a545bd76ca847037849ef6179366baeed83600a4e2ec566dd7d8cc', source: { x: 31, y: 3737, width: 930, height: 1680 } },
  { width: 768, nodeId: '1006:25391', sha: '0c9a9d65c2e0e0c9efb229a5393a6680c3a643161b830d4aa26de7882abec0a3', source: { x: 39, y: 3278, width: 690, height: 1472 } },
  { width: 576, nodeId: '1008:22880', sha: '7ed2f108c544e9053e8e3663cd7a3a29e6b62ac1f95ae5576437dc3a0ac914c8', source: { x: 33, y: 3245, width: 510, height: 1649 } },
  { width: 320, nodeId: '1008:23368', sha: '3510b5e5ab8870407cf8a1ad5662c98bdc762847c9ea2a4009acc55f80d385f4', source: { x: 15, y: 4153, width: 290, height: 2055 } }
];

const sha256 = async file => createHash('sha256').update(await fs.readFile(file)).digest('hex');
const productFiles = ['nebula-easy-blog-input.html', 'nebula-easy-blog-input.css', 'nebula-easy-blog-input.js'].map(file => path.join(projectRoot, file));
const productHash = createHash('sha256').update(Buffer.concat(await Promise.all(productFiles.map(file => fs.readFile(file))))).digest('hex');

const canvas = async (input, width, height) => sharp({ create: { width, height, channels: 3, background: '#ffffff' } }).composite([{ input, left: 0, top: 0 }]).png().toBuffer();
const labelled = async (input, state, spec, target) => {
  const meta = await sharp(input).metadata();
  const svg = `<svg width="${meta.width}" height="72" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#17131f"/><text x="10" y="17" fill="#fff" font-family="Arial" font-size="12">${state} | ${spec.width}px | source node ${spec.nodeId} | owner ${ownerSelector}</text><text x="10" y="36" fill="#f7d46b" font-family="Arial" font-size="10">source SHA ${spec.sha}</text><text x="10" y="53" fill="#cbbcff" font-family="Arial" font-size="10">manifest SHA ${manifestHash}</text><text x="10" y="68" fill="#9fe3ba" font-family="Arial" font-size="10">live product SHA ${productHash} | fresh Playwright context, one owner element clip</text></svg>`;
  await sharp(input).extend({ top: 72, background: '#17131f' }).composite([{ input: Buffer.from(svg), top: 0, left: 0 }]).png().toFile(target);
};

await fs.mkdir(outputRoot, { recursive: true });
const manifestOnDiskHash = await sha256(manifestPath);
if (manifestOnDiskHash !== manifestHash) throw new Error(`Manifest hash mismatch: ${manifestOnDiskHash}`);
const browser = await chromium.launch({ headless: true, executablePath: chrome });
const proof = { url, captureMethod: 'fresh_playwright_context_per_width_one_owner_element_clip', manifestHash, productHash, widths: [], expectedLenses: 20, actualLenses: 0 };

try {
  for (const spec of widths) {
    const context = await browser.newContext({ viewport: { width: spec.width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    const consoleErrors = [];
    const pageErrors = [];
    const requestFailures = [];
    page.on('console', message => { if (message.type() === 'error') consoleErrors.push(message.text()); });
    page.on('pageerror', error => pageErrors.push(error.message));
    page.on('requestfailed', request => requestFailures.push({ url: request.url(), error: request.failure()?.errorText || 'unknown' }));
    try {
      const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
      await page.evaluate(async () => {
        await document.fonts.ready;
        await Promise.all([...document.images].map(image => image.complete ? undefined : new Promise(resolve => { image.addEventListener('load', resolve, { once: true }); image.addEventListener('error', resolve, { once: true }); })));
      });
      const owner = page.locator(ownerSelector);
      await owner.scrollIntoViewIfNeeded();
      const ownerBox = await owner.boundingBox();
      if (!ownerBox) throw new Error(`Owner has no bounding box: ${ownerSelector}`);
      const livePath = path.join(outputRoot, `live-owner-${spec.width}.png`);
      await owner.screenshot({ path: livePath, type: 'png', animations: 'disabled' });
      const sourcePath = path.join(sourceRoot, `blog-input-${spec.width}-${spec.nodeId.replace(':', '-')}.png`);
      const sourceCropPath = path.join(outputRoot, `source-owner-${spec.width}.png`);
      await sharp(sourcePath).extract({ left: spec.source.x, top: spec.source.y, width: spec.source.width, height: spec.source.height }).png().toFile(sourceCropPath);
      const liveMeta = await sharp(livePath).metadata();
      const sourceMeta = await sharp(sourceCropPath).metadata();
      const compareWidth = Math.max(liveMeta.width, sourceMeta.width);
      const compareHeight = Math.max(liveMeta.height, sourceMeta.height);
      const normalizedLive = await canvas(livePath, compareWidth, compareHeight);
      const normalizedSource = await canvas(sourceCropPath, compareWidth, compareHeight);
      const sideRaw = path.join(outputRoot, `tmp-side-${spec.width}.png`);
      await sharp({ create: { width: compareWidth * 2, height: compareHeight, channels: 3, background: '#ffffff' } }).composite([{ input: normalizedSource, left: 0, top: 0 }, { input: normalizedLive, left: compareWidth, top: 0 }]).png().toFile(sideRaw);
      const overlayRaw = path.join(outputRoot, `tmp-overlay-${spec.width}.png`);
      await sharp(normalizedSource).composite([{ input: normalizedLive, opacity: 0.48 }]).png().toFile(overlayRaw);
      const differenceRaw = path.join(outputRoot, `tmp-difference-${spec.width}.png`);
      await sharp(normalizedSource).composite([{ input: normalizedLive, blend: 'difference' }]).png().toFile(differenceRaw);
      const sourceEdges = await sharp(normalizedSource).greyscale().convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] }).png().toBuffer();
      const liveEdges = await sharp(normalizedLive).greyscale().convolve({ width: 3, height: 3, kernel: [-1, -1, -1, -1, 8, -1, -1, -1, -1] }).png().toBuffer();
      const edgesRaw = path.join(outputRoot, `tmp-edges-${spec.width}.png`);
      await sharp({ create: { width: compareWidth * 2, height: compareHeight, channels: 3, background: '#000000' } }).composite([{ input: sourceEdges, left: 0, top: 0 }, { input: liveEdges, left: compareWidth, top: 0 }]).png().toFile(edgesRaw);
      const states = ['side', 'overlay', 'difference', 'edges'];
      for (const state of states) await labelled(path.join(outputRoot, `tmp-${state}-${spec.width}.png`), state.toUpperCase(), spec, path.join(outputRoot, `${state}-${spec.width}.png`));
      const dom = await page.evaluate(selector => {
        const owner = document.querySelector(selector);
        const heading = owner?.querySelector('.blog-input-article__post-title');
        const style = heading && getComputedStyle(heading);
        const rect = owner?.getBoundingClientRect();
        const root = document.documentElement;
        const shell = document.querySelector('.blog-input-article__banner-shell');
        const shellRect = shell?.getBoundingClientRect();
        const flow = owner ? [...owner.children].map((node, index) => {
          const bounds = node.getBoundingClientRect();
          const computed = getComputedStyle(node);
          return { index, tag: node.tagName, y: Math.round(bounds.top + scrollY), height: Math.round(bounds.height), marginBottom: computed.marginBottom, lineHeight: computed.lineHeight };
        }) : [];
        return { viewport: innerWidth, bannerShell: shellRect && { y: Math.round(shellRect.top + scrollY), height: Math.round(shellRect.height), bottom: Math.round(shellRect.bottom + scrollY) }, owner: rect && { y: Math.round(rect.top + scrollY), width: Math.round(rect.width), height: Math.round(rect.height) }, heading: heading && { align: style.textAlign, fontSize: style.fontSize, lineHeight: style.lineHeight }, flow, horizontalOverflow: Math.max(0, root.scrollWidth - root.clientWidth), imagesMissing: [...document.images].filter(image => !image.complete || !image.naturalWidth).length, hashLinks: [...document.querySelectorAll('a[href="#"]')].length };
      }, ownerSelector);
      const files = [livePath, sourceCropPath, ...states.map(state => path.join(outputRoot, `${state}-${spec.width}.png`))];
      proof.widths.push({ width: spec.width, nodeId: spec.nodeId, sourceSha256: spec.sha, sourceGeometry: spec.source, httpStatus: response?.status() ?? null, dom, consoleErrors, pageErrors, requestFailures, imageHashes: Object.fromEntries(await Promise.all(files.map(async file => [path.basename(file), await sha256(file)]))) });
      proof.actualLenses += 4;
    } finally {
      await page.close();
      await context.close();
    }
  }
} finally {
  await browser.close();
}
proof.missingLenses = proof.expectedLenses - proof.actualLenses;
if (proof.missingLenses !== 0) throw new Error(`Lens incomplete: ${proof.actualLenses}/${proof.expectedLenses}`);
await fs.writeFile(path.join(outputRoot, 'FRESH-CONTEXT-LENS-PROVENANCE.json'), JSON.stringify(proof, null, 2));
console.log(JSON.stringify({ expectedLenses: proof.expectedLenses, actualLenses: proof.actualLenses, widths: proof.widths.map(item => ({ width: item.width, overflow: item.dom.horizontalOverflow, imagesMissing: item.dom.imagesMissing })) }, null, 2));
