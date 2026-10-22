import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
const mime: Record<string,string> = { '.html':'text/html; charset=utf-8', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.svg':'image/svg+xml', '.woff2':'font/woff2', '.png':'image/png', '.gif':'image/gif', '.webp':'image/webp', '.xml':'application/xml', '.txt':'text/plain' };
export async function serveExport() {
  const root = path.resolve('out');
  const server = http.createServer((req, res) => {
    try {
      let file = path.resolve(root, `.${decodeURIComponent(new URL(req.url!, 'http://localhost').pathname)}`);
      if (!file.startsWith(root + path.sep) && file !== root) { res.writeHead(403).end(); return; }
      if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
      if (!fs.existsSync(file) || !fs.statSync(file).isFile()) { res.writeHead(404).end(); return; }
      res.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
      fs.createReadStream(file).pipe(res);
    } catch { res.writeHead(400).end(); }
  });
  await new Promise<void>((resolve,reject) => { server.once('error',reject); server.listen(0, '127.0.0.1', resolve); });
  const address = server.address();
  if (!address || typeof address === 'string') throw new Error('No server address');
  return { url: `http://127.0.0.1:${address.port}`, close: () => new Promise<void>((resolve,reject) => server.close(e => e ? reject(e) : resolve())) };
}
