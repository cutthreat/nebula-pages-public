import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require('C:/Users/alexe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
const workspace = process.cwd();
const proofRoot = path.join(workspace, 'artifacts', 'nebula-easy-taurus-compatibility');
const splitRoot = path.join(proofRoot, 'splits');
const widths = [1200, 992, 768, 576, 320];
await fs.mkdir(splitRoot, { recursive: true });

const sha256 = async file => crypto.createHash('sha256').update(await fs.readFile(file)).digest('hex').toUpperCase();
const result = { generatedAt: new Date().toISOString(), normalizationWidth: 160, widths: [] };

for (const width of widths) {
  const source = path.join(workspace, 'compare-board-sources', `taurus-compatibility-c76-${width}.png`);
  const live = path.join(proofRoot, 'screenshots', `taurus-${width}.png`);
  const sourceMeta = await sharp(source).metadata();
  const liveMeta = await sharp(live).metadata();
  const normalizedWidth = 160;
  const normalizedHeight = Math.floor(Math.min(sourceMeta.height / sourceMeta.width, liveMeta.height / liveMeta.width) * normalizedWidth);
  const sourceRaw = await sharp(source).resize(normalizedWidth, normalizedHeight, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  const liveRaw = await sharp(live).resize(normalizedWidth, normalizedHeight, { fit: 'fill' }).removeAlpha().raw().toBuffer();
  let absolute = 0;
  for (let index = 0; index < sourceRaw.length; index += 1) absolute += Math.abs(sourceRaw[index] - liveRaw[index]);
  const normalizedMae = absolute / sourceRaw.length / 255;

  const panelWidth = 200;
  const panelHeight = Math.floor(normalizedHeight * panelWidth / normalizedWidth);
  const left = await sharp(source).resize(panelWidth, panelHeight, { fit: 'fill' }).jpeg({ quality: 78 }).toBuffer();
  const right = await sharp(live).resize(panelWidth, panelHeight, { fit: 'fill' }).jpeg({ quality: 78 }).toBuffer();
  const split = path.join(splitRoot, `taurus-${width}-source-live.jpg`);
  await sharp({ create: { width: panelWidth * 2, height: panelHeight, channels: 3, background: '#ffffff' } })
    .composite([{ input: left, left: 0, top: 0 }, { input: right, left: panelWidth, top: 0 }])
    .jpeg({ quality: 80 })
    .toFile(split);

  result.widths.push({
    width,
    source: { path: path.relative(workspace, source), width: sourceMeta.width, height: sourceMeta.height, sha256: await sha256(source) },
    live: { path: path.relative(workspace, live), width: liveMeta.width, height: liveMeta.height, sha256: await sha256(live) },
    heightDelta: liveMeta.height - sourceMeta.height,
    normalizedMae,
    split: path.relative(workspace, split)
  });
}

await fs.writeFile(path.join(proofRoot, 'visual-proof.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
