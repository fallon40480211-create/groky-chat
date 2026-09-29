// iOS 键盘遮挡回归测试：WebKit 390x844 打开“添加服务”面板后把视口压到 390x450（模拟键盘），确认所有字段与保存按钮可滚动到达
import { webkit } from 'playwright';
const APP = process.env.APP_URL || 'http://localhost:8787/';
const SHOTS = new URL('../screenshots/', import.meta.url).pathname;
let fails = 0;
const ok = (n, c, x = '') => { if (!c) fails++; console.log(c ? '✅' : '❌', n, x); };
const browser = await webkit.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'zh-CN' });
const page = await ctx.newPage();
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
await page.goto(APP); await page.waitForSelector('.empty');

const inView = (loc) => loc.evaluate((el) => {
  const r = el.getBoundingClientRect(); const vv = window.visualViewport; const H = vv ? vv.height + vv.offsetTop : innerHeight;
  const sheet = el.closest('.sheet').getBoundingClientRect();
  return r.top >= Math.max(0, sheet.top) - 1 && r.bottom <= Math.min(H, sheet.bottom) + 1 && r.height > 0;
});
async function reach(sheet, loc, label) {
  await loc.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  ok(`${label} 可滚动到可视区`, await inView(loc));
}
async function checkProvider(mode) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole('button', { name: '＋ 添加模型服务' }).click();
  await page.locator('.preset-grid button', { hasText: '自定义' }).click();
  const s = page.locator('.sheet').last();
  await s.locator('input[type=password]').waitFor(); await page.waitForTimeout(500); // 等 slideUp 动画结束
  await page.setViewportSize({ width: 390, height: 450 });
  if (mode === 'kb') await page.evaluate(() => document.documentElement.classList.add('kb-open'));
  await page.waitForTimeout(300);
  const m = await s.evaluate((el) => { const r = el.getBoundingClientRect(); const b = el.querySelector('.sheet-body');
    const sc = document.documentElement.classList.contains('kb-open') ? el : b;
    return { top: r.top, bottom: r.bottom, vh: window.visualViewport.height, scrollH: sc.scrollHeight, clientH: sc.clientHeight, ov: getComputedStyle(sc).overflowY }; });
  ok(`[${mode}] 面板位于 450px 可视区内`, m.top >= 0 && m.bottom <= m.vh + 1, JSON.stringify(m));
  ok(`[${mode}] 内容区可滚动`, m.scrollH > m.clientH && m.ov === 'auto', `${m.scrollH}>${m.clientH}`);
  await reach(s, s.getByPlaceholder('例如：我的 Grok'), `[${mode}] 名称`);
  await reach(s, s.locator('input[type=url]'), `[${mode}] Base URL`);
  const key = s.locator('input[type=password]');
  await key.focus(); await page.waitForTimeout(600);
  ok(`[${mode}] API Key 聚焦后自动居中可见`, await inView(key));
  await key.fill('sk-test-kb');
  await reach(s, s.getByPlaceholder('输入模型名，如 grok-4'), `[${mode}] 模型输入`);
  const save = s.getByRole('button', { name: '保存', exact: true });
  await reach(s, save, `[${mode}] 保存按钮`);
  // 触摸滚动：真实滑动手势（WebKit touch 事件不应被 preventDefault 阻止）
  const blocked = await page.evaluate(() => { const ev = new TouchEvent('touchmove', { cancelable: true, bubbles: true, touches: [] });
    document.querySelector('.sheet .sheet-body').dispatchEvent(ev); return ev.defaultPrevented; }).catch(() => 'n/a');
  ok(`[${mode}] touchmove 未被 preventDefault`, blocked === false || blocked === 'n/a', String(blocked));
  const fs = await s.evaluate((el) => [...el.querySelectorAll('input:not([type=checkbox]):not([type=range]),textarea,select')].map((i) => parseFloat(getComputedStyle(i).fontSize)));
  ok(`[${mode}] 输入框字号 ≥16px`, fs.every((x) => x >= 16), fs.join(','));
  await page.screenshot({ path: SHOTS + `sheet-450-${mode}.png` });
  await page.evaluate(() => document.documentElement.classList.remove('kb-open'));
  await page.evaluate(() => document.querySelectorAll('.sheet, .sheet-backdrop').forEach((e) => e.remove()));
}
await checkProvider('normal');
await checkProvider('kb');

// 角色编辑器
await page.setViewportSize({ width: 390, height: 844 });
await page.evaluate(() => document.querySelectorAll('.sheet, .sheet-backdrop').forEach((e) => e.remove()));
await page.locator('#btn-menu').click(); await page.waitForTimeout(350);
await page.locator('.asst-add').click();
const ps = page.locator('.sheet').last();
await ps.locator('textarea').waitFor();
await page.setViewportSize({ width: 390, height: 450 }); await page.waitForTimeout(300);
await ps.locator('textarea').focus(); await page.waitForTimeout(600);
ok('[persona] 系统提示聚焦可见', await inView(ps.locator('textarea')));
await reach(ps, ps.getByRole('button', { name: '保存', exact: true }), '[persona] 保存按钮');
await page.screenshot({ path: SHOTS + 'sheet-450-persona.png' });
ok('无页面错误', errs.length === 0, errs.join(' | '));
await browser.close();
console.log(fails ? `FAILED ${fails}` : 'ALL PASS'); process.exit(fails ? 1 : 0);
