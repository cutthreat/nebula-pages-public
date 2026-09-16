import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';

const args = process.argv.slice(2);
const rootArg = args[args.indexOf('--root') + 1] ?? path.join(import.meta.dirname, '..', 'outputs', 'nebula-native-layout-20260916-v1', 'site');
const port = Number(args[args.indexOf('--port') + 1] ?? 4188);
const root = path.resolve(rootArg);
const mime = {
  '.html': 'text/html; charset=utf-8', '.htm': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.webp': 'image/webp', '.avif': 'image/avif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf', '.mp4': 'video/mp4', '.webm': 'video/webm'
};

const server = http.createServer((request, response) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host ?? '127.0.0.1'}`).pathname); } catch { response.writeHead(400); response.end('Bad URL'); return; }
  const relative = pathname.replace(/^\/+/, '');
  let target = path.resolve(root, relative);
  if (!target.startsWith(`${root}${path.sep}`) && target !== root) { response.writeHead(403); response.end('Forbidden'); return; }
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, 'index.html');
  if (!fs.existsSync(target) || !fs.statSync(target).isFile()) { response.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' }); response.end('Not found'); return; }
  const headers = { 'content-type': mime[path.extname(target).toLowerCase()] ?? 'application/octet-stream', 'cache-control': 'no-store' };
  if (request.method === 'HEAD') { response.writeHead(200, headers); response.end(); return; }
  response.writeHead(200, headers); fs.createReadStream(target).pipe(response);
});

server.listen(port, '127.0.0.1', () => console.log(`Nebula native layout preview: http://127.0.0.1:${port}/ (root ${root})`));
process.on('SIGINT', () => server.close(() => process.exit(0)));
