// 用无头浏览器把 SVG 渲染成 PNG 图标（180/192/512）
import { chromium } from 'playwright';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const out = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f0a07a"/><stop offset="1" stop-color="#c85f3c"/></linearGradient></defs>
<rect width="512" height="512" fill="url(#g)"/>
<path d="M256 118c-88 0-156 58-156 132 0 40 20 76 53 100l-13 52c-2 8 6 14 13 10l62-34c13 3 27 4 41 4 88 0 156-58 156-132S344 118 256 118z" fill="#fffaf5"/>
<path d="M306 214h-58v34h32c-4 20-18 30-36 30-24 0-40-18-40-44s16-44 40-44c12 0 22 4 29 11l24-24c-14-13-32-21-53-21-44 0-78 34-78 78s34 78 78 78c42 0 64-30 64-70 0-10-1-19-2-28z" fill="#d06a44"/>
</svg>`;
const browser = await chromium.launch();
const page = await browser.newPage();
for (const size of [180, 192, 512]) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<html><body style="margin:0">${svg.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  await page.screenshot({ path: path.join(out, `icon-${size}.png`), clip: { x: 0, y: 0, width: size, height: size } });
}
await browser.close();
console.log('icons done');
