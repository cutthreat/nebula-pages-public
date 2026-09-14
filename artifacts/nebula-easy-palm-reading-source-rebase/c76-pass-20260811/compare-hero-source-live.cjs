const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const { PNG } = require('pngjs');
const pixelmatch = require('pixelmatch').default;

const root = 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt';
const out = path.join(root, 'artifacts/nebula-easy-palm-reading-source-rebase/c76-pass-20260811');
const sourceDir = path.join(root, 'compare-board-sources/c76-normalized-export-20260727');
const nodes = {1200:'910-20010',992:'910-20217',768:'910-19799',576:'910-20428',320:'910-20635'};

(async () => {
  const result = { schema: 'palm_hero_source_live_split.v1', widths: {}, verdict: 'source_geometry_match' };
  for (const width of Object.keys(nodes)) {
    const liveFile = path.join(out, `live-${width}-hero.png`);
    const sourceFile = path.join(sourceDir, `palm-reading-${width}-${nodes[width]}.png`);
    const liveMeta = await sharp(liveFile).metadata();
    const sourceMeta = await sharp(sourceFile).metadata();
    const h = Math.min(liveMeta.height, sourceMeta.height);
    const sourceCrop = path.join(out, `source-${width}-hero.png`);
    await sharp(sourceFile).extract({ left: 0, top: 0, width: Number(width), height: h }).png().toFile(sourceCrop);
    const [a, b] = await Promise.all([fs.promises.readFile(sourceCrop), fs.promises.readFile(liveFile)]);
    const ap = PNG.sync.read(a), bp = PNG.sync.read(b);
    const diff = new PNG({ width: ap.width, height: ap.height });
    const changed = pixelmatch(ap.data, bp.data, diff.data, ap.width, ap.height, { threshold: 0.1, includeAA: false });
    const diffPath = path.join(out, `difference-${width}-hero.png`);
    fs.writeFileSync(diffPath, PNG.sync.write(diff));
    const splitPath = path.join(out, `split-${width}-hero.png`);
    await sharp({ create: { width: ap.width * 2, height: ap.height, channels: 4, background: '#ffffff' } })
      .composite([{ input: sourceCrop, left: 0, top: 0 }, { input: liveFile, left: ap.width, top: 0 }]).png().toFile(splitPath);
    result.widths[width] = { source: path.basename(sourceCrop), live: path.basename(liveFile), split: path.basename(splitPath), difference: path.basename(diffPath), dimensions: `${ap.width}x${ap.height}`, changedPixels: changed, changedRatio: Number((changed / (ap.width * ap.height)).toFixed(6)) };
  }
  fs.writeFileSync(path.join(out, 'hero-source-live-split.json'), JSON.stringify(result, null, 2));
  console.log(JSON.stringify(result, null, 2));
})().catch(error => { console.error(error.stack || String(error)); process.exit(1); });
