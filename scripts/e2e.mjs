// 端到端测试：iPhone 视口 390x844，配合 fake-sse-server（8788）与静态服务器（8787）
import { chromium, devices } from 'playwright';
import fs from 'node:fs';
const APP = process.env.APP_URL || 'http://localhost:8787/';
const FAKE = 'http://localhost:8788/v1';
const SHOTS = new URL('../screenshots/', import.meta.url).pathname;
const results = [];
const ok = (name, cond, extra = '') => { results.push([cond ? 'PASS' : 'FAIL', name, extra]); console.log(cond ? '✅' : '❌', name, extra); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, locale: 'zh-CN', colorScheme: 'light', acceptDownloads: true });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('dialog', (d) => d.accept());

const lastAsst = () => page.locator('.msg.assistant').last();
const waitDone = async () => { await page.waitForTimeout(300); await page.waitForFunction(() => !window.__groky.S.streaming, null, { timeout: 20000 }); await page.waitForTimeout(150); };
const sheetBtn = (text) => page.locator('.sheet').last().getByRole('button', { name: text, exact: true });

await page.goto(APP);
await page.waitForSelector('.empty');
const vp = page.viewportSize();
ok('页面加载 & 视口', vp.width === 390 && vp.height === 844, `${vp.width}x${vp.height}`);
ok('manifest / apple meta', await page.evaluate(() => !!document.querySelector('link[rel=manifest]') && document.querySelector('meta[name=apple-mobile-web-app-capable]')?.content === 'yes' && !!document.querySelector('link[rel=apple-touch-icon]')));
const mf = await (await page.request.get(APP + 'manifest.json')).json();
ok('manifest name', mf.name === 'groky chat' && mf.icons.length >= 3, mf.name);
ok('第三方库本地加载', await page.evaluate(() => !!(window.marked && window.DOMPurify && window.hljs)));
await page.screenshot({ path: SHOTS + '01-welcome.png' });

// ---- 添加 OpenAI 兼容服务（指向本地假服务器）
await page.getByRole('button', { name: '＋ 添加模型服务' }).click();
await page.locator('.preset-grid button', { hasText: '自定义' }).click();
const s = page.locator('.sheet').last();
await s.getByPlaceholder('例如：我的 Grok').fill('本地测试服务');
await s.locator('input[type=url]').fill(FAKE);
await s.locator('input[type=password]').fill('sk-test-123');
await s.getByRole('button', { name: '从接口获取' }).click();
await page.waitForSelector('.sheet h2:text("选择模型")');
const picker = page.locator('.sheet').last();
await picker.locator('label.list-item', { hasText: 'fake-gpt' }).locator('input').check();
await picker.locator('label.list-item', { hasText: 'fake-reasoner' }).locator('input').check();
await sheetBtn('确定').click();
await page.waitForTimeout(200);
await page.screenshot({ path: SHOTS + '02-add-provider.png' });
await sheetBtn('保存').click();
await page.waitForTimeout(200);
ok('服务已保存', await page.evaluate(() => window.__groky.S.providers.length === 1 && window.__groky.S.providers[0].models.join() === 'fake-gpt,fake-reasoner'));
await page.locator('.sheet').last().getByRole('button', { name: '关闭' }).click();

// ---- 新建对话并发送（流式）
await page.locator('#btn-new').click();
await page.fill('#input', '你好，请写一段代码');
await page.locator('#btn-send').click();
await page.waitForSelector('#btn-send.stop', { timeout: 3000 });
ok('生成中显示停止按钮', true);
await waitDone();
const txt = await lastAsst().innerText();
ok('OpenAI 流式解析 + Markdown', txt.includes('假模型') && (await lastAsst().locator('.code-wrap pre code.hljs').count()) === 1 && (await lastAsst().locator('table').count()) === 1, txt.slice(0, 30).replace(/\n/g, ' '));
ok('系统提示(默认角色)已发送', txt.includes('system:'));
ok('标题自动生成', (await page.textContent('#conv-title')).includes('你好'));
await page.screenshot({ path: SHOTS + '03-chat-streamed.png' });

// ---- 重新生成
await lastAsst().getByRole('button', { name: '重新生成' }).click();
await waitDone();
ok('重新生成', await page.evaluate(() => { const c = window.__groky.S.convs[0]; return c.messages.length === 2 && c.messages[1].content.includes('假模型'); }));

// ---- 编辑并重发
await page.locator('.msg.user').last().getByRole('button', { name: '编辑并重发' }).click();
await page.locator('.edit-box textarea').fill('编辑后的问题');
await page.getByRole('button', { name: '保存并发送' }).click();
await waitDone();
ok('编辑并重发', await page.evaluate(() => { const c = window.__groky.S.convs[0]; return c.messages.length === 2 && c.messages[0].content === '编辑后的问题' && c.messages[1].content.length > 10; }));

// ---- 停止生成
await page.fill('#input', '慢一点回答');
await page.locator('#btn-send').click();
await page.waitForTimeout(700);
await page.locator('#btn-send.stop').click();
await waitDone();
ok('停止生成', (await lastAsst().innerText()).includes('已停止生成'));

// ---- 推理模型（reasoning_content）
await page.locator('#btn-conv-settings').click();
await page.locator('.sheet select').first().selectOption({ label: 'fake-reasoner' });
await sheetBtn('保存').click();
await page.fill('#input', '思考题');
await page.locator('#btn-send').click();
await waitDone();
ok('思考过程显示', (await lastAsst().locator('details.reasoning').count()) === 1 && (await lastAsst().locator('.r-body').textContent()).includes('先想一想'), await lastAsst().locator('details.reasoning summary').textContent());

// ---- Anthropic 原生（新对话 + 切换模型 + 角色 + 温度）
await page.locator('#btn-menu').click();
await page.getByRole('button', { name: '模型服务' }).click();
await page.locator('.preset-grid button', { hasText: 'Anthropic' }).click();
const s2 = page.locator('.sheet').last();
await s2.locator('input[type=url]').fill(FAKE);
await s2.locator('input[type=password]').fill('sk-ant-test');
await s2.getByPlaceholder('输入模型名，如 grok-4').fill('fake-claude');
await s2.getByRole('button', { name: '添加', exact: true }).click();
await sheetBtn('保存').click();
await page.locator('.sheet').last().getByRole('button', { name: '关闭' }).click();
await page.locator('#btn-new').click();
await page.locator('#btn-conv-settings').click();
await page.locator('.sheet select').nth(0).selectOption({ label: 'fake-claude' });
await page.locator('.sheet select').nth(1).selectOption({ label: '💻 编程搭档' });
await page.locator('.sheet .switch').first().check();
await sheetBtn('保存').click();
await page.waitForTimeout(200);
ok('顶部显示角色+模型', (await page.textContent('#conv-model')).includes('💻 fake-claude'), await page.textContent('#conv-model'));
await page.fill('#input', '用 Claude 格式回复');
await page.locator('#btn-send').click();
await waitDone();
const at = await lastAsst().innerText();
ok('Anthropic SSE 解析（含必要请求头）', at.includes('Anthropic 格式') && at.includes('system=有') && at.includes('假模型'), at.slice(0, 40).replace(/\n/g, ' '));

// ---- 新建角色
await page.locator('#btn-menu').click();
await page.getByRole('button', { name: '角色 / 人设' }).click();
await page.getByRole('button', { name: '＋ 新建角色' }).click();
await page.getByPlaceholder('角色名称').fill('猫娘');
await page.locator('.sheet').last().locator('textarea').fill('你是一只可爱的猫娘，句尾带“喵”。');
await sheetBtn('保存').click();
ok('新建角色', await page.evaluate(() => window.__groky.S.personas.some((p) => p.name === '猫娘')));
await page.locator('.sheet').last().getByRole('button', { name: '关闭' }).click();

// ---- 重命名（侧栏 ⋯）
await page.locator('#btn-menu').click();
await page.locator('.conv-item').first().locator('.ci-more').click();
await sheetBtn('重命名').click();
await page.locator('.sheet').last().locator('input').fill('Claude 测试对话');
await sheetBtn('确定').click();
await page.waitForTimeout(150);
ok('重命名', (await page.locator('.conv-item').first().innerText()).includes('Claude 测试对话'));

// ---- 深色主题 + 侧栏截图
await page.locator('.side-link', { hasText: '设置' }).click();
await page.locator('.seg button', { hasText: '深色' }).click();
ok('深色主题', (await page.getAttribute('html', 'data-theme')) === 'dark');

// ---- 导出
const [dl] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: '导出 JSON' }).click()]);
const exportPath = SHOTS + '../test-export.json';
await dl.saveAs(exportPath);
const exp = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
ok('导出 JSON', exp.app === 'groky-chat' && exp.conversations.length === 2 && exp.providers.length === 2, `${exp.conversations.length} 对话 / ${exp.providers.length} 服务`);
await page.locator('.sheet').last().getByRole('button', { name: '关闭' }).click();
await page.locator('#btn-menu').click();
await page.waitForTimeout(350);
await page.screenshot({ path: SHOTS + '04-sidebar-dark.png' });
await page.locator('#scrim').click({ position: { x: 370, y: 400 } });
await page.waitForTimeout(350);
await page.screenshot({ path: SHOTS + '05-chat-dark.png' });

// ---- 持久化（刷新）
await page.reload();
await page.waitForSelector('.msg');
ok('刷新后数据仍在 (IndexedDB)', await page.evaluate(() => window.__groky.S.convs.length === 2 && window.__groky.S.providers.length === 2));

// ---- 删除对话 + 导入恢复
await page.locator('#btn-menu').click();
await page.locator('.conv-item').first().locator('.ci-more').click();
await sheetBtn('删除对话').click();
await page.waitForTimeout(200);
ok('删除对话', await page.evaluate(() => window.__groky.S.convs.length === 1));
await page.locator('.side-link', { hasText: '设置' }).click();
await page.locator('.sheet input[type=file]').setInputFiles(exportPath);
await page.waitForFunction(() => window.__groky.S.convs.length === 2, null, { timeout: 5000 }).catch(() => {});
ok('导入 JSON 恢复', await page.evaluate(() => window.__groky.S.convs.length === 2));

// ---- Service Worker 离线外壳
const swOk = await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return !!r.active; });
ok('Service Worker 已激活', swOk);
await page.reload(); await page.waitForTimeout(500);
await ctx.setOffline(true);
await page.reload();
await page.waitForSelector('#topbar', { timeout: 5000 }).catch(() => {});
ok('离线可打开应用外壳', (await page.locator('#topbar').count()) === 1 && await page.evaluate(() => !!window.marked));
await ctx.setOffline(false);

// ---- 网络错误提示（CORS/不可达）
await page.evaluate(async () => {
  const S = window.__groky.S;
  S.providers[0].baseUrl = 'http://localhost:9/v1';
});
await page.locator('#btn-new').click();
await page.locator('#btn-conv-settings').click();
await page.locator('.sheet select').first().selectOption({ label: 'fake-gpt' });
await sheetBtn('保存').click();
await page.fill('#input', '测试错误');
await page.locator('#btn-send').click();
await waitDone();
ok('网络错误友好提示', (await lastAsst().locator('.msg-error').innerText()).includes('CORS'));

ok('无 JS 运行错误', errors.filter((e) => !/ERR_CONNECTION_REFUSED|Failed to load resource|ERR_INTERNET_DISCONNECTED/.test(e)).length === 0, errors.join(' | ').slice(0, 300));
await browser.close();
const failed = results.filter((r) => r[0] === 'FAIL').length;
console.log(`\n${results.length - failed}/${results.length} 通过`);
process.exit(failed ? 1 : 0);
