// 偏好设置回归测试（WebKit 390x844）：主题 / 聊天项显示 / 渲染 / 行为 / 重试 / 字体 / 背景 / 助手设置
import { webkit } from 'playwright';
import fs from 'node:fs';
const APP = process.env.APP_URL || 'http://localhost:8787/';
const FAKE = 'http://localhost:8788/v1';
const SHOTS = new URL('../screenshots/', import.meta.url).pathname;
const FONT = new URL('../public/vendor/katex/fonts/KaTeX_Main-Italic.woff2', import.meta.url).pathname;
const IMG = new URL('../public/icons/icon-512.png', import.meta.url).pathname;
let fails = 0; const ok = (n, c, x = '') => { if (!c) fails++; console.log(c ? '✅' : '❌', n, x); };

const browser = await webkit.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, locale: 'zh-CN', colorScheme: 'light', acceptDownloads: true });
await ctx.addInitScript(() => {
  window.__wl = { req: 0, rel: 0 }; window.__vib = [];
  Object.defineProperty(navigator, 'wakeLock', { configurable: true, value: { request: async () => { window.__wl.req++; return { release: async () => { window.__wl.rel++; }, addEventListener() {} }; } } });
  navigator.vibrate = (ms) => { window.__vib.push(ms); return true; };
});
const page = await ctx.newPage();
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
let dialogs = 0; page.on('dialog', (d) => { dialogs++; d.accept(); });
const S = (fn) => page.evaluate(fn);
const cssVar = (name) => page.evaluate((n) => getComputedStyle(document.documentElement).getPropertyValue(n).trim(), name);
const topPage = () => page.locator('.subpage').last();
const row = (label) => topPage().locator(`.set-row[aria-label="${label}"]`);
async function toggle(key, val) {
  const sw = topPage().locator(`input[data-key="${key}"]`);
  if ((await sw.isChecked()) !== val) await sw.click({ force: true });
  await page.waitForTimeout(120);
  ok(`开关 ${key}=${val} 已保存`, await page.evaluate(([k, v]) => window.__groky.S.settings[k] === v, [key, val]));
}
async function closePages() {
  for (let i = 0; i < 6 && await page.locator('.subpage').count(); i++) { await topPage().locator('.page-back').click(); await page.waitForTimeout(300); }
  if (await page.locator('#settings-page.show').count()) { await page.locator('#settings-back').click(); await page.waitForTimeout(300); }
}
async function openPrefs() {
  await closePages();
  await page.locator('#btn-menu').click(); await page.waitForTimeout(300);
  await page.locator('#btn-settings').click(); await page.waitForTimeout(300);
  await page.locator('#settings-body .set-row', { hasText: '偏好设置' }).click(); await page.waitForTimeout(400);
}
async function openSub(label) { await openPrefs(); await row(label).click(); await page.waitForTimeout(400); }
const waitDone = async () => { await page.waitForTimeout(300); await page.waitForFunction(() => !window.__groky.S.streaming, null, { timeout: 20000 }); await page.waitForTimeout(200); };
async function send(text) { await page.fill('#input', text); await page.locator('#btn-send').click(); await waitDone(); }
const lastAsst = () => page.locator('.msg.assistant').last();
const lastUser = () => page.locator('.msg.user').last();

// ---- 预置：一个指向假服务的供应商
await page.goto(APP); await page.waitForSelector('#topbar'); await page.waitForTimeout(300);
await page.evaluate(async (FAKE) => {
  const db = await new Promise((r) => { const q = indexedDB.open('groky-chat', 1); q.onsuccess = () => r(q.result); });
  const put = (st, v, k) => new Promise((r) => { const t = db.transaction(st, 'readwrite'); k === undefined ? t.objectStore(st).put(v) : t.objectStore(st).put(v, k); t.oncomplete = r; });
  await put('providers', { id: 'pv1', name: '本地测试', type: 'openai', baseUrl: FAKE, apiKey: 'k', models: ['fake-gpt', 'fake-reasoner'], createdAt: 1 });
  const st = await new Promise((r) => { const q = db.transaction('kv').objectStore('kv').get('settings'); q.onsuccess = () => r(q.result || {}); });
  await put('kv', { ...st, defaultModel: { providerId: 'pv1', model: 'fake-gpt' }, userName: '艾瑞', retryDelay: 0 }, 'settings');
}, FAKE);
await page.reload(); await page.waitForSelector('#topbar'); await page.waitForTimeout(400);

// ---- 偏好设置页
await openPrefs();
ok('偏好设置页', (await topPage().locator('.page-head h1').textContent()) === '偏好设置');
ok('未实现项灰显：图片处理 / 后台任务', (await topPage().locator('.set-row.soon[disabled]').count()) === 2);
await page.screenshot({ path: SHOTS + 'prefs-01-list.png' });
await topPage().locator('.page-body').evaluate((e) => { e.scrollTop = e.scrollHeight; }); await page.waitForTimeout(150);
await page.screenshot({ path: SHOTS + 'prefs-02-list-bottom.png' });

// ---- 应用语言
await row('应用语言').click(); await page.waitForTimeout(250);
ok('语言：简体中文可用、其余即将推出', (await page.locator('.sheet .choice:disabled').count()) === 2 && (await page.locator('.sheet .choice.on').innerText()).includes('简体中文'));
await page.locator('.sheet').last().getByRole('button', { name: '关闭' }).click();

// ---- 主题设置
await row('主题设置').click(); await page.waitForTimeout(400);
await page.screenshot({ path: SHOTS + 'prefs-03-theme.png' });
ok('9 个预设主题', (await topPage().locator('.theme-list .theme-row').count()) === 9);
await topPage().locator('.theme-row[data-theme-id="ocean"]').click(); await page.waitForTimeout(150);
ok('选择海霄蓝 → 强调色', (await cssVar('--accent')) === '#3f5c96', await cssVar('--accent'));
const swBg = await page.evaluate(() => { const i = document.querySelector('.subpage input[data-key="pureBg"]'); return getComputedStyle(i).backgroundColor; });
ok('开关使用强调色', swBg.includes('63, 92, 150'), swBg);
const bg1 = await cssVar('--bg');
await toggle('pureBg', false);
ok('关闭纯色背景 → 背景带主题色调', (await cssVar('--bg')) !== bg1 && (await cssVar('--bg')).startsWith('#'), `${bg1} → ${await cssVar('--bg')}`);
await toggle('pureBg', true);
// 新建自定义主题
await topPage().getByRole('button', { name: '新建主题' }).click(); await page.waitForTimeout(300);
const ts = page.locator('.sheet').last();
await ts.getByPlaceholder('主题名称').fill('玫瑰');
await ts.locator('.hex-input').first().fill('#aa3366');
await ts.getByRole('checkbox', { name: '自定义气泡颜色' }).check();
await ts.locator('.hex-input').nth(1).fill('#f3dfe8');
await page.screenshot({ path: SHOTS + 'prefs-04-theme-editor.png' });
await ts.getByRole('button', { name: '保存', exact: true }).click(); await page.waitForTimeout(300);
ok('自定义主题已应用', (await cssVar('--accent')) === '#aa3366' && (await cssVar('--user-bubble')) === '#f3dfe8', `${await cssVar('--accent')} ${await cssVar('--user-bubble')}`);
await topPage().getByRole('button', { name: '复制主题 玫瑰' }).click(); await page.waitForTimeout(200);
ok('复制主题', (await S(() => window.__groky.S.settings.customThemes.length)) === 2);
await topPage().getByRole('button', { name: '编辑主题 玫瑰 副本' }).click(); await page.waitForTimeout(300);
await page.locator('.sheet').last().getByPlaceholder('主题名称').fill('墨绿');
await page.locator('.sheet').last().locator('.hex-input').first().fill('#1f5f4a');
await page.locator('.sheet').last().getByRole('button', { name: '保存', exact: true }).click(); await page.waitForTimeout(300);
ok('编辑主题', (await S(() => window.__groky.S.settings.customThemes.map((t) => t.name).join())) === '玫瑰,墨绿' && (await cssVar('--accent')) === '#1f5f4a');
const [dl] = await Promise.all([page.waitForEvent('download'), topPage().getByRole('button', { name: '导出主题' }).click()]);
const themeFile = '/tmp/groky-themes.json'; await dl.saveAs(themeFile);
const tj = JSON.parse(fs.readFileSync(themeFile, 'utf8'));
ok('导出主题 JSON', tj.type === 'themes' && tj.themes.length === 2);
await topPage().getByRole('button', { name: '删除主题 墨绿' }).click(); await page.waitForTimeout(250);
ok('删除主题（当前主题被删则回到默认）', (await S(() => window.__groky.S.settings.customThemes.length)) === 1 && (await S(() => window.__groky.S.settings.themeId)) === 'default');
await topPage().locator('input[aria-label="导入主题文件"]').setInputFiles(themeFile); await page.waitForTimeout(400);
ok('导入主题 JSON', (await S(() => window.__groky.S.settings.customThemes.length)) === 3);
await topPage().locator('.theme-pick', { hasText: '玫瑰' }).first().click(); await page.waitForTimeout(200);
await page.screenshot({ path: SHOTS + 'prefs-05-theme-custom.png' });
// 深色模式下的强调色（纸墨灰自动提亮）
await topPage().locator('.theme-row[data-theme-id="ink"]').click();
await topPage().getByRole('button', { name: '颜色模式' }).click(); await page.waitForTimeout(250);
await page.locator('.sheet .seg button', { hasText: '深色' }).click(); await page.waitForTimeout(200);
await page.locator('.sheet').last().getByRole('button', { name: '关闭' }).click(); await page.waitForTimeout(250);
ok('深色 + 纸墨灰：强调色自动提亮', (await page.getAttribute('html', 'data-theme')) === 'dark' && (await cssVar('--accent')) !== '#111111', await cssVar('--accent'));
await page.screenshot({ path: SHOTS + 'prefs-06-theme-dark.png' });
await topPage().getByRole('button', { name: '颜色模式' }).click(); await page.waitForTimeout(250);
await page.locator('.sheet .seg button', { hasText: '浅色' }).click();
await page.locator('.sheet').last().getByRole('button', { name: '关闭' }).click(); await page.waitForTimeout(200);
await topPage().locator('.theme-pick', { hasText: '玫瑰' }).first().click(); await page.waitForTimeout(200);

// ---- 聊天项显示
await openSub('聊天项显示');
for (const [k, v] of [['showUserName', true], ['showUserTime', true], ['showUserAvatar', true], ['showModelTime', true], ['showProvider', true], ['showTokenStats', true], ['showTitleAvatar', true]]) await toggle(k, v);
ok('工具卡片 / 文件卡片 即将推出（禁用）', (await topPage().locator('.set-row.soon input:disabled').count()) === 2);
await page.screenshot({ path: SHOTS + 'prefs-07-display.png' });
await closePages();
await page.locator('#btn-new').click();
await send('你好');
ok('用户名称 + 时间戳 + 头像', (await lastUser().locator('.user-head').innerText()).includes('艾瑞') && (await lastUser().locator('.msg-time').count()) === 1 && (await lastUser().locator('.user-av').count()) === 1);
ok('模型名 + 供应商 + 模型时间戳', (await lastAsst().locator('.msg-head').innerText()).includes('fake-gpt | 本地测试') && (await lastAsst().locator('.msg-head .msg-time').count()) === 1);
const stats = await lastAsst().locator('.msg-stats').innerText();
ok('Token 统计（来自 API usage，非估算）', stats.includes('输入 42') && stats.includes('输出 17') && !stats.includes('估算'), stats);
ok('标题栏助手头像', await page.locator('#title-avatar .title-av').isVisible());
await openSub('聊天项显示'); await toggle('showUserActions', false); await toggle('showModelName', false); await closePages();
ok('关闭用户操作按钮 / 模型名称', (await lastUser().locator('.msg-actions').count()) === 0 && !(await lastAsst().locator('.msg-head').innerText()).includes('fake-gpt'));
await openSub('聊天项显示'); await toggle('showUserActions', true); await toggle('showModelName', true); await closePages();
await page.locator('#tool-model').click(); await page.locator('.sheet .choice', { hasText: 'fake-reasoner' }).click(); await page.waitForTimeout(150);
await send('想一想');
ok('思考卡片显示', (await lastAsst().locator('details.reasoning').count()) === 1);
ok('自动折叠思考（完成后收起）', !(await lastAsst().locator('details.reasoning').evaluate((d) => d.open)));
await openSub('聊天项显示'); await toggle('showThinking', false); await closePages();
ok('关闭思考卡片', (await lastAsst().locator('details.reasoning').count()) === 0);
await openSub('聊天项显示'); await toggle('showThinking', true);
await openSub('行为与启动'); await toggle('autoCollapseThinking', false); await closePages();
ok('关闭自动折叠思考 → 展开', await lastAsst().locator('details.reasoning').evaluate((d) => d.open));
await page.screenshot({ path: SHOTS + 'prefs-08-chat-display.png' });
await page.locator('#tool-model').click(); await page.locator('.sheet .choice', { hasText: 'fake-gpt' }).click(); await page.waitForTimeout(150);

// ---- 渲染设置
await openSub('渲染设置');
await page.screenshot({ path: SHOTS + 'prefs-09-render.png' });
await closePages();
await page.locator('#btn-new').click();
await send('写个公式');
await page.waitForFunction(() => document.querySelectorAll('.msg.assistant .katex').length >= 2, null, { timeout: 5000 }).catch(() => {});
ok('KaTeX 行内 + 块级公式（本地加载）', (await lastAsst().locator('.katex').count()) === 2 && (await lastAsst().locator('.katex-display').count()) === 1 && await S(() => !!window.katex));
ok('普通 “5 美元” 不被当作公式', (await lastAsst().innerText()).includes('5 美元'));
await page.screenshot({ path: SHOTS + 'prefs-10-math.png' });
await openSub('渲染设置'); await toggle('dollarMath', false); await closePages();
ok('关闭 $...$ → 只剩块级公式', (await lastAsst().locator('.katex').count()) === 1 && (await lastAsst().innerText()).includes('$E=mc^2$'));
await openSub('渲染设置'); await toggle('mathRender', false); await toggle('assistantMarkdown', false); await toggle('userMarkdown', true); await closePages();
ok('关闭数学公式渲染', (await lastAsst().locator('.katex').count()) === 0);
ok('关闭助手 Markdown → 原文', (await lastAsst().locator('.plain-text').count()) === 1 && (await lastAsst().innerText()).includes('$$'));
await send('**粗体** 和 `代码`');
ok('用户消息 Markdown', (await lastUser().locator('.bubble strong').count()) === 1 && (await lastUser().locator('.bubble code').count()) === 1);
ok('助手原文模式保留 ** 符号', (await lastAsst().innerText()).includes('**假模型**'));
await openSub('渲染设置'); await toggle('mathRender', true); await toggle('dollarMath', true); await toggle('assistantMarkdown', true); await toggle('userMarkdown', false); await toggle('reasoningMarkdown', true);
await toggle('codeCollapse', true);
const num = topPage().locator('input[aria-label="超过多少行自动折叠"]'); await num.fill('5'); await num.press('Tab'); await page.waitForTimeout(200);
ok('折叠行数 = 5', (await S(() => window.__groky.S.settings.codeCollapseLines)) === 5);
await toggle('mobileCodeWrap', true);
await closePages();
await send('来段长代码');
const cw = lastAsst().locator('.code-wrap').first();
ok('超过 N 行的代码块自动折叠', await cw.evaluate((e) => e.classList.contains('collapsed')));
ok('移动端代码自动换行', (await cw.locator('pre').evaluate((e) => getComputedStyle(e).whiteSpace)) === 'pre-wrap');
await page.screenshot({ path: SHOTS + 'prefs-11-code-collapse.png' });
await cw.getByRole('button', { name: /展开/ }).click(); await page.waitForTimeout(100);
ok('展开折叠代码块', !(await cw.evaluate((e) => e.classList.contains('collapsed'))));

// ---- 行为与启动
await openSub('行为与启动');
ok('工具/分支相关即将推出（禁用）', (await topPage().locator('.set-row.soon input:disabled').count()) === 3);
await page.screenshot({ path: SHOTS + 'prefs-12-behavior.png' });
await toggle('confirmRegen', true); await toggle('regenDeleteBelow', false); await toggle('keepAwake', true); await toggle('collapseLong', true); await toggle('showListDates', false);
await row('消息导航按钮').click(); await page.locator('.sheet .choice', { hasText: '始终显示' }).click(); await page.waitForTimeout(150);
await closePages();
await page.locator('#btn-new').click();
await send('第一问'); await send('第二问');
const firstId = await page.locator('.msg.assistant').first().getAttribute('data-id');
const before = dialogs;
await page.locator('.msg.assistant').first().getByRole('button', { name: '重新生成' }).click(); await waitDone();
ok('重新生成前弹出确认', dialogs === before + 1);
const cnt = await S(() => window.__groky.S.convs.find((c) => c.id === window.__groky.S.currentId).messages.length);
ok('关闭“删除下面的消息” → 只替换该条，保留后续', cnt === 4 && (await page.locator('.msg.assistant').first().getAttribute('data-id')) !== firstId, `messages=${cnt}`);
ok('生成时申请并释放屏幕常亮', (await S(() => window.__wl.req)) >= 1 && (await S(() => window.__wl.rel)) >= 1, JSON.stringify(await S(() => window.__wl)));
await send('长消息 ' + '很长的内容。'.repeat(260));
ok('折叠过长消息', (await lastUser().locator('.long-collapsed').count()) === 1);
await lastUser().getByRole('button', { name: '展开全文' }).click(); await page.waitForTimeout(150);
ok('展开全文', (await lastUser().locator('.long-collapsed').count()) === 0);
ok('消息导航按钮（始终显示）', await page.locator('#msg-nav').isVisible());
const y0 = await page.locator('#messages').evaluate((e) => e.scrollTop);
await page.locator('#nav-up').click(); await page.waitForTimeout(600);
ok('点“上一条”向上滚动', (await page.locator('#messages').evaluate((e) => e.scrollTop)) < y0);
await page.screenshot({ path: SHOTS + 'prefs-13-behavior-chat.png' });
await page.locator('#btn-menu').click(); await page.waitForTimeout(350);
ok('关闭对话列表日期', (await page.locator('.conv-group').allTextContents()).every((g) => g === '置顶'));
await page.locator('.asst-item', { hasText: '翻译官' }).click(); await page.waitForTimeout(350);
ok('点选助手后自动关闭侧栏', !(await page.evaluate(() => document.body.classList.contains('side-open'))));
await openSub('行为与启动'); await toggle('keepDrawerOnAssistant', true); await closePages();
await page.locator('#btn-menu').click(); await page.waitForTimeout(350);
await page.locator('.asst-item', { hasText: '默认助手' }).click(); await page.waitForTimeout(350);
ok('开启“不自动关闭侧栏”', await page.evaluate(() => document.body.classList.contains('side-open')));
await page.locator('#scrim').click({ position: { x: 370, y: 400 } }); await page.waitForTimeout(300);

// ---- 自动重试
await openSub('自动重试');
await page.screenshot({ path: SHOTS + 'prefs-14-retry.png' });
await closePages();
await page.locator('#btn-new').click();
await send(`重试一下 A ${Date.now()}`);
ok('503 两次后自动重试成功', (await lastAsst().innerText()).includes('假模型') && (await lastAsst().locator('.msg-error').count()) === 0);
await openSub('自动重试'); await toggle('retryEnabled', false); await closePages();
await send(`重试一下 B ${Date.now()}`);
ok('关闭自动重试 → 直接报错 503', (await lastAsst().locator('.msg-error').innerText()).includes('503'));
await openSub('自动重试'); await toggle('retryEnabled', true);

// ---- 触觉反馈
ok('触觉反馈：发送/完成时振动', (await S(() => window.__vib.length)) > 0);

// ---- 字体 / 字号 / 背景 / 透明度 / 消息样式
await openSub('聊天字体大小');
await page.locator('.sheet input[type=range]').evaluate((e) => { e.value = 120; e.dispatchEvent(new Event('input')); e.dispatchEvent(new Event('change')); });
await page.locator('.sheet').last().getByRole('button', { name: '关闭' }).click(); await page.waitForTimeout(200);
ok('聊天字体大小 120%', (await S(() => window.__groky.S.settings.chatFontScale)) === 120 && Math.abs(parseFloat(await S(() => getComputedStyle(document.querySelector('.msg')).fontSize)) - 19.2) < 0.05);
await row('应用字体').click(); await page.waitForTimeout(250);
await page.locator('.sheet .choice', { hasText: '宋体 / 衬线' }).click(); await page.waitForTimeout(200);
ok('应用字体：衬线预设', (await S(() => getComputedStyle(document.body).fontFamily)).includes('Songti'));
await row('应用字体').click(); await page.waitForTimeout(250);
await page.locator('.sheet input[aria-label="选择字体文件"]').setInputFiles(FONT);
await page.waitForFunction(() => window.__groky.S.settings.appFont === 'local', null, { timeout: 5000 }).catch(() => {});
ok('上传本地字体（FontFace + IndexedDB）', (await S(() => [...document.fonts].some((f) => f.family.includes('GrokyAppLocal') && f.status === 'loaded'))) && (await S(() => getComputedStyle(document.body).fontFamily)).includes('GrokyAppLocal'));
await row('代码字体').click(); await page.waitForTimeout(250);
await page.locator('.sheet .choice', { hasText: 'Courier' }).click(); await page.waitForTimeout(200);
ok('代码字体：Courier', (await cssVar('--font-code')).includes('Courier'));
await row('背景图片').click(); await page.waitForTimeout(250);
await page.locator('.sheet input[aria-label="选择背景图片"]').setInputFiles(IMG); await page.waitForTimeout(500);
ok('背景图片', (await S(() => document.documentElement.classList.contains('has-bg'))) && (await cssVar('--chat-bg')).startsWith('url('));
await row('背景图片遮罩透明度').click(); await page.waitForTimeout(200);
await page.locator('.sheet input[type=range]').evaluate((e) => { e.value = 30; e.dispatchEvent(new Event('input')); e.dispatchEvent(new Event('change')); });
await page.locator('.sheet').last().getByRole('button', { name: '关闭' }).click(); await page.waitForTimeout(150);
await row('输入框背景透明度').click(); await page.waitForTimeout(200);
await page.locator('.sheet input[type=range]').evaluate((e) => { e.value = 45; e.dispatchEvent(new Event('input')); e.dispatchEvent(new Event('change')); });
await page.locator('.sheet').last().getByRole('button', { name: '关闭' }).click(); await page.waitForTimeout(150);
ok('遮罩 30% / 输入框 45%', (await cssVar('--bg-mask')) === '0.3' && (await cssVar('--composer-alpha')) === '45%');
await row('消息样式').click(); await page.locator('.sheet .choice', { hasText: '纯文本' }).click(); await page.waitForTimeout(150);
ok('消息样式：纯文本', await S(() => document.documentElement.classList.contains('msg-plain')));
await row('自动回到底部延迟').click(); await page.waitForTimeout(200);
await page.locator('.sheet input[type=range]').evaluate((e) => { e.value = 1; e.dispatchEvent(new Event('input')); e.dispatchEvent(new Event('change')); });
await page.locator('.sheet').last().getByRole('button', { name: '关闭' }).click(); await page.waitForTimeout(150);
await page.screenshot({ path: SHOTS + 'prefs-15-list-values.png' });
await closePages();
// 自动回到底部：生成中向上翻，1 秒后自动回到底部
await page.fill('#input', '慢一点说'); await page.locator('#btn-send').click(); await page.waitForTimeout(600);
await page.locator('#messages').evaluate((e) => { e.scrollTop = 0; e.dispatchEvent(new Event('scroll')); });
await page.waitForTimeout(250);
const upY = await page.locator('#messages').evaluate((e) => e.scrollTop);
await page.waitForTimeout(1500);
const back = await page.locator('#messages').evaluate((e) => e.scrollHeight - e.scrollTop - e.clientHeight < 130);
ok('自动回到底部延迟 1s', upY < 50 && back, `upY=${upY}`);
await waitDone();
await page.screenshot({ path: SHOTS + 'prefs-16-bg-plain.png' });

// ---- 助手设置
await closePages();
await page.locator('#btn-menu').click(); await page.waitForTimeout(300);
await page.locator('#btn-settings').click(); await page.waitForTimeout(300);
await page.locator('#settings-body .set-row', { hasText: '助手' }).click(); await page.waitForTimeout(400);
ok('助手设置卡片', (await topPage().locator('.asst-card').count()) === (await S(() => window.__groky.S.personas.length)));
ok('卡片不超出屏幕宽度', (await topPage().locator('.asst-card').first().evaluate((e) => e.getBoundingClientRect().right)) <= 390);
await topPage().getByRole('button', { name: '新建助手' }).click(); await page.waitForTimeout(300);
const ps = page.locator('.sheet').last();
await ps.getByLabel('头像 Emoji').fill('🌙');
await ps.getByPlaceholder('助手名称').fill('月亮');
await ps.locator('textarea').fill('你是温柔的月亮。');
await ps.locator('select').first().selectOption({ label: 'fake-reasoner' });
await ps.getByRole('button', { name: '保存', exact: true }).click(); await page.waitForTimeout(300);
ok('新建助手出现在卡片列表', (await topPage().locator('.asst-card', { hasText: '月亮' }).innerText()).includes('你是温柔的月亮'));
await page.screenshot({ path: SHOTS + 'prefs-17-assistants.png' });
await closePages();
await page.locator('#tool-persona').click(); await page.locator('.sheet .choice', { hasText: '月亮' }).click(); await page.waitForTimeout(200);
await page.locator('#btn-new').click(); await page.waitForTimeout(200);
ok('助手默认模型用于新对话', (await page.textContent('#conv-model')).includes('fake-reasoner'), await page.textContent('#conv-model'));

// ---- 持久化
await page.reload(); await page.waitForSelector('#topbar'); await page.waitForTimeout(600);
const persisted = await S(() => { const s = window.__groky.S.settings; return s.showTokenStats && s.codeCollapseLines === 5 && s.msgStyle === 'plain' && s.customThemes.length === 3 && s.appFont === 'local' && s.bgImage; });
ok('刷新后设置仍在（IndexedDB）', persisted);
ok('刷新后本地字体与背景重新加载', (await S(() => [...document.fonts].some((f) => f.family.includes('GrokyAppLocal')))) && (await S(() => document.documentElement.classList.contains('has-bg'))));
ok('无页面错误', !errs.length, errs.join(' | '));
await browser.close();
console.log(fails ? `FAILED ${fails}` : 'ALL PASS'); process.exit(fails ? 1 : 0);
