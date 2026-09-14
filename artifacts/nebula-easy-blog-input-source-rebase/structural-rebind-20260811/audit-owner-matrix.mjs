import fs from 'node:fs/promises';
import path from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/alexe/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

const root = 'F:/CodexProjects/confideline-nebula/implementation/nebula-gpt';
const output = path.join(root, 'artifacts/nebula-easy-blog-input-source-rebase/structural-rebind-20260811/INHERITED-OWNER-MATRIX.json');
const url = 'http://127.0.0.1:8765/nebula-easy-blog-input.html';
const widths = [1200, 992, 768, 576, 320];
const chrome = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const properties = ['display', 'width', 'height', 'margin-top', 'margin-bottom', 'padding-top', 'padding-bottom', 'font-family', 'font-size', 'font-weight', 'line-height', 'letter-spacing', 'text-align', 'color'];

const browser = await chromium.launch({ headless: true, executablePath: chrome });
const report = { url, capturedAt: new Date().toISOString(), widths: [] };

try {
  for (const width of widths) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30_000 });
    await page.evaluate(async () => document.fonts.ready);
    const result = await page.evaluate(({ properties }) => {
      const article = document.querySelector('.blog-input-article');
      const pre = document.querySelector('.blog-input-article__pre');
      const banner = document.querySelector('.blog-input-article__banner-shell');
      const post = document.querySelector('.blog-input-article__post');
      const before = pre ? [...pre.children] : [];
      const nodes = {
        article,
        pre,
        breadcrumbs: document.querySelector('.blog-input-article__breadcrumbs'),
        meta: document.querySelector('.blog-input-article__meta'),
        lead: document.querySelector('.blog-input-article__lead'),
        preFirstHeading: before.find(node => node.tagName === 'H2') || null,
        preFirstText: pre?.querySelector('.blog-input-article__text') || null,
        banner,
        post,
        postHeading: post?.querySelector('h2') || null,
        postText: post?.querySelector('p') || null
      };
      const geometry = node => {
        if (!node) return null;
        const box = node.getBoundingClientRect();
        const style = getComputedStyle(node);
        return {
          selectorHint: node.className || node.tagName,
          x: Math.round(box.x), y: Math.round(box.y + scrollY), width: Math.round(box.width), height: Math.round(box.height),
          computed: Object.fromEntries(properties.map(property => [property, style.getPropertyValue(property)]))
        };
      };
      const specificity = selector => {
        const ids = (selector.match(/#[\w-]+/g) || []).length;
        const classes = (selector.match(/\.[\w-]+|\[[^\]]+\]|:(?!:)[\w-]+/g) || []).length;
        const elements = (selector.replace(/#[\w-]+|\.[\w-]+|\[[^\]]+\]|::?[\w-]+/g, ' ').match(/\b[a-z][\w-]*\b/gi) || []).length;
        return [ids, classes, elements];
      };
      const rules = [];
      const walk = (list, media = 'all', href = 'inline') => {
        for (const rule of list) {
          if (rule.type === CSSRule.MEDIA_RULE) {
            if (matchMedia(rule.conditionText).matches) walk(rule.cssRules, rule.conditionText, href);
            continue;
          }
          if (rule.type !== CSSRule.STYLE_RULE) continue;
          const matched = Object.entries(nodes).filter(([, node]) => {
            try { return node?.matches(rule.selectorText); } catch { return false; }
          }).map(([name]) => name);
          if (!matched.length) continue;
          const declarations = {};
          for (const property of properties) {
            const value = rule.style.getPropertyValue(property);
            if (value) declarations[property] = { value, priority: rule.style.getPropertyPriority(property) || null };
          }
          if (Object.keys(declarations).length) rules.push({ href, media, selector: rule.selectorText, specificity: specificity(rule.selectorText), matched, declarations });
        }
      };
      for (const sheet of document.styleSheets) {
        try { walk(sheet.cssRules, 'all', sheet.href || 'inline'); } catch { /* same-origin styles only */ }
      }
      return {
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        geometry: Object.fromEntries(Object.entries(nodes).map(([name, node]) => [name, geometry(node)])),
        preFlow: before.map((node, index) => ({ index, ...geometry(node) })),
        postFlow: post ? [...post.children].map((node, index) => ({ index, ...geometry(node) })) : [],
        matchedRules: rules
      };
    }, { properties });
    report.widths.push({ width, ...result });
    await page.close();
    await context.close();
  }
} finally {
  await browser.close();
}

await fs.mkdir(path.dirname(output), { recursive: true });
await fs.writeFile(output, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.widths.map(item => ({ width: item.width, preY: item.geometry.breadcrumbs?.y, banner: item.geometry.banner, post: item.geometry.post, overflow: item.scrollWidth - item.clientWidth, matchedRules: item.matchedRules.length })), null, 2));
