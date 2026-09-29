// UI 截图：WebKit 390x844，预置示例数据后截取 聊天 / 抽屉 / 设置（浅色 + 深色）
import { webkit } from 'playwright';
const APP = process.env.APP_URL || 'http://localhost:8787/';
const SHOTS = new URL('../screenshots/', import.meta.url).pathname;
const browser = await webkit.launch();
let fails = 0; const ok = (n, c, x = '') => { if (!c) fails++; console.log(c ? '✅' : '❌', n, x); };
for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'zh-CN', colorScheme: scheme });
  const page = await ctx.newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message));
  await page.goto(APP); await page.waitForSelector('#topbar'); await page.waitForTimeout(300);
  await page.evaluate(async () => {
    const db = await new Promise((r) => { const q = indexedDB.open('groky-chat', 1); q.onsuccess = () => r(q.result); });
    const put = (st, v, k) => new Promise((r) => { const t = db.transaction(st, 'readwrite'); k === undefined ? t.objectStore(st).put(v) : t.objectStore(st).put(v, k); t.oncomplete = r; });
    await put('providers', { id: 'pv1', name: 'kiro按次', type: 'anthropic', baseUrl: 'http://localhost:8788/v1', apiKey: '', models: ['claude-opus-4-5'], createdAt: 1 });
    await put('personas', { id: 'p-sun', name: '小太阳', emoji: '🧡', prompt: '温暖的陪伴者', temperature: null });
    await put('personas', { id: 'p-hole', name: '小黑洞', emoji: '🖤', prompt: '冷静的倾听者', temperature: null });
    const day = 864e5, now = Date.now();
    const conv = (id, title, ago, extra = {}) => ({ id, title, createdAt: now - ago, updatedAt: now - ago, target: { providerId: 'pv1', model: 'claude-opus-4-5' }, personaId: 'p-sun', systemPrompt: '', temperature: null, messages: [{ id: id + 'm', role: 'user', content: title, createdAt: now - ago }], ...extra });
    for (const c of [conv('c1', '9.24 周计划', 3 * day, { pinned: true }), conv('c2', '梦境与亲密的对话', 1 * day), conv('c3', '伤口与夜话', 5 * day), conv('c4', '换窗口的感受', 5 * day + 3600e3), conv('c5', '新学期宿舍安顿', 19 * day), conv('c6', '网络错误处理', 24 * day)]) await put('conversations', c);
    const st = await new Promise((r) => { const q = db.transaction('kv').objectStore('kv').get('settings'); q.onsuccess = () => r(q.result || {}); });
    await put('kv', { ...st, currentAssistantId: 'p-sun', defaultModel: { providerId: 'pv1', model: 'claude-opus-4-5' }, userName: '艾瑞' }, 'settings');
    localStorage.setItem('groky.current', '');
  });
  await page.reload(); await page.waitForSelector('#topbar'); await page.waitForTimeout(500);
  // 新对话空白页
  await page.locator('#btn-new').click(); await page.waitForTimeout(300);
  ok(`[${scheme}] 标题/副标题`, (await page.textContent('#conv-title')) === '新对话' && (await page.textContent('#conv-model')).includes('claude-opus-4-5 (kiro按次)'));
  ok(`[${scheme}] 输入框占位`, (await page.getAttribute('#input', 'placeholder')) === '输入消息与AI聊天');
  await page.screenshot({ path: SHOTS + `ui-chat-${scheme}.png` });
  await page.locator('#btn-menu').click(); await page.waitForTimeout(400);
  const w = await page.locator('#sidebar').evaluate((e) => e.getBoundingClientRect().width);
  ok(`[${scheme}] 抽屉约 75% 宽`, w > 280 && w <= 320, String(w));
  const groups = await page.locator('.conv-group').allTextContents();
  ok(`[${scheme}] 置顶 + 日期分组`, groups[0] === '置顶' && groups.includes('昨天') && !groups.includes('今天'), groups.join(','));
  ok(`[${scheme}] 助手列表与编辑按钮`, (await page.locator('.asst-item .asst-edit').count()) >= 3);
  await page.screenshot({ path: SHOTS + `ui-drawer-${scheme}.png` });
  await page.locator('#btn-settings').click(); await page.waitForTimeout(400);
  ok(`[${scheme}] 设置页分组`, (await page.locator('.set-title').allTextContents()).join() === '通用设置,模型与服务,数据设置,关于');
  ok(`[${scheme}] 未实现功能为禁用“即将推出”`, (await page.locator('.set-row.soon[disabled]').count()) === 3);
  await page.screenshot({ path: SHOTS + `ui-settings-${scheme}.png` });
  await page.locator('#settings-body').evaluate((e) => { e.scrollTop = e.scrollHeight; }); await page.waitForTimeout(200);
  await page.screenshot({ path: SHOTS + `ui-settings-bottom-${scheme}.png` });
  ok(`[${scheme}] 无页面错误`, !errs.length, errs.join('|'));
  await ctx.close();
}
await browser.close();
console.log(fails ? `FAILED ${fails}` : 'ALL PASS'); process.exit(fails ? 1 : 0);
