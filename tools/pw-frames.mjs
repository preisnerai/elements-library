// Deterministyczny render strony HTML do mp4: strona wystawia window.setup(props) i window.seek(t).
// Użycie: node tools/pw-frames.mjs <page.html> <props.json> <out.mp4> [workers]
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { extname, relative } from 'node:path';

const [html, propsPath, out, workersArg] = process.argv.slice(2);
const props = JSON.parse(readFileSync(propsPath, 'utf8'));
const fps = props.fps ?? 30, dur = props.duration ?? 7, W = props.width ?? 1080, H = props.height ?? 1920;
const start = props.startAt ?? 0; // podgląd od wybranej sekundy
const total = Math.round(fps * (dur - start)), workers = Number(workersArg ?? 3);
const tmp = resolve(dirname(out), `.frames-${Date.now()}`); mkdirSync(tmp, { recursive: true });
const t0 = Date.now();
// statyczny serwer HTTP z katalogu repo (moduły ES i import mapy nie działają z file://)
const ROOT = resolve(dirname(new URL(import.meta.url).pathname), '..');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png' };
const server = createServer((req, res) => {
  try { const f = resolve(ROOT, '.' + decodeURIComponent(req.url.split('?')[0])); const b = readFileSync(f); res.writeHead(200, { 'Content-Type': MIME[extname(f)] || 'application/octet-stream' }); res.end(b); }
  catch { res.writeHead(404); res.end(); }
}).listen(0);
const PORT = server.address().port;
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--font-render-hinting=none'] });
await Promise.all(Array.from({ length: workers }, async (_, k) => {
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('pageerror', e.message));
  page.on('console', m => m.type() === 'error' && console.error('console', m.text()));
  await page.goto(`http://127.0.0.1:${PORT}/${relative(ROOT, resolve(html))}`);
  await page.evaluate(async p => { await window.setup(p); await document.fonts.ready; }, props);
  const cdp = await page.context().newCDPSession(page); // CDP: szybsze kodowanie PNG niż page.screenshot
  for (let i = k; i < total; i += workers) {
    await page.evaluate(t => window.seek(t), start + i / fps);
    const { data } = await cdp.send('Page.captureScreenshot', { format: 'png', optimizeForSpeed: true });
    writeFileSync(`${tmp}/${String(i).padStart(5, '0')}.png`, Buffer.from(data, 'base64'));
  }
}));
await browser.close(); server.close();
execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', '-framerate', String(fps), '-i', `${tmp}/%05d.png`,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-pix_fmt', 'yuv420p', '-tune', 'animation', '-movflags', '+faststart', resolve(out)]);
rmSync(tmp, { recursive: true, force: true });
console.log(`rendered ${total} frames in ${((Date.now() - t0) / 1000).toFixed(1)}s -> ${out}`);
