import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { spawnSync } from 'node:child_process';

const packageRoot = path.resolve(process.argv[2] ?? path.join(import.meta.dirname, '..', 'outputs', 'nebula-native-layout-20260916-v1'));
const siteRoot = path.join(packageRoot, 'site');
const proofRoot = path.join(packageRoot, 'proof');
const widths = [1200, 992, 768, 576, 320];

function walk(dir) {
  const result = [];
  if (!fs.existsSync(dir)) return result;
  for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, item.name);
    if (item.isDirectory()) result.push(...walk(full));
    else if (item.isFile()) result.push(full);
  }
  return result;
}

function rel(full) {
  return path.relative(packageRoot, full).replaceAll('\\', '/');
}

function siteRel(full) {
  return path.relative(siteRoot, full).replaceAll('\\', '/');
}

function sha256(full) {
  return crypto.createHash('sha256').update(fs.readFileSync(full)).digest('hex').toUpperCase();
}

function stripQueryHash(value) {
  return String(value).split(/[?#]/, 1)[0];
}

function isExternal(value) {
  const raw = String(value).trim();
  return !raw || raw.startsWith('#') || raw.startsWith('?') || /^(?:data|mailto|tel|javascript|blob):/i.test(raw) || /^(?:https?:)?\/\//i.test(raw);
}

function isActionToken(value) {
  const raw = stripQueryHash(value).replace(/^\.?\/?/, '');
  return !raw || !/[./]/.test(raw) || /^(?:close|dismiss|back|cancel|menu|settings|profile|logout|favorite|notifications?|support|open|start|send|submit|next|prev)$/i.test(raw);
}

function resolveLocal(fromFull, raw) {
  const clean = stripQueryHash(String(raw).trim()).replace(/^\\?["']/, '').replace(/["']$/, '').replaceAll('\\', '/');
  if (isExternal(clean) || isActionToken(clean)) return { ignored: true, clean };
  if (/[;]|\$\{|\bdata\.[A-Za-z_$]/.test(clean) || /^data:/i.test(clean)) return { ignored: true, clean };
  const base = clean.startsWith('/') ? siteRoot : path.dirname(fromFull);
  const candidate = path.resolve(base, clean.replace(/^\/+/, ''));
  const relative = path.relative(siteRoot, candidate);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return { broken: true, clean, candidate, reason: 'path escapes site root' };
  if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return { present: true, clean, candidate };
  if (clean.endsWith('/') && fs.existsSync(path.join(candidate, 'index.html'))) return { present: true, clean, candidate: path.join(candidate, 'index.html') };
  if (!path.extname(clean) && fs.existsSync(path.join(candidate, 'index.html'))) return { present: true, clean, candidate: path.join(candidate, 'index.html') };
  return { broken: true, clean, candidate, reason: 'file or directory index not found' };
}

function refsFromHtml(text) {
  const refs = [];
  const attrRe = /\b(?:href|src|poster|action|formaction|data-src|data-fallback-src|data-image|data-background-image)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  for (const match of text.matchAll(attrRe)) refs.push({ raw: match[1] ?? match[2] ?? match[3], kind: 'html-attribute' });
  const srcsetRe = /\bsrcset\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  for (const match of text.matchAll(srcsetRe)) {
    const value = match[1] ?? match[2] ?? match[3] ?? '';
    for (const item of value.split(',')) refs.push({ raw: item.trim().split(/\s+/)[0], kind: 'srcset' });
  }
  for (const match of text.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)) refs.push({ raw: match[2], kind: 'inline-css' });
  return refs.filter((item) => item.raw);
}

function refsFromCss(text) {
  return [...text.matchAll(/url\(\s*(['"]?)(.*?)\1\s*\)/gi)].map((match) => ({ raw: match[2], kind: 'css-url' })).filter((item) => item.raw && item.raw.toLowerCase() !== 'none');
}

function refsFromJs(text) {
  const refs = [];
  const re = /(['"`])((?:\.\.?\/|\/)(?!\/)[^'"`\s<>()[\]{}]+)\1/g;
  for (const match of text.matchAll(re)) refs.push({ raw: match[2], kind: 'js-string' });
  return refs;
}

function writeJson(name, value) {
  fs.mkdirSync(proofRoot, { recursive: true });
  fs.writeFileSync(path.join(proofRoot, name), `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

if (!fs.existsSync(siteRoot)) throw new Error(`Missing site root: ${siteRoot}`);

const allFiles = walk(siteRoot);
const servedFiles = allFiles.map((full) => ({ full, path: `site/${siteRel(full)}`, bytes: fs.statSync(full).size, sha256: sha256(full) }));
const broken = [];
const refs = [];
const external = [];
const forbidden = [];

for (const item of servedFiles) {
  const ext = path.extname(item.full).toLowerCase();
  if (!['.html', '.htm', '.css', '.js', '.mjs'].includes(ext)) continue;
  const text = fs.readFileSync(item.full, 'utf8');
  const localTextPatterns = [
    { pattern: /(?:^|["'`\s])\/nebula-account(?:\/|["'`\s])/g, reason: 'absolute account route remains in served source' },
    { pattern: /https?:\/\/127\.0\.0\.1(?::\d+)?/gi, reason: 'local Yii2 URL remains in served source' },
    { pattern: /(?:^|["'`\s])file:\/\//gi, reason: 'file URL remains in served source' },
    { pattern: /(?:^|["'`\s])(?:[A-Z]:\\|[FH]:\/)/g, reason: 'developer filesystem path remains in served source' }
  ];
  for (const check of localTextPatterns) if (check.pattern.test(text)) forbidden.push({ file: item.path, reason: check.reason });
  const fileRefs = ext === '.html' || ext === '.htm' ? refsFromHtml(text) : ext === '.css' ? refsFromCss(text) : refsFromJs(text);
  for (const ref of fileRefs) {
    const clean = String(ref.raw).trim();
    if (/^(?:https?:)?\/\//i.test(clean)) external.push({ file: item.path, raw: clean, kind: ref.kind });
    if (ref.kind === 'js-string' && /\.html?$/i.test(stripQueryHash(clean))) continue;
    const result = resolveLocal(item.full, clean);
    if (result.ignored) continue;
    const record = { file: item.path, raw: clean, kind: ref.kind, target: result.candidate ? rel(result.candidate) : undefined, status: result.broken ? 'broken' : 'present' };
    refs.push(record);
    if (result.broken) broken.push({ ...record, reason: result.reason });
  }
}

const jsFiles = servedFiles.filter((item) => ['.js', '.mjs', '.cjs'].includes(path.extname(item.full).toLowerCase()));
const syntax = jsFiles.map((item) => {
  const check = spawnSync(process.execPath, ['--check', item.full], { encoding: 'utf8' });
  return { file: item.path, status: check.status === 0 ? 'pass' : 'fail', exitCode: check.status, stderr: (check.stderr ?? '').trim().slice(0, 2000) };
});

const routeMatrixPath = path.join(packageRoot, 'manifest', 'route-matrix.json');
const routeMatrix = JSON.parse(fs.readFileSync(routeMatrixPath, 'utf8'));
const routeEntries = [...(routeMatrix.landingPublic ?? []), ...(routeMatrix.accountCabinetChat ?? [])];
const routeFiles = routeEntries.map((entry) => entry.output);
const missingRouteFiles = routeFiles.filter((entry) => !fs.existsSync(path.join(packageRoot, entry)));
const duplicateRouteFiles = routeFiles.filter((entry, index) => routeFiles.indexOf(entry) !== index);

const result = {
  schema: 'nebula.native-layout-static-link-audit.v1',
  generatedAt: new Date().toISOString(),
  packageRoot,
  counts: { servedFiles: servedFiles.length, servedBytes: servedFiles.reduce((sum, item) => sum + item.bytes, 0), localReferences: refs.length, brokenReferences: broken.length, externalReferences: external.length, forbiddenFindings: forbidden.length, jsFiles: jsFiles.length, jsSyntaxFailures: syntax.filter((item) => item.status === 'fail').length, routeEntries: routeEntries.length, missingRouteFiles: missingRouteFiles.length, duplicateRouteFiles: duplicateRouteFiles.length },
  brokenReferences: broken,
  externalReferences: external,
  forbiddenFindings: forbidden,
  routeCoverage: { widths, missingRouteFiles, duplicateRouteFiles, entries: routeEntries.length },
  claimCeiling: 'static filesystem/link/resource closure only; no backend readiness claim'
};
writeJson('static-link-audit.json', result);
writeJson('js-syntax.json', { schema: 'nebula.native-layout-js-syntax.v1', generatedAt: result.generatedAt, counts: { files: jsFiles.length, failures: syntax.filter((item) => item.status === 'fail').length }, files: syntax });

const packageFiles = walk(packageRoot).filter((full) => !full.includes(`${path.sep}.git${path.sep}`)).map((full) => ({ path: rel(full), bytes: fs.statSync(full).size, sha256: sha256(full) })).sort((a, b) => a.path.localeCompare(b.path));
writeJson('package-files.json', { schema: 'nebula.native-layout-package-files.v1', generatedAt: result.generatedAt, packageRoot, counts: { files: packageFiles.length, bytes: packageFiles.reduce((sum, item) => sum + item.bytes, 0) }, files: packageFiles });

console.log(JSON.stringify(result, null, 2));
if (broken.length || forbidden.length || missingRouteFiles.length || duplicateRouteFiles.length || syntax.some((item) => item.status === 'fail')) process.exitCode = 1;
