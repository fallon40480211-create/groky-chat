/* groky chat —— 纯前端 AI 聊天客户端。所有数据（含 API Key）只保存在本机 IndexedDB。 */
const APP_VERSION = '1.1.0';

/* ================= 小工具 ================= */
const $ = (s, r = document) => r.querySelector(s);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const clone = (o) => JSON.parse(JSON.stringify(o));

const L = (d, sw = 1.7) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${d}</svg>`;
const ICONS = {
  menu: L('<path d="M4 8h14M4 15h9"/>', 2),
  plus: L('<path d="M12 5v14M5 12h14"/>'),
  edit: L('<path d="M16.9 3.6a2 2 0 0 1 2.9 2.9L8 18.3 4 19.5l1.2-4Z"/><path d="m14.5 6 3.5 3.5"/>'),
  pencil: L('<path d="M16.9 3.6a2 2 0 0 1 2.9 2.9L8 18.3 4 19.5l1.2-4Z"/><path d="m14.5 6 3.5 3.5"/>', 1.5),
  send: L('<path d="M12 19V5M6 11l6-6 6 6"/>', 2.1),
  stop: '<svg viewBox="0 0 24 24" fill="currentColor"><rect x="7" y="7" width="10" height="10" rx="2"/></svg>',
  chatplus: L('<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.3A8.5 8.5 0 1 1 21 12Z"/><path d="M12 8.5v7M8.5 12h7"/>'),
  tune: L('<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>'),
  spark: L('<path d="M12 3v18M3 12h18M5.6 5.6l12.8 12.8M18.4 5.6 5.6 18.4"/>', 1.9),
  bulb: L('<path d="M9 18h6M10 21h4"/><path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2V16h5v-.2c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3Z"/>'),
  layers: L('<path d="m12 3 9 5-9 5-9-5Z"/><path d="m3 13 9 5 9-5"/>'),
  mic: L('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/>'),
  bot: L('<rect x="4" y="8" width="16" height="11" rx="3"/><path d="M12 4v4M9 13h.01M15 13h.01M2 13v2M22 13v2"/>'),
  history: L('<path d="M3 12a9 9 0 1 0 2.6-6.4L3 8"/><path d="M3 3v5h5M12 7.5V12l3 2"/>'),
  chevdown: L('<path d="m6 9 6 6 6-6"/>'),
  chevup: L('<path d="m6 15 6-6 6 6"/>'),
  chevright: L('<path d="m9 6 6 6-6 6"/>', 1.8),
  arrowleft: L('<path d="M19 12H5M11 6l-6 6 6 6"/>', 1.9),
  gear: L('<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z"/>'),
  palette: L('<path d="M12 3v2M5.6 5.6 7 7M3 12h2M12 8a4 4 0 0 0 0 8"/><path d="M12 8a4 4 0 0 1 4 4 4 4 0 0 1-4 4"/><path d="M18.4 5.6 17 7M21 12h-2M17 17l1.4 1.4M12 19v2" stroke-dasharray="1 2.4"/>'),
  monitor: L('<rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/>'),
  heart: L('<path d="M20.8 5.6a5 5 0 0 0-7.1 0L12 7.3l-1.7-1.7a5 5 0 0 0-7.1 7.1L12 21.5l8.8-8.8a5 5 0 0 0 0-7.1Z"/>'),
  boxes: L('<path d="m12 3 4 2.2v4.6L12 12 8 9.8V5.2Z"/><path d="m8 12 4 2.2v4.6L8 21l-4-2.2v-4.6Z"/><path d="m16 12 4 2.2v4.6L16 21l-4-2.2"/>'),
  globe: L('<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/>'),
  terminal: L('<path d="m4 7 5 5-5 5M12 19h8"/>'),
  brain: L('<path d="M9 4a3 3 0 0 0-3 3 3 3 0 0 0-2 5 3 3 0 0 0 2 5 3 3 0 0 0 6 1V5a2 2 0 0 0-3-1Z"/><path d="M15 4a3 3 0 0 1 3 3 3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 1"/>'),
  zap: L('<path d="M13 2 4 14h7l-1 8 9-12h-7Z"/>'),
  database: L('<ellipse cx="12" cy="5.5" rx="8" ry="3"/><path d="M4 5.5v13c0 1.7 3.6 3 8 3s8-1.3 8-3v-13M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/>'),
  drive: L('<path d="M22 13H2M5.5 5.5 2 13v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5l-3.5-7.5A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.5Z"/><path d="M6 17h.01M10 17h.01"/>'),
  info: L('<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>'),
  chart: L('<path d="M4 4v16h16"/><path d="M8 16v-4M12 16V8M16 16v-6"/>'),
  book: L('<path d="M3 5a2 2 0 0 1 2-2h5a2 2 0 0 1 2 2v16a2 2 0 0 0-2-2H3ZM21 5a2 2 0 0 0-2-2h-5a2 2 0 0 0-2 2v16a2 2 0 0 1 2-2h7Z"/>'),
  pin: L('<path d="M12 17v5M9 3h6l-1 6 3 3v2H7v-2l3-3Z"/>'),
  copy: L('<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>'),
  redo: L('<path d="M21 12a9 9 0 1 1-2.6-6.4L21 8"/><path d="M21 3v5h-5"/>'),
  trash: L('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
  more: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/></svg>',
  close: L('<path d="M6 6l12 12M18 6 6 18"/>', 1.9),
  back: L('<path d="M19 12H5M11 6l-6 6 6 6"/>', 1.9),
  check: L('<path d="M5 12l5 5L20 7"/>', 2.2),
};
function icon(name) { const s = document.createElement('span'); s.dataset.icon = name; s.innerHTML = ICONS[name] || ''; return s; }
function fillIcons(root = document) { root.querySelectorAll('[data-icon]').forEach((el) => { if (!el.firstChild) el.innerHTML = ICONS[el.dataset.icon] || ''; }); }

/** 轻量 DOM 构造器 */
function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else if (k.startsWith('on') && typeof v === 'function') el.addEventListener(k.slice(2), v);
    else if (k === 'html') el.innerHTML = v;
    else if (k in el && typeof v !== 'string') el[k] = v;
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c == null || c === false) continue;
    el.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return el;
}

let toastTimer;
function toast(msg, ms = 2000) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove('show'), ms);
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); }
  catch {
    const ta = h('textarea', { style: { position: 'fixed', opacity: '0' } }); ta.value = text;
    document.body.append(ta); ta.select(); document.execCommand('copy'); ta.remove();
  }
  toast('已复制');
}

function fmtTime(ts) {
  const d = new Date(ts), now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  if (d.toDateString() === now.toDateString()) return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  if (d.getFullYear() === now.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日`;
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}

/* ================= IndexedDB ================= */
const DB_NAME = 'groky-chat', DB_VER = 1, STORES = ['providers', 'personas', 'conversations'];
let dbPromise;
function openDB() {
  return dbPromise ||= new Promise((res, rej) => {
    const r = indexedDB.open(DB_NAME, DB_VER);
    r.onupgradeneeded = () => {
      const d = r.result;
      for (const s of STORES) if (!d.objectStoreNames.contains(s)) d.createObjectStore(s, { keyPath: 'id' });
      if (!d.objectStoreNames.contains('kv')) d.createObjectStore('kv');
    };
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
function tx(store, mode, fn) {
  return openDB().then((d) => new Promise((res, rej) => {
    const t = d.transaction(store, mode);
    const req = fn(t.objectStore(store));
    t.oncomplete = () => res(req && 'result' in req ? req.result : undefined);
    t.onerror = () => rej(t.error); t.onabort = () => rej(t.error);
  }));
}
const idb = {
  all: (s) => tx(s, 'readonly', (st) => st.getAll()),
  get: (s, k) => tx(s, 'readonly', (st) => st.get(k)),
  put: (s, v, k) => tx(s, 'readwrite', (st) => (k === undefined ? st.put(clone(v)) : st.put(clone(v), k))),
  del: (s, k) => tx(s, 'readwrite', (st) => st.delete(k)),
  clear: (s) => tx(s, 'readwrite', (st) => st.clear()),
};

/* ================= 状态 ================= */
const DEFAULT_SETTINGS = { theme: 'auto', enterSend: false, defaultModel: null, defaultPersonaId: null, maxContext: 0, userName: '', currentAssistantId: null, asstOpen: true };
const S = {
  providers: [], personas: [], convs: [], settings: { ...DEFAULT_SETTINGS },
  currentId: null, streaming: null, search: '', editingMsgId: null, scopeAll: false,
};
const saveSettings = () => idb.put('kv', S.settings, 'settings');
const saveProvider = (p) => idb.put('providers', p);
const savePersona = (p) => idb.put('personas', p);
const saveConv = (c) => idb.put('conversations', c);
const currentConv = () => S.convs.find((c) => c.id === S.currentId) || null;

const SEED_PERSONAS = [
  { id: 'p-default', name: '默认助手', emoji: '✨', prompt: '你是一个友好、可靠的 AI 助手。请默认使用简体中文回答，表达清晰、有条理，必要时使用 Markdown。', temperature: null },
  { id: 'p-translator', name: '翻译官', emoji: '🌐', prompt: '你是专业的中英互译助手。用户输入中文就翻译成自然地道的英文，输入其他语言就翻译成简体中文。只输出译文，不要解释。', temperature: 0.3 },
  { id: 'p-coder', name: '编程搭档', emoji: '💻', prompt: '你是一名资深软件工程师。回答要准确、简洁，代码使用带语言标注的 Markdown 代码块，并简要说明关键思路。', temperature: 0.2 },
];

const PRESETS = [
  { name: 'OpenAI', type: 'openai', baseUrl: 'https://api.openai.com/v1', models: ['gpt-4o-mini', 'gpt-4o'], note: '官方接口' },
  { name: 'xAI Grok', type: 'openai', baseUrl: 'https://api.x.ai/v1', models: ['grok-4', 'grok-3-mini'], note: 'OpenAI 兼容' },
  { name: 'DeepSeek', type: 'openai', baseUrl: 'https://api.deepseek.com/v1', models: ['deepseek-chat', 'deepseek-reasoner'], note: 'OpenAI 兼容' },
  { name: 'OpenRouter', type: 'openai', baseUrl: 'https://openrouter.ai/api/v1', models: ['openai/gpt-4o-mini', 'anthropic/claude-sonnet-4'], note: '聚合多家模型' },
  { name: '硅基流动', type: 'openai', baseUrl: 'https://api.siliconflow.cn/v1', models: ['deepseek-ai/DeepSeek-V3'], note: 'OpenAI 兼容' },
  { name: '通义千问', type: 'openai', baseUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1', models: ['qwen-plus', 'qwen-max'], note: '阿里云百炼' },
  { name: 'Anthropic', type: 'anthropic', baseUrl: 'https://api.anthropic.com/v1', models: ['claude-sonnet-4-5', 'claude-3-5-haiku-latest'], note: '原生 Messages 接口' },
  { name: '自定义', type: 'openai', baseUrl: '', models: [], note: '任意 OpenAI 兼容地址' },
];

/* ================= SSE 与模型接口 ================= */
function parseSSEBlock(raw) {
  let event = 'message'; const data = [];
  for (const line of raw.split(/\r?\n|\r/)) {
    if (!line || line.startsWith(':')) continue;
    const i = line.indexOf(':');
    const field = i === -1 ? line : line.slice(0, i);
    let val = i === -1 ? '' : line.slice(i + 1);
    if (val.startsWith(' ')) val = val.slice(1);
    if (field === 'event') event = val;
    else if (field === 'data') data.push(val);
  }
  return data.length ? { event, data: data.join('\n') } : null;
}

/** 把 fetch Response 的流解析为 SSE 事件（异步迭代器） */
async function* sseEvents(response) {
  const reader = response.body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  const SEP = /\r\n\r\n|\n\n|\r\r/;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      let m;
      while ((m = SEP.exec(buf))) {
        const raw = buf.slice(0, m.index);
        buf = buf.slice(m.index + m[0].length);
        const ev = parseSSEBlock(raw);
        if (ev) yield ev;
      }
    }
    buf += dec.decode();
    if (buf.trim()) { const ev = parseSSEBlock(buf); if (ev) yield ev; }
  } finally {
    try { reader.releaseLock(); } catch { /* ignore */ }
  }
}

function apiBase(p) {
  let b = (p.baseUrl || (p.type === 'anthropic' ? 'https://api.anthropic.com/v1' : '')).trim().replace(/\/+$/, '');
  b = b.replace(/\/(chat\/completions|messages)$/, '');
  return b;
}
function authHeaders(p) {
  if (p.type === 'anthropic') {
    return {
      'x-api-key': p.apiKey || '',
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    };
  }
  const hd = {};
  if (p.apiKey) hd.Authorization = `Bearer ${p.apiKey}`;
  if (/openrouter\.ai/.test(p.baseUrl || '')) { hd['HTTP-Referer'] = location.origin; hd['X-Title'] = 'groky chat'; }
  return hd;
}
async function readError(res) {
  let t = '';
  try { t = await res.text(); } catch { /* ignore */ }
  let msg = t;
  try { const j = JSON.parse(t); msg = j.error?.message || j.message || j.error || t; if (typeof msg !== 'string') msg = JSON.stringify(msg); } catch { /* not json */ }
  return new Error(`HTTP ${res.status}${res.statusText ? ' ' + res.statusText : ''}${msg ? '：' + String(msg).slice(0, 600) : ''}`);
}

/** 合并连续同角色消息、去掉空消息（Anthropic 要求严格交替） */
function normalizeHistory(msgs) {
  const out = [];
  for (const m of msgs) {
    if (!m.content || !m.content.trim()) continue;
    const last = out[out.length - 1];
    if (last && last.role === m.role) last.content += '\n\n' + m.content;
    else out.push({ role: m.role, content: m.content });
  }
  while (out.length && out[0].role !== 'user') out.shift();
  return out;
}

/**
 * 统一的流式聊天调用。onDelta({text?, reasoning?})
 */
const THINK_BUDGET = { low: 1024, medium: 4096, high: 12000 };
async function streamChat({ provider, model, system, messages, temperature, think, signal, onDelta }) {
  const base = apiBase(provider);
  if (!base) throw new Error('该服务未配置 Base URL');
  const history = normalizeHistory(messages);

  if (provider.type === 'anthropic') {
    const body = { model, max_tokens: Number(provider.maxTokens) || 4096, messages: history, stream: true };
    if (system) body.system = system;
    if (temperature != null) body.temperature = Math.min(1, Math.max(0, temperature));
    if (think && THINK_BUDGET[think]) { // 扩展思考：需 max_tokens > budget，且不能自定义温度
      body.thinking = { type: 'enabled', budget_tokens: THINK_BUDGET[think] };
      body.max_tokens = Math.max(body.max_tokens, THINK_BUDGET[think] + 2048);
      delete body.temperature;
    }
    const res = await fetch(base + '/messages', {
      method: 'POST', signal,
      headers: { 'content-type': 'application/json', ...authHeaders(provider) },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw await readError(res);
    for await (const ev of sseEvents(res)) {
      let j; try { j = JSON.parse(ev.data); } catch { continue; }
      const type = j.type || ev.event;
      if (type === 'content_block_delta') {
        const d = j.delta || {};
        if (d.type === 'text_delta' && d.text) onDelta({ text: d.text });
        else if (d.type === 'thinking_delta' && d.thinking) onDelta({ reasoning: d.thinking });
      } else if (type === 'error') {
        throw new Error(j.error?.message || '服务返回错误');
      } else if (type === 'message_stop') break;
    }
    return;
  }

  // OpenAI 兼容
  const msgs = [];
  if (system) msgs.push({ role: 'system', content: system });
  msgs.push(...history);
  const body = { model, messages: msgs, stream: true };
  if (temperature != null) body.temperature = temperature;
  if (think) body.reasoning_effort = think; // OpenAI 兼容推理强度（仅推理模型支持）
  const res = await fetch(base + '/chat/completions', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', ...authHeaders(provider) },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw await readError(res);
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) { // 某些服务忽略 stream 参数
    const j = await res.json();
    if (j.error) throw new Error(j.error.message || JSON.stringify(j.error));
    const m = j.choices?.[0]?.message || {};
    if (m.reasoning_content) onDelta({ reasoning: m.reasoning_content });
    onDelta({ text: m.content || '' });
    return;
  }
  for await (const ev of sseEvents(res)) {
    if (ev.data === '[DONE]') break;
    let j; try { j = JSON.parse(ev.data); } catch { continue; }
    if (j.error) throw new Error(j.error.message || JSON.stringify(j.error));
    const d = j.choices?.[0]?.delta;
    if (!d) continue;
    const r = d.reasoning_content || d.reasoning;
    if (r) onDelta({ reasoning: r });
    if (d.content) onDelta({ text: d.content });
  }
}

async function fetchModels(provider) {
  const base = apiBase(provider);
  if (!base) throw new Error('请先填写 Base URL');
  const res = await fetch(base + '/models', { headers: authHeaders(provider) });
  if (!res.ok) throw await readError(res);
  const j = await res.json();
  const list = (j.data || j.models || []).map((m) => (typeof m === 'string' ? m : m.id || m.name)).filter(Boolean);
  return [...new Set(list)].sort();
}

function friendlyError(e) {
  const m = String(e?.message || e);
  if (e instanceof TypeError || /Failed to fetch|Load failed|NetworkError|Network request failed/i.test(m)) {
    return `网络请求失败：${m}\n可能原因：该服务不允许浏览器直接跨域调用（CORS）、网络不通、或 Base URL 填写错误。可换用支持直连的服务（如 OpenRouter / Anthropic / xAI），或自建反向代理。`;
  }
  return m;
}

// 供测试使用
window.__groky = { sseEvents, parseSSEBlock, streamChat, normalizeHistory, S };

/* ================= 模型/角色解析 ================= */
function allModels() {
  const out = [];
  for (const p of S.providers) for (const m of p.models || []) out.push({ providerId: p.id, model: m, provider: p });
  return out;
}
function resolveTarget(c) {
  const sel = c?.target || S.settings.defaultModel;
  if (sel) {
    const p = S.providers.find((x) => x.id === sel.providerId);
    if (p && (p.models || []).includes(sel.model)) return { provider: p, model: sel.model };
    if (p && sel.model) return { provider: p, model: sel.model };
  }
  const first = allModels()[0];
  return first ? { provider: first.provider, model: first.model } : null;
}
function personaOf(c) { return S.personas.find((p) => p.id === c?.personaId) || null; }
function systemPromptOf(c) {
  if (c?.systemPrompt && c.systemPrompt.trim()) return c.systemPrompt.trim();
  return personaOf(c)?.prompt?.trim() || '';
}
function temperatureOf(c) {
  if (c?.temperature != null) return c.temperature;
  const p = personaOf(c);
  return p?.temperature != null ? p.temperature : null;
}

/* ================= 主题 ================= */
const mqDark = matchMedia('(prefers-color-scheme: dark)');
function applyTheme() {
  const t = S.settings.theme === 'auto' ? (mqDark.matches ? 'dark' : 'light') : S.settings.theme;
  document.documentElement.dataset.theme = t;
  $('#hl-light').disabled = t === 'dark';
  $('#hl-dark').disabled = t !== 'dark';
  const color = t === 'dark' ? '#151515' : '#fcfcfb';
  document.querySelectorAll('meta[name=theme-color]').forEach((m) => m.setAttribute('content', color));
}
mqDark.addEventListener?.('change', applyTheme);

/* ================= Markdown ================= */
function renderMd(text) {
  const html = window.marked ? marked.parse(text || '', { gfm: true, breaks: true }) : (text || '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  return window.DOMPurify ? DOMPurify.sanitize(html) : html;
}
function enhanceMd(el) {
  el.querySelectorAll('pre > code').forEach((code) => {
    const pre = code.parentElement;
    if (pre.parentElement?.classList.contains('code-wrap')) return;
    const lang = (code.className.match(/language-([\w+#-]+)/) || [])[1] || '';
    try { if (window.hljs) hljs.highlightElement(code); } catch { /* ignore */ }
    const wrap = h('div', { class: 'code-wrap' });
    const btn = h('button', { onclick: () => copyText(code.innerText) }, '复制');
    pre.replaceWith(wrap);
    wrap.append(h('div', { class: 'code-head' }, h('span', {}, lang || 'code'), btn), pre);
  });
  el.querySelectorAll('a[href]').forEach((a) => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
}

/* ================= 渲染：侧边栏 ================= */
const pad2 = (n) => String(n).padStart(2, '0');
function currentAssistant() {
  const id = S.settings.currentAssistantId ?? S.settings.defaultPersonaId;
  return S.personas.find((p) => p.id === id) || S.personas[0] || null;
}
function avatarEl(p, cls = 'asst-avatar') {
  const e = (p?.emoji || '').trim();
  return h('span', { class: cls }, e || (p?.name || '?').slice(0, 1).toLowerCase());
}
function dayLabel(ts) {
  const d = new Date(ts); d.setHours(0, 0, 0, 0);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const diff = Math.round((today - d) / 864e5);
  if (diff === 0) return '今天';
  if (diff === 1) return '昨天';
  if (d.getFullYear() === today.getFullYear()) return `${d.getMonth() + 1}月${d.getDate()}日`;
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

function renderAssistants() {
  const box = $('#assistants'); if (!box) return;
  box.innerHTML = '';
  const cur = currentAssistant();
  const open = S.settings.asstOpen !== false;
  box.append(h('button', {
    class: 'asst-current', 'aria-expanded': String(open), 'aria-label': `当前助手：${cur?.name || '无'}，${open ? '收起' : '展开'}助手列表`,
    onclick: async () => { S.settings.asstOpen = !open; await saveSettings(); renderAssistants(); },
  }, avatarEl(cur), h('span', { class: 'asst-name' }, cur ? `${cur.name}` : '未选择助手'), icon(open ? 'chevup' : 'chevdown')));
  if (!open) return;
  const list = h('div', { class: 'asst-list' });
  for (const p of S.personas) {
    const row = h('div', { class: 'asst-item' + (p.id === cur?.id ? ' active' : ''), role: 'button', tabindex: 0, 'data-id': p.id },
      avatarEl(p), h('span', { class: 'asst-name' }, p.name),
      h('button', { class: 'asst-edit', 'aria-label': `编辑助手 ${p.name}`, onclick: (e) => { e.stopPropagation(); editPersona(p, renderSide); } }, icon('pencil')));
    row.addEventListener('click', () => selectAssistant(p));
    list.append(row);
  }
  list.append(h('button', { class: 'asst-item asst-add', onclick: () => editPersona({ id: null, name: '', emoji: '🙂', prompt: '', temperature: null }, renderSide) },
    h('span', { class: 'asst-avatar' }, icon('plus')), h('span', { class: 'asst-name' }, '新建助手')));
  box.append(list);
}

async function selectAssistant(p) {
  S.settings.currentAssistantId = p.id; await saveSettings();
  const cur = currentConv();
  if (cur && !cur.messages.length) { cur.personaId = p.id; await saveConv(cur); }
  else if (cur && cur.personaId !== p.id) {
    const recent = [...S.convs].filter((c) => c.personaId === p.id).sort((a, b) => b.updatedAt - a.updatedAt)[0];
    S.currentId = recent?.id || null; localStorage.setItem('groky.current', S.currentId || '');
  }
  renderAll();
}

function renderConvList() {
  const list = $('#conv-list'); list.innerHTML = '';
  const q = S.search.trim().toLowerCase();
  const asst = currentAssistant();
  const btn = $('#btn-scope');
  if (btn) { btn.classList.toggle('on', S.scopeAll); btn.setAttribute('aria-pressed', String(S.scopeAll)); btn.setAttribute('aria-label', S.scopeAll ? '仅显示当前助手的对话' : '显示全部助手的对话'); }
  $('#conv-search').placeholder = S.scopeAll ? '搜索全部对话' : '搜索当前助手';
  const convs = [...S.convs]
    .filter((c) => c.messages.length) // 未发送消息的空对话不进列表
    .filter((c) => S.scopeAll || !asst || (c.personaId || null) === asst.id || c.id === S.currentId)
    .filter((c) => !q || (c.title || '').toLowerCase().includes(q) || c.messages.some((m) => (m.content || '').toLowerCase().includes(q)))
    .sort((a, b) => (!!b.pinned - !!a.pinned) || b.updatedAt - a.updatedAt);
  if (!convs.length) {
    list.append(h('div', { class: 'conv-empty' }, q ? '没有匹配的对话' : (S.scopeAll ? '还没有对话' : '该助手还没有对话')));
    return;
  }
  let last = null;
  for (const c of convs) {
    const g = c.pinned ? '置顶' : dayLabel(c.updatedAt);
    if (g !== last) { last = g; list.append(h('div', { class: 'conv-group' }, g)); }
    const item = h('div', { class: 'conv-item' + (c.id === S.currentId ? ' active' : ''), role: 'button', tabindex: 0, 'data-id': c.id },
      h('div', { class: 'ci-main' }, h('div', { class: 'ci-title' }, c.title || '新对话')),
      h('button', { class: 'ci-more', 'aria-label': '更多', onclick: (e) => { e.stopPropagation(); convActions(c); } }, icon('more')));
    item.addEventListener('click', () => { selectConv(c.id); closeSidebar(); });
    list.append(item);
  }
}

function renderUser() {
  const n = (S.settings.userName || '').trim() || '我';
  $('#user-name').textContent = n;
  $('#user-avatar').textContent = [...n][0].toUpperCase();
}
function renderSide() { renderAssistants(); renderConvList(); renderUser(); }

function convActions(c) {
  const sh = openSheet({
    title: c.title || '对话',
    body: h('div', { class: 'action-list' },
      h('button', { onclick: async () => { sh.close(); c.pinned = !c.pinned; await saveConv(c); renderConvList(); toast(c.pinned ? '已置顶' : '已取消置顶'); } }, c.pinned ? '取消置顶' : '置顶'),
      h('button', { onclick: async () => { sh.close(); const t = await askText('重命名对话', c.title); if (t != null) { c.title = t.trim() || '新对话'; await saveConv(c); renderAll(); } } }, '重命名'),
      h('button', { onclick: () => { sh.close(); selectConv(c.id); closeSidebar(); openConvSettings(); } }, '对话设置（模型 / 助手 / 温度）'),
      h('button', { class: 'danger', onclick: async () => { sh.close(); await deleteConv(c); } }, '删除对话')),
  });
}

async function deleteConv(c) {
  if (!confirm(`确定删除“${c.title}”吗？此操作不可恢复。`)) return;
  if (S.streaming?.convId === c.id) S.streaming.controller.abort();
  S.convs = S.convs.filter((x) => x.id !== c.id);
  await idb.del('conversations', c.id);
  if (S.currentId === c.id) S.currentId = [...S.convs].sort((a, b) => b.updatedAt - a.updatedAt)[0]?.id || null;
  localStorage.setItem('groky.current', S.currentId || '');
  renderAll(); toast('已删除');
}

/* ================= 渲染：顶部 & 消息 ================= */
function renderHeader() {
  const c = currentConv();
  $('#conv-title').textContent = c?.title || '新对话';
  const t = resolveTarget(c);
  $('#conv-model').textContent = t ? `${t.model}${t.provider?.name ? ` (${t.provider.name})` : ''}` : '未选择模型';
}

function renderMessages() {
  const box = $('#messages');
  const c = currentConv();
  box.innerHTML = '';
  if (!c || !c.messages.length) { box.append(emptyState()); return; }
  const wrap = h('div', { class: 'msg-wrap' });
  c.messages.forEach((m, i) => wrap.append(msgEl(c, m, i)));
  box.append(wrap);
  box.scrollTop = box.scrollHeight;
}

function emptyState() {
  if (S.providers.length) return h('div', { class: 'empty blank' });
  return h('div', { class: 'empty' },
    h('h2', {}, '欢迎使用 groky chat'),
    h('p', {}, '先添加一个模型服务（API Key 只保存在本机）'),
    h('button', { class: 'btn primary', onclick: () => openProviders() }, '＋ 添加模型服务'));
}

function msgEl(c, m, idx) {
  const isLast = idx === c.messages.length - 1;
  const busy = !!S.streaming;
  const el = h('div', { class: `msg ${m.role}`, 'data-id': m.id });

  if (m.role === 'user') {
    if (S.editingMsgId === m.id) {
      const ta = h('textarea', {}); ta.value = m.content;
      el.append(h('div', { class: 'edit-box' }, ta, h('div', { class: 'row' },
        h('button', { class: 'btn small', onclick: () => { S.editingMsgId = null; renderMessages(); } }, '取消'),
        h('button', { class: 'btn small primary', onclick: () => resendEdited(c, m, ta.value) }, '保存并发送'))));
      setTimeout(() => { ta.focus(); ta.setSelectionRange(ta.value.length, ta.value.length); }, 30);
      return el;
    }
    el.append(h('div', { class: 'bubble' }, m.content));
    el.append(h('div', { class: 'msg-actions' },
      h('button', { 'aria-label': '复制', title: '复制', onclick: () => copyText(m.content) }, icon('copy')),
      !busy && h('button', { 'aria-label': '编辑并重发', title: '编辑并重发', onclick: () => { S.editingMsgId = m.id; renderMessages(); } }, icon('edit')),
      !busy && h('button', { 'aria-label': '删除', title: '删除', onclick: () => deleteMsg(c, m) }, icon('trash'))));
    return el;
  }

  const persona = personaOf(c);
  el.append(h('div', { class: 'msg-head' }, h('span', { class: 'avatar' }, persona?.emoji || '✨'), h('span', {}, m.model || 'assistant')));
  if (m.reasoning) {
    el.append(h('details', { class: 'reasoning', open: m.pending && !m.content },
      h('summary', {}, m.pending && !m.content ? '思考中…' : '思考过程'), h('div', { class: 'r-body' }, m.reasoning)));
  }
  if (m.content) {
    const md = h('div', { class: 'md', html: renderMd(m.content) });
    enhanceMd(md); el.append(md);
  } else if (m.pending && !m.reasoning) {
    el.append(h('div', { class: 'typing' }, h('i'), h('i'), h('i')));
  }
  if (m.error) el.append(h('div', { class: 'msg-error' }, m.error));
  if (m.stopped) el.append(h('div', { class: 'msg-note' }, '已停止生成'));
  if (!m.pending) {
    el.append(h('div', { class: 'msg-actions' },
      m.content && h('button', { 'aria-label': '复制', title: '复制', onclick: () => copyText(m.content) }, icon('copy')),
      isLast && !busy && h('button', { 'aria-label': '重新生成', title: '重新生成', onclick: () => regenerate(c) }, icon('redo')),
      !busy && h('button', { 'aria-label': '删除', title: '删除', onclick: () => deleteMsg(c, m) }, icon('trash'))));
  }
  return el;
}

let rafPending = null;
function scheduleMsgUpdate(c, m) {
  if (rafPending) return;
  rafPending = requestAnimationFrame(() => {
    rafPending = null;
    if (S.currentId !== c.id) return;
    const box = $('#messages');
    const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 120;
    const old = box.querySelector(`.msg[data-id="${m.id}"]`);
    const idx = c.messages.indexOf(m);
    if (old && idx >= 0) { const n = msgEl(c, m, idx); n.style.animation = 'none'; old.replaceWith(n); }
    if (nearBottom) box.scrollTop = box.scrollHeight;
  });
}

function updateComposer() {
  const btn = $('#btn-send');
  const streamingHere = S.streaming && S.streaming.convId === S.currentId;
  btn.classList.toggle('stop', !!streamingHere);
  btn.innerHTML = ICONS[streamingHere ? 'stop' : 'send'];
  btn.setAttribute('aria-label', streamingHere ? '停止' : '发送');
  btn.disabled = !streamingHere && (!!S.streaming || !$('#input').value.trim());
  btn.classList.toggle('ready', !btn.disabled && !streamingHere);
  const c = currentConv();
  const p = c ? personaOf(c) : currentAssistant();
  const pb = $('#tool-persona');
  pb.innerHTML = ''; pb.append(avatarEl(p, 'tool-avatar'));
  pb.setAttribute('aria-label', `选择助手（当前：${p?.name || '无'}）`);
  const think = c?.think || null;
  $('#tool-think').classList.toggle('on', !!think);
  $('#tool-think').setAttribute('aria-label', `深度思考（${think ? THINK_LABEL[think] : '关闭'}）`);
  const ctxN = c?.maxContext ?? null;
  $('#tool-ctx').classList.toggle('on', ctxN != null);
  $('#tool-mic').classList.toggle('on', !!recog);
}

function renderAll() { renderSide(); renderHeader(); renderMessages(); updateComposer(); if (!$('#settings-page').hidden) renderSettingsPage(); }

/* ================= 对话操作 ================= */
function newConvObject() {
  const now = Date.now();
  return {
    id: uid(), title: '新对话', createdAt: now, updatedAt: now,
    target: S.settings.defaultModel ? { ...S.settings.defaultModel } : null,
    personaId: S.settings.currentAssistantId ?? S.settings.defaultPersonaId ?? null,
    systemPrompt: '', temperature: null, messages: [],
  };
}
async function newConv({ persist = true } = {}) {
  const cur = currentConv();
  if (cur && !cur.messages.length) { closeSidebar(); $('#input').focus(); return cur; } // 已有空对话则复用
  const c = newConvObject();
  S.convs.push(c); S.currentId = c.id;
  localStorage.setItem('groky.current', c.id);
  if (persist) await saveConv(c);
  renderAll(); closeSidebar();
  return c;
}
function selectConv(id) {
  S.currentId = id; S.editingMsgId = null;
  const c = currentConv();
  if (c?.personaId && S.personas.some((p) => p.id === c.personaId)) { S.settings.currentAssistantId = c.personaId; saveSettings(); }
  localStorage.setItem('groky.current', id);
  renderAll();
}

async function send() {
  const input = $('#input');
  const text = input.value.trim();
  if (!text || S.streaming) return;
  if (!resolveTarget(currentConv())) { toast('请先添加模型服务'); openProviders(); return; }
  let c = currentConv();
  if (!c) c = await newConv();
  input.value = ''; autoGrow();
  c.messages.push({ id: uid(), role: 'user', content: text, createdAt: Date.now() });
  if (!c.title || c.title === '新对话') c.title = text.replace(/\s+/g, ' ').slice(0, 24);
  await generate(c);
}

async function generate(c) {
  const t = resolveTarget(c);
  if (!t) { toast('请先添加模型服务'); openProviders(); return; }
  if (!c.target) c.target = { providerId: t.provider.id, model: t.model };
  const asst = { id: uid(), role: 'assistant', content: '', reasoning: '', model: t.model, providerId: t.provider.id, createdAt: Date.now(), pending: true };
  const history = c.messages.filter((m) => !m.error || m.content).map((m) => ({ role: m.role, content: m.content }));
  const limit = Number(c.maxContext ?? S.settings.maxContext) || 0;
  const ctx = limit > 0 ? history.slice(-limit) : history;
  c.messages.push(asst); c.updatedAt = Date.now();
  await saveConv(c);
  const controller = new AbortController();
  S.streaming = { convId: c.id, controller, msgId: asst.id };
  renderAll();
  try {
    await streamChat({
      provider: t.provider, model: t.model, system: systemPromptOf(c), messages: ctx,
      temperature: temperatureOf(c), think: c.think || null, signal: controller.signal,
      onDelta: (d) => {
        if (d.text) asst.content += d.text;
        if (d.reasoning) asst.reasoning += d.reasoning;
        scheduleMsgUpdate(c, asst);
      },
    });
    if (!asst.content && !asst.reasoning) asst.error = '模型没有返回任何内容。';
  } catch (e) {
    if (e.name === 'AbortError') asst.stopped = true;
    else asst.error = friendlyError(e);
  } finally {
    asst.pending = false; c.updatedAt = Date.now();
    S.streaming = null;
    await saveConv(c);
    if (rafPending) { cancelAnimationFrame(rafPending); rafPending = null; }
    if (S.currentId === c.id) { renderMessages(); }
    renderConvList(); updateComposer();
  }
}

function stop() { S.streaming?.controller.abort(); }

async function regenerate(c) {
  if (S.streaming) return;
  const last = c.messages[c.messages.length - 1];
  if (last?.role === 'assistant') c.messages.pop();
  if (!c.messages.length) return;
  await generate(c);
}

async function resendEdited(c, m, text) {
  text = text.trim();
  if (!text) return toast('内容不能为空');
  const idx = c.messages.indexOf(m);
  if (idx < 0) return;
  m.content = text; m.editedAt = Date.now();
  c.messages = c.messages.slice(0, idx + 1);
  S.editingMsgId = null;
  await generate(c);
}

async function deleteMsg(c, m) {
  c.messages = c.messages.filter((x) => x !== m);
  await saveConv(c); renderMessages();
}

/* ================= 面板（Sheet） ================= */
function isEditable(el) {
  if (!el || !el.tagName) return false;
  if (el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable) return true;
  return el.tagName === 'INPUT' && !/^(checkbox|radio|range|file|button|submit)$/i.test(el.type);
}
let revealTimers = new Set();
function revealFocused(delay = 300) {
  const t = setTimeout(() => {
    revealTimers.delete(t);
    const el = document.activeElement;
    if (!isEditable(el) || !el.closest('.sheet')) return;
    try { el.scrollIntoView({ block: 'center', inline: 'nearest', behavior: delay ? 'smooth' : 'auto' }); } catch { el.scrollIntoView(); }
  }, delay);
  revealTimers.add(t);
}
function openSheet({ title, body, footer, back = false, onClose }) {
  const root = $('#sheet-root');
  const backdrop = h('div', { class: 'sheet-backdrop' });
  const closeBtn = h('button', { class: 'icon-btn', 'aria-label': back ? '返回' : '关闭' }, icon(back ? 'back' : 'close'));
  const sheet = h('div', { class: 'sheet', role: 'dialog', 'aria-label': title },
    h('div', { class: 'sheet-head' }, closeBtn, h('h2', {}, title), h('span', { class: 'spacer' })),
    h('div', { class: 'sheet-body' }, body),
    footer ? h('div', { class: 'sheet-foot' }, footer) : null);
  let closed = false;
  const close = () => { if (closed) return; closed = true; backdrop.remove(); sheet.remove(); onClose?.(); };
  backdrop.addEventListener('click', close); closeBtn.addEventListener('click', close);
  root.append(backdrop, sheet);
  return { close, el: sheet };
}

function askText(title, value = '', { multiline = false, placeholder = '' } = {}) {
  return new Promise((resolve) => {
    const input = multiline ? h('textarea', { placeholder }) : h('input', { type: 'text', placeholder });
    input.value = value || '';
    let done = false;
    const sh = openSheet({
      title, body: h('div', { class: 'field' }, input),
      footer: [h('button', { class: 'btn', onclick: () => sh.close() }, '取消'),
        h('button', { class: 'btn primary', onclick: () => { done = true; resolve(input.value); sh.close(); } }, '确定')],
      onClose: () => { if (!done) resolve(null); },
    });
    input.addEventListener('keydown', (e) => { if (!multiline && e.key === 'Enter' && !e.isComposing) { done = true; resolve(input.value); sh.close(); } });
    setTimeout(() => input.focus(), 50);
  });
}

function field(label, control, hint) {
  return h('div', { class: 'field' }, h('label', {}, label), control, hint ? h('div', { class: 'hint' }, hint) : null);
}
function seg(options, value, onChange) {
  const box = h('div', { class: 'seg' });
  const render = () => { box.innerHTML = ''; for (const [v, label] of options) box.append(h('button', { type: 'button', class: v === value ? 'on' : '', onclick: () => { value = v; render(); onChange(v); } }, label)); };
  render(); return box;
}
function modelSelect(current, { allowDefault = false } = {}) {
  const sel = h('select', {});
  if (allowDefault) sel.append(h('option', { value: '' }, '（使用默认模型）'));
  if (!S.providers.length) sel.append(h('option', { value: '' }, '（请先添加模型服务）'));
  for (const p of S.providers) {
    const g = h('optgroup', { label: p.name });
    for (const m of p.models || []) g.append(h('option', { value: `${p.id}::${m}` }, m));
    sel.append(g);
  }
  sel.value = current ? `${current.providerId}::${current.model}` : '';
  if (current && sel.value === '' && !allowDefault) sel.selectedIndex = 0;
  return sel;
}
const parseModelValue = (v) => { if (!v) return null; const i = v.indexOf('::'); return { providerId: v.slice(0, i), model: v.slice(i + 2) }; };
function personaSelect(currentId, noneLabel = '（无角色）') {
  const sel = h('select', {}, h('option', { value: '' }, noneLabel));
  for (const p of S.personas) sel.append(h('option', { value: p.id }, `${p.emoji || '🙂'} ${p.name}`));
  sel.value = currentId || '';
  return sel;
}
function temperatureControl(value) {
  const enabled = h('input', { type: 'checkbox', class: 'switch' }); enabled.checked = value != null;
  const range = h('input', { type: 'range', min: 0, max: 2, step: 0.1 }); range.value = value ?? 0.7;
  const out = h('output', {}, Number(range.value).toFixed(1));
  const row = h('div', { class: 'range-row' }, range, out);
  const sync = () => { row.style.display = enabled.checked ? '' : 'none'; out.textContent = Number(range.value).toFixed(1); };
  range.addEventListener('input', sync); enabled.addEventListener('change', sync); sync();
  const el = h('div', {},
    h('div', { class: 'switch-row' }, h('div', { class: 'sr-text' }, '自定义温度', h('small', {}, '关闭时使用角色或模型默认值')), enabled), row);
  return { el, get: () => (enabled.checked ? Number(range.value) : null) };
}

/* ---------- 对话设置 ---------- */
function openConvSettings() {
  let c = currentConv();
  const isDraft = !c;
  if (!c) c = newConvObject();
  const title = h('input', { type: 'text' }); title.value = c.title;
  const msel = modelSelect(c.target, { allowDefault: true });
  const psel = personaSelect(c.personaId);
  const sys = h('textarea', { placeholder: '留空则使用所选角色的系统提示' }); sys.value = c.systemPrompt || '';
  const temp = temperatureControl(c.temperature);
  const sh = openSheet({
    title: '对话设置',
    body: [
      field('标题', title),
      field('模型', msel, S.providers.length ? '每个对话可以单独选择模型' : null),
      !S.providers.length ? h('button', { class: 'btn', style: { width: '100%' }, onclick: () => { sh.close(); openProviders(); } }, '＋ 添加模型服务') : null,
      field('助手', psel),
      field('系统提示（仅本对话，覆盖角色）', sys),
      h('div', { class: 'field' }, h('label', {}, '温度 Temperature'), temp.el),
      !isDraft ? h('button', { class: 'btn danger', style: { width: '100%', marginTop: '8px' }, onclick: async () => { sh.close(); await deleteConv(c); } }, '删除此对话') : null,
    ],
    footer: [h('button', { class: 'btn', onclick: () => sh.close() }, '取消'), h('button', {
      class: 'btn primary', onclick: async () => {
        c.title = title.value.trim() || '新对话';
        c.target = parseModelValue(msel.value);
        c.personaId = psel.value || null;
        c.systemPrompt = sys.value;
        c.temperature = temp.get();
        if (isDraft) { S.convs.push(c); S.currentId = c.id; localStorage.setItem('groky.current', c.id); }
        await saveConv(c); sh.close(); renderAll(); toast('已保存');
      },
    }, '保存')],
  });
}

/* ---------- 模型服务 ---------- */
function openProviders() {
  closeSidebar();
  const body = h('div', {});
  const render = () => {
    body.innerHTML = '';
    if (S.providers.length) {
      body.append(h('div', { class: 'section-title' }, '已添加的服务'));
      body.append(h('div', { class: 'list' }, S.providers.map((p) => h('button', { class: 'list-item', onclick: () => editProvider(p, render) },
        h('span', { class: 'li-icon' }, (p.name || '?').slice(0, 1).toUpperCase()),
        h('span', { class: 'li-main' }, h('div', { class: 'li-title' }, p.name), h('div', { class: 'li-sub' }, `${(p.models || []).length} 个模型 · ${apiBase(p) || '未设置地址'}`)),
        h('span', { class: 'li-badge' }, p.type === 'anthropic' ? 'Anthropic' : 'OpenAI 兼容')))));
    }
    body.append(h('div', { class: 'section-title' }, '添加服务'));
    body.append(h('div', { class: 'preset-grid' }, PRESETS.map((pr) => h('button', {
      onclick: () => editProvider({ id: null, name: pr.name === '自定义' ? '' : pr.name, type: pr.type, baseUrl: pr.baseUrl, apiKey: '', models: [...pr.models] }, render),
    }, h('b', {}, pr.name), h('small', {}, pr.note)))));
    body.append(h('p', { class: 'muted' }, '🔒 API Key 只保存在本设备浏览器的 IndexedDB 中，仅在请求时直接发送给对应服务商。'));
  };
  render();
  openSheet({ title: '供应商', body });
}

function editProvider(p, onDone) {
  const isNew = !p.id;
  const draft = clone(p);
  const name = h('input', { type: 'text', placeholder: '例如：我的 Grok' }); name.value = draft.name || '';
  const typeSeg = seg([['openai', 'OpenAI 兼容'], ['anthropic', 'Anthropic']], draft.type, (v) => {
    draft.type = v;
    if (v === 'anthropic' && !base.value) base.value = 'https://api.anthropic.com/v1';
    maxTokRow.style.display = v === 'anthropic' ? '' : 'none';
  });
  const base = h('input', { type: 'url', placeholder: 'https://api.x.ai/v1', autocapitalize: 'off', autocorrect: 'off', spellcheck: false }); base.value = draft.baseUrl || '';
  const key = h('input', { type: 'password', placeholder: 'sk-...', autocomplete: 'off', autocapitalize: 'off', spellcheck: false }); key.value = draft.apiKey || '';
  const eye = h('button', { type: 'button', class: 'btn small', onclick: () => { key.type = key.type === 'password' ? 'text' : 'password'; eye.textContent = key.type === 'password' ? '显示' : '隐藏'; } }, '显示');
  const maxTok = h('input', { type: 'text', inputmode: 'numeric', placeholder: '4096' }); maxTok.value = draft.maxTokens || '';
  const maxTokRow = field('最大输出 Tokens（Anthropic 必填）', maxTok); maxTokRow.style.display = draft.type === 'anthropic' ? '' : 'none';
  const chips = h('div', { class: 'model-chips' });
  const renderChips = () => {
    chips.innerHTML = '';
    if (!draft.models.length) chips.append(h('span', { class: 'muted', style: { border: 0, background: 'none' } }, '暂无模型'));
    draft.models.forEach((m) => chips.append(h('span', {}, h('em', {}, m), h('button', { type: 'button', 'aria-label': '移除', onclick: () => { draft.models = draft.models.filter((x) => x !== m); renderChips(); } }, '×'))));
  };
  renderChips();
  const newModel = h('input', { type: 'text', placeholder: '输入模型名，如 grok-4', autocapitalize: 'off', autocorrect: 'off', spellcheck: false });
  const addModel = () => { const v = newModel.value.trim(); if (v && !draft.models.includes(v)) { draft.models.push(v); renderChips(); } newModel.value = ''; };
  newModel.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.isComposing) { e.preventDefault(); addModel(); } });
  const fetchBtn = h('button', {
    type: 'button', class: 'btn small', onclick: async () => {
      fetchBtn.disabled = true; fetchBtn.textContent = '获取中…';
      try {
        const list = await fetchModels({ ...draft, baseUrl: base.value, apiKey: key.value });
        if (!list.length) toast('接口未返回模型');
        else { pickModels(list, draft.models, (sel) => { draft.models = sel; renderChips(); }); }
      } catch (e) { toast(friendlyError(e).split('\n')[0], 4000); }
      finally { fetchBtn.disabled = false; fetchBtn.textContent = '从接口获取'; }
    },
  }, '从接口获取');

  const sh = openSheet({
    title: isNew ? '添加服务' : '编辑服务', back: true,
    body: [
      field('名称', name),
      h('div', { class: 'field' }, h('label', {}, '接口类型'), typeSeg),
      field('Base URL', base, 'OpenAI 兼容填到 /v1 为止（例：https://api.x.ai/v1 、https://openrouter.ai/api/v1）'),
      field('API Key', h('div', { class: 'input-row' }, key, eye)),
      maxTokRow,
      h('div', { class: 'field' }, h('label', {}, '模型'),
        h('div', { class: 'input-row' }, newModel, h('button', { type: 'button', class: 'btn small', onclick: addModel }, '添加'), fetchBtn), chips),
      !isNew ? h('button', {
        class: 'btn danger', style: { width: '100%', marginTop: '10px' }, onclick: async () => {
          if (!confirm(`删除服务“${p.name}”？`)) return;
          S.providers = S.providers.filter((x) => x.id !== p.id);
          await idb.del('providers', p.id);
          if (S.settings.defaultModel?.providerId === p.id) { S.settings.defaultModel = null; await saveSettings(); }
          sh.close(); onDone?.(); renderAll();
        },
      }, '删除此服务') : null,
    ],
    footer: [h('button', { class: 'btn', onclick: () => sh.close() }, '取消'), h('button', {
      class: 'btn primary', onclick: async () => {
        if (newModel.value.trim()) addModel();
        draft.name = name.value.trim() || (draft.type === 'anthropic' ? 'Anthropic' : '自定义服务');
        draft.baseUrl = base.value.trim(); draft.apiKey = key.value.trim();
        draft.maxTokens = maxTok.value.trim() ? Number(maxTok.value.trim()) : null;
        if (!draft.baseUrl) return toast('请填写 Base URL');
        if (!draft.models.length) return toast('请至少添加一个模型');
        if (isNew) { draft.id = uid(); draft.createdAt = Date.now(); S.providers.push(draft); }
        else { const i = S.providers.findIndex((x) => x.id === p.id); S.providers[i] = draft; }
        await saveProvider(draft);
        if (!S.settings.defaultModel) { S.settings.defaultModel = { providerId: draft.id, model: draft.models[0] }; await saveSettings(); }
        sh.close(); onDone?.(); renderAll(); toast('已保存');
      },
    }, '保存')],
  });
}

function pickModels(list, selected, onPick) {
  const set = new Set(selected);
  const filter = h('input', { type: 'search', placeholder: `筛选（共 ${list.length} 个）` });
  const box = h('div', { class: 'list' });
  const render = () => {
    const q = filter.value.trim().toLowerCase();
    box.innerHTML = '';
    list.filter((m) => !q || m.toLowerCase().includes(q)).slice(0, 300).forEach((m) => {
      const cb = h('input', { type: 'checkbox', class: 'switch' }); cb.checked = set.has(m);
      cb.addEventListener('change', () => (cb.checked ? set.add(m) : set.delete(m)));
      box.append(h('label', { class: 'list-item' }, h('span', { class: 'li-main' }, h('div', { class: 'li-title', style: { fontWeight: 400 } }, m)), cb));
    });
  };
  filter.addEventListener('input', render); render();
  const sh = openSheet({
    title: '选择模型', back: true, body: [h('div', { class: 'field' }, filter), box],
    footer: [h('button', { class: 'btn', onclick: () => sh.close() }, '取消'), h('button', { class: 'btn primary', onclick: () => { onPick([...set]); sh.close(); } }, '确定')],
  });
}

/* ---------- 角色 ---------- */
function openPersonas() {
  closeSidebar();
  const body = h('div', {});
  const render = () => {
    body.innerHTML = '';
    body.append(h('div', { class: 'list' }, S.personas.map((p) => h('button', { class: 'list-item', onclick: () => editPersona(p, render) },
      h('span', { class: 'li-icon' }, p.emoji || '🙂'),
      h('span', { class: 'li-main' }, h('div', { class: 'li-title' }, p.name), h('div', { class: 'li-sub' }, p.prompt || '（无系统提示）')),
      S.settings.defaultPersonaId === p.id ? h('span', { class: 'li-badge' }, '默认') : null))));
    if (!S.personas.length) body.append(h('p', { class: 'muted' }, '还没有角色'));
    body.append(h('button', { class: 'btn primary', style: { width: '100%', marginTop: '10px' }, onclick: () => editPersona({ id: null, name: '', emoji: '🙂', prompt: '', temperature: null }, render) }, '＋ 新建助手'));
    const c = currentConv();
    if (c) {
      body.append(h('div', { class: 'section-title' }, '当前对话使用'));
      const ps = personaSelect(c.personaId);
      ps.addEventListener('change', async () => { c.personaId = ps.value || null; await saveConv(c); renderAll(); toast('已切换角色'); });
      body.append(h('div', { class: 'field' }, ps));
    }
  };
  render();
  openSheet({ title: '助手', body });
}

function editPersona(p, onDone) {
  const isNew = !p.id;
  const emoji = h('input', { type: 'text', maxlength: 4, style: { width: '64px', textAlign: 'center', flex: 'none' } }); emoji.value = p.emoji || '🙂';
  const name = h('input', { type: 'text', placeholder: '角色名称' }); name.value = p.name || '';
  const prompt = h('textarea', { placeholder: '系统提示词，例如：你是一位温柔耐心的英语老师……', style: { minHeight: '180px' } }); prompt.value = p.prompt || '';
  const temp = temperatureControl(p.temperature);
  const isDefault = h('input', { type: 'checkbox', class: 'switch' }); isDefault.checked = !isNew && S.settings.defaultPersonaId === p.id;
  const sh = openSheet({
    title: isNew ? '新建助手' : '编辑助手', back: true,
    body: [
      h('div', { class: 'field' }, h('label', {}, '图标与名称'), h('div', { class: 'input-row' }, emoji, name)),
      field('系统提示 System Prompt', prompt),
      h('div', { class: 'field' }, h('label', {}, '默认温度'), temp.el),
      h('div', { class: 'switch-row' }, h('div', { class: 'sr-text' }, '设为新对话默认角色'), isDefault),
      !isNew ? h('button', {
        class: 'btn danger', style: { width: '100%', marginTop: '10px' }, onclick: async () => {
          if (!confirm(`删除角色“${p.name}”？`)) return;
          S.personas = S.personas.filter((x) => x.id !== p.id); await idb.del('personas', p.id);
          if (S.settings.defaultPersonaId === p.id) { S.settings.defaultPersonaId = null; await saveSettings(); }
          sh.close(); onDone?.(); renderAll();
        },
      }, '删除角色') : null,
    ],
    footer: [h('button', { class: 'btn', onclick: () => sh.close() }, '取消'), h('button', {
      class: 'btn primary', onclick: async () => {
        const d = { ...p, emoji: emoji.value.trim() || '🙂', name: name.value.trim() || '未命名角色', prompt: prompt.value, temperature: temp.get() };
        if (isNew) { d.id = uid(); S.personas.push(d); } else { S.personas[S.personas.findIndex((x) => x.id === p.id)] = d; }
        await savePersona(d);
        if (isDefault.checked) S.settings.defaultPersonaId = d.id;
        else if (S.settings.defaultPersonaId === d.id) S.settings.defaultPersonaId = null;
        await saveSettings();
        sh.close(); onDone?.(); renderAll(); toast('已保存');
      },
    }, '保存')],
  });
}

/* ---------- 输入栏工具 ---------- */
const THINK_LABEL = { low: '轻度', medium: '中度', high: '深度' };
async function ensureConv() {
  let c = currentConv();
  if (!c) {
    c = newConvObject(); S.convs.push(c); S.currentId = c.id;
    localStorage.setItem('groky.current', c.id); await saveConv(c);
  }
  return c;
}
function choiceSheet(title, items, { footer, note } = {}) {
  // items: [{ label, sub, selected, icon, onPick, disabled }]
  const sh = openSheet({
    title,
    body: [h('div', { class: 'choice-list' }, items.map((it) => h('button', {
      class: 'choice' + (it.selected ? ' on' : ''), disabled: !!it.disabled, 'aria-pressed': String(!!it.selected),
      onclick: async () => { sh.close(); await it.onPick?.(); },
    }, it.icon || null, h('span', { class: 'ch-main' }, h('span', { class: 'ch-title' }, it.label), it.sub ? h('span', { class: 'ch-sub' }, it.sub) : null),
    it.selected ? icon('check') : null))), note ? h('p', { class: 'muted' }, note) : null, footer || null],
  });
  return sh;
}
function openModelPicker() {
  if (!S.providers.length) { toast('请先添加模型服务'); openProviders(); return; }
  const c = currentConv(); const t = resolveTarget(c);
  const items = [];
  for (const p of S.providers) for (const m of p.models || []) {
    items.push({ label: m, sub: p.name, selected: t && t.provider.id === p.id && t.model === m,
      onPick: async () => { const cc = await ensureConv(); cc.target = { providerId: p.id, model: m }; await saveConv(cc); renderAll(); } });
  }
  choiceSheet('选择模型', items, { footer: h('button', { class: 'btn', style: { width: '100%', marginTop: '12px' }, onclick: () => { document.querySelectorAll('.sheet, .sheet-backdrop').forEach((e) => e.remove()); openProviders(); } }, '管理供应商') });
}
function openPersonaPicker() {
  const c = currentConv(); const cur = c ? personaOf(c) : currentAssistant();
  choiceSheet('选择助手', [
    ...S.personas.map((p) => ({ label: p.name, sub: (p.prompt || '').slice(0, 40) || '（无系统提示）', icon: avatarEl(p), selected: cur?.id === p.id,
      onPick: async () => {
        S.settings.currentAssistantId = p.id; await saveSettings();
        if (c) { c.personaId = p.id; await saveConv(c); }
        renderAll(); toast(`已切换到 ${p.name}`);
      } })),
  ], { footer: h('button', { class: 'btn', style: { width: '100%', marginTop: '12px' }, onclick: () => { document.querySelectorAll('.sheet, .sheet-backdrop').forEach((e) => e.remove()); openPersonas(); } }, '管理助手') });
}
function openThinkPicker() {
  const c = currentConv(); const v = c?.think || null;
  choiceSheet('深度思考', [[null, '关闭', '使用模型默认行为'], ['low', '轻度', '更快'], ['medium', '中度', '平衡'], ['high', '深度', '更充分的推理']].map(([k, l, sub]) => ({
    label: l, sub, selected: v === k, onPick: async () => { const cc = await ensureConv(); cc.think = k; await saveConv(cc); updateComposer(); toast(k ? `深度思考：${l}` : '已关闭深度思考'); },
  })), { note: '开启后：OpenAI 兼容接口发送 reasoning_effort；Anthropic 发送 thinking（预算 1k / 4k / 12k tokens，并忽略自定义温度）。仅推理模型支持，不支持的模型可能报错。' });
}
function openCtxPicker() {
  const c = currentConv(); const v = c?.maxContext ?? null;
  const g = Number(S.settings.maxContext) || 0;
  choiceSheet('上下文消息数', [[null, `跟随全局（${g ? '最近 ' + g + ' 条' : '全部历史'}）`], [0, '全部历史'], [6, '最近 6 条'], [10, '最近 10 条'], [20, '最近 20 条'], [40, '最近 40 条']].map(([k, l]) => ({
    label: l, selected: v === k, onPick: async () => { const cc = await ensureConv(); cc.maxContext = k; await saveConv(cc); updateComposer(); },
  })), { note: '仅对当前对话生效，控制每次发送给模型的历史消息条数。' });
}
function convToMarkdown(c) {
  return `# ${c.title}\n\n` + c.messages.map((m) => `**${m.role === 'user' ? ((S.settings.userName || '').trim() || '我') : (m.model || 'assistant')}**：\n\n${m.content}`).join('\n\n---\n\n');
}
function openMoreMenu() {
  const c = currentConv();
  const sh = openSheet({
    title: '更多',
    body: h('div', { class: 'action-list' },
      h('button', { onclick: () => { sh.close(); newConv(); } }, '新对话'),
      h('button', { onclick: () => { sh.close(); openConvSettings(); } }, '对话设置（标题 / 系统提示 / 温度）'),
      h('button', { disabled: !c?.messages.length, onclick: () => { sh.close(); copyText(convToMarkdown(c)); } }, '复制整段对话（Markdown）'),
      h('button', { class: 'soon', disabled: true }, '图片 / 文件附件', h('small', {}, '即将推出'))),
  });
}
let recog = null;
function toggleMic() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { toast('当前浏览器不支持语音输入，可使用键盘自带的听写'); return; }
  if (recog) { recog.stop(); return; }
  const input = $('#input'); const base = input.value;
  recog = new SR(); recog.lang = 'zh-CN'; recog.interimResults = true; recog.continuous = false;
  recog.onresult = (e) => { let t = ''; for (const r of e.results) t += r[0].transcript; input.value = base + t; autoGrow(); };
  recog.onerror = (e) => toast('语音识别出错：' + (e.error || '未知'));
  recog.onend = () => { recog = null; updateComposer(); };
  try { recog.start(); toast('正在聆听…'); } catch (e) { recog = null; toast('无法启动语音识别'); }
  updateComposer();
}

/* ---------- 设置页 ---------- */
function openSettingsPage() {
  closeSidebar();
  renderSettingsPage();
  const pg = $('#settings-page'); pg.hidden = false;
  requestAnimationFrame(() => pg.classList.add('show'));
}
function closeSettingsPage() {
  const pg = $('#settings-page'); pg.classList.remove('show');
  setTimeout(() => { if (!pg.classList.contains('show')) pg.hidden = true; }, 260);
}
function fmtBytes(n) {
  if (n < 1024) return n + ' B';
  if (n < 1048576) return (n / 1024).toFixed(1) + ' KB';
  return (n / 1048576).toFixed(2) + ' MB';
}
const chatBytes = () => new Blob([JSON.stringify(S.convs)]).size;
const THEME_LABEL = { auto: '跟随系统', light: '浅色', dark: '深色' };
function renderSettingsPage() {
  const body = $('#settings-body'); body.innerHTML = '';
  const st = S.settings;
  const dm = resolveTarget(null);
  const row = (ic, label, { value, onClick, soon } = {}) => h('button', {
    class: 'set-row' + (soon ? ' soon' : ''), disabled: !!soon, onclick: onClick,
  }, icon(ic), h('span', { class: 'sr-label' }, label), h('span', { class: 'sr-value' }, soon ? '即将推出' : (value || '')), soon ? null : icon('chevright'));
  const group = (title, ...rows) => [h('div', { class: 'set-title' }, title), h('div', { class: 'set-card' }, rows)];
  const msgCount = S.convs.reduce((n, c) => n + c.messages.length, 0);
  body.append(
    ...group('通用设置',
      row('palette', '颜色模式', { value: THEME_LABEL[st.theme] || '跟随系统', onClick: openThemeSheet }),
      row('monitor', '偏好设置', { onClick: openPrefs }),
      row('bot', '助手', { value: `${S.personas.length} 个`, onClick: openPersonas })),
    ...group('模型与服务',
      row('heart', '默认模型', { value: dm ? dm.model : '未设置', onClick: openDefaultModel }),
      row('boxes', '供应商', { value: `${S.providers.length} 个`, onClick: openProviders }),
      row('globe', '搜索服务', { soon: true }),
      row('terminal', 'MCP', { soon: true }),
      row('brain', '记忆', { soon: true })),
    ...group('数据设置',
      row('database', '数据备份', { onClick: openBackup }),
      row('drive', '聊天记录存储', { value: fmtBytes(chatBytes()), onClick: openStorage })),
    ...group('关于',
      row('info', '关于', { value: `v${APP_VERSION}`, onClick: openAbout }),
      row('chart', '统计', { value: `${S.convs.filter((c) => c.messages.length).length} 个对话 · ${msgCount} 条消息`, onClick: openStats }),
      row('book', '使用文档', { onClick: () => window.open('https://github.com/fallon40480211-create/groky-chat#readme', '_blank', 'noopener') })),
  );
}
function openThemeSheet() {
  const st = S.settings;
  openSheet({ title: '颜色模式', body: [h('div', { class: 'field' }, seg([['auto', '跟随系统'], ['light', '浅色'], ['dark', '深色']], st.theme, async (v) => { st.theme = v; applyTheme(); await saveSettings(); renderSettingsPage(); }))] });
}
function openPrefs() {
  const st = S.settings;
  const name = h('input', { type: 'text', placeholder: '我', maxlength: 20 }); name.value = st.userName || '';
  name.addEventListener('change', async () => { st.userName = name.value.trim(); await saveSettings(); renderUser(); });
  const enter = h('input', { type: 'checkbox', class: 'switch' }); enter.checked = !!st.enterSend;
  enter.addEventListener('change', async () => { st.enterSend = enter.checked; await saveSettings(); });
  const ctx = h('select', {}, [['0', '全部历史'], ['6', '最近 6 条'], ['10', '最近 10 条'], ['20', '最近 20 条'], ['40', '最近 40 条']].map(([v, l]) => h('option', { value: v }, l)));
  ctx.value = String(st.maxContext || 0);
  ctx.addEventListener('change', async () => { st.maxContext = Number(ctx.value); await saveSettings(); });
  const dp = personaSelect(st.defaultPersonaId);
  dp.addEventListener('change', async () => { st.defaultPersonaId = dp.value || null; await saveSettings(); });
  openSheet({ title: '偏好设置', onClose: () => { if ((name.value.trim()) !== (st.userName || '')) { st.userName = name.value.trim(); saveSettings(); } renderUser(); }, body: [
    field('我的名字', name, '显示在侧栏底部与导出的对话中'),
    h('div', { class: 'switch-row' }, h('div', { class: 'sr-text' }, '回车键发送', h('small', {}, '关闭时回车换行，点按钮发送')), enter),
    field('默认上下文消息数', ctx), field('新对话默认助手', dp),
  ] });
}
function openDefaultModel() {
  const st = S.settings;
  const dm = modelSelect(st.defaultModel);
  dm.addEventListener('change', async () => { st.defaultModel = parseModelValue(dm.value); await saveSettings(); renderAll(); renderSettingsPage(); });
  openSheet({ title: '默认模型', body: [field('新对话使用的模型', dm, S.providers.length ? '每个对话仍可在输入栏单独切换模型' : null),
    !S.providers.length ? h('button', { class: 'btn', style: { width: '100%' }, onclick: () => openProviders() }, '＋ 添加模型服务') : null] });
}
function openBackup() {
  const withKeys = h('input', { type: 'checkbox', class: 'switch' }); withKeys.checked = true;
  const file = h('input', { type: 'file', accept: 'application/json,.json', style: { display: 'none' } });
  file.addEventListener('change', async () => { const f = file.files[0]; if (f) await importData(f); file.value = ''; });
  openSheet({ title: '数据备份', body: [
    h('div', { class: 'switch-row' }, h('div', { class: 'sr-text' }, '导出时包含 API Key', h('small', {}, '备份文件请妥善保管')), withKeys),
    h('div', { class: 'input-row' },
      h('button', { class: 'btn', style: { flex: 1 }, onclick: () => exportData(withKeys.checked) }, '导出 JSON'),
      h('button', { class: 'btn', style: { flex: 1 }, onclick: () => file.click() }, '导入 JSON'), file),
    h('p', { class: 'muted' }, '导入会与现有数据合并，相同 ID 的条目会被覆盖。'),
  ] });
}
async function openStorage() {
  let est = null; try { est = await navigator.storage?.estimate?.(); } catch { /* ignore */ }
  openSheet({ title: '聊天记录存储', body: [
    h('div', { class: 'set-card' },
      h('div', { class: 'kv' }, h('span', {}, '聊天记录'), h('b', {}, fmtBytes(chatBytes()))),
      h('div', { class: 'kv' }, h('span', {}, '对话数'), h('b', {}, String(S.convs.length))),
      est ? h('div', { class: 'kv' }, h('span', {}, '本站已用 / 配额'), h('b', {}, `${fmtBytes(est.usage || 0)} / ${fmtBytes(est.quota || 0)}`)) : null),
    h('button', { class: 'btn danger', style: { width: '100%', marginTop: '14px' }, onclick: clearAll }, '清空所有数据'),
    h('p', { class: 'muted' }, '所有数据只存在本设备浏览器的 IndexedDB 中；清空前建议先导出备份。'),
  ] });
}
function openAbout() {
  openSheet({ title: '关于', body: [h('div', { class: 'about' },
    h('img', { src: 'icons/icon-192.png', alt: '' }), h('h3', {}, 'groky chat'), h('p', { class: 'muted' }, `版本 v${APP_VERSION}`),
    h('p', {}, '纯前端 AI 聊天客户端，没有服务器；对话与密钥只保存在本机浏览器。在 Safari 中点“分享 → 添加到主屏幕”即可像 App 一样使用。'))] });
}
function openStats() {
  const msgs = S.convs.flatMap((c) => c.messages);
  const byModel = {};
  for (const m of msgs) if (m.role === 'assistant' && m.model) byModel[m.model] = (byModel[m.model] || 0) + 1;
  openSheet({ title: '统计', body: [h('div', { class: 'set-card' },
    h('div', { class: 'kv' }, h('span', {}, '对话'), h('b', {}, String(S.convs.length))),
    h('div', { class: 'kv' }, h('span', {}, '我的消息'), h('b', {}, String(msgs.filter((m) => m.role === 'user').length))),
    h('div', { class: 'kv' }, h('span', {}, 'AI 回复'), h('b', {}, String(msgs.filter((m) => m.role === 'assistant').length))),
    ...Object.entries(byModel).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([k, v]) => h('div', { class: 'kv' }, h('span', {}, k), h('b', {}, String(v)))))] });
}

async function exportData(includeKeys) {
  const data = {
    app: 'groky-chat', version: 1, exportedAt: new Date().toISOString(),
    settings: S.settings,
    providers: S.providers.map((p) => (includeKeys ? p : { ...p, apiKey: '' })),
    personas: S.personas, conversations: S.convs,
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const name = `groky-chat-backup-${new Date().toISOString().slice(0, 10)}.json`;
  const a = h('a', { href: URL.createObjectURL(blob), download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  toast('已导出');
}

async function importData(file) {
  let data;
  try { data = JSON.parse(await file.text()); } catch { return toast('文件不是有效的 JSON'); }
  if (data?.app !== 'groky-chat') return toast('不是 groky chat 的备份文件');
  if (!confirm('导入将合并数据（相同 ID 的条目会被覆盖），继续吗？')) return;
  const merge = async (store, arr, key) => {
    for (const item of arr || []) {
      if (!item?.id) continue;
      if (store === 'providers') { const old = S.providers.find((x) => x.id === item.id); if (!item.apiKey && old?.apiKey) item.apiKey = old.apiKey; }
      await idb.put(store, item);
      const i = S[key].findIndex((x) => x.id === item.id);
      if (i >= 0) S[key][i] = item; else S[key].push(item);
    }
  };
  await merge('providers', data.providers, 'providers');
  await merge('personas', data.personas, 'personas');
  for (const c of data.conversations || []) (c.messages || []).forEach((m) => { m.pending = false; });
  await merge('conversations', data.conversations, 'convs');
  if (data.settings) { S.settings = { ...DEFAULT_SETTINGS, ...S.settings, ...data.settings }; await saveSettings(); applyTheme(); }
  document.querySelectorAll('.sheet, .sheet-backdrop').forEach((e) => e.remove());
  renderAll(); toast(`导入完成：${(data.conversations || []).length} 个对话`);
}

async function clearAll() {
  if (!confirm('确定清空所有对话、服务和角色吗？建议先导出备份。')) return;
  if (!confirm('再次确认：此操作不可恢复！')) return;
  for (const s of [...STORES, 'kv']) await idb.clear(s);
  localStorage.removeItem('groky.current');
  location.reload();
}

/* ================= 布局 & 事件 ================= */
function openSidebar() { document.body.classList.add('side-open'); renderSide(); }
function closeSidebar() { document.body.classList.remove('side-open'); }

function autoGrow() {
  const ta = $('#input'); ta.style.height = 'auto';
  ta.style.height = Math.min(ta.scrollHeight, window.innerHeight * 0.4) + 'px';
  updateComposer();
}

function bindEvents() {
  fillIcons();
  $('#btn-menu').addEventListener('click', openSidebar);
  $('#scrim').addEventListener('click', closeSidebar);
  $('#btn-new').addEventListener('click', () => newConv());
  $('#btn-new-side').addEventListener('click', () => newConv());
  $('#btn-conv-settings').addEventListener('click', openConvSettings);
  $('#btn-tune').addEventListener('click', openConvSettings);
  $('#btn-settings').addEventListener('click', openSettingsPage);
  $('#btn-user').addEventListener('click', () => { closeSidebar(); openPrefs(); });
  $('#settings-back').addEventListener('click', closeSettingsPage);
  $('#btn-scope').addEventListener('click', () => { S.scopeAll = !S.scopeAll; renderConvList(); });
  $('#conv-search').addEventListener('input', (e) => { S.search = e.target.value; renderConvList(); });
  $('#tool-model').addEventListener('click', openModelPicker);
  $('#tool-persona').addEventListener('click', openPersonaPicker);
  $('#tool-think').addEventListener('click', openThinkPicker);
  $('#tool-ctx').addEventListener('click', openCtxPicker);
  $('#tool-more').addEventListener('click', openMoreMenu);
  $('#tool-mic').addEventListener('click', toggleMic);
  if (!(window.SpeechRecognition || window.webkitSpeechRecognition)) $('#tool-mic').classList.add('unavailable');
  const input = $('#input');
  input.addEventListener('input', autoGrow);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.isComposing && e.keyCode !== 229) {
      const sendKey = S.settings.enterSend ? !e.shiftKey : (e.metaKey || e.ctrlKey);
      if (sendKey) { e.preventDefault(); send(); }
    }
  });
  $('#btn-send').addEventListener('click', () => (S.streaming && S.streaming.convId === S.currentId ? stop() : send()));

  // 左缘右滑打开侧栏 / 左滑关闭
  let sx = null, sy = 0;
  document.addEventListener('touchstart', (e) => { const t = e.touches[0]; sx = t.clientX; sy = t.clientY; }, { passive: true });
  document.addEventListener('touchend', (e) => {
    if (sx == null) return; const t = e.changedTouches[0]; const dx = t.clientX - sx, dy = Math.abs(t.clientY - sy);
    if (dy < 50) { if (sx < 28 && dx > 60) openSidebar(); else if (document.body.classList.contains('side-open') && dx < -60) closeSidebar(); }
    sx = null;
  }, { passive: true });

  // iOS 键盘弹出时保持布局贴合可视区域
  const vv = window.visualViewport;
  if (vv) {
    const root = document.documentElement;
    let raf = 0, lastH = 0;
    const apply = () => {
      raf = 0;
      if (vv.offsetTop && !document.querySelector('.sheet')) window.scrollTo(0, 0);
      const layoutH = root.clientHeight || window.innerHeight;
      const kb = Math.max(0, Math.round(layoutH - vv.height - vv.offsetTop));
      root.style.setProperty('--app-h', vv.height + 'px');
      root.style.setProperty('--vv-h', vv.height + 'px');
      root.style.setProperty('--vv-top', vv.offsetTop + 'px');
      root.style.setProperty('--kb', kb + 'px');
      // 键盘弹出（或可视区明显变矮）时切换为“整张面板可滚动”模式
      const kbOpen = kb > 80 || (isEditable(document.activeElement) && vv.height < layoutH * 0.75);
      root.classList.toggle('kb-open', kbOpen);
      if (kbOpen && Math.abs(vv.height - lastH) > 1) revealFocused(50);
      lastH = vv.height;
    };
    const fit = () => { if (!raf) raf = requestAnimationFrame(apply); };
    vv.addEventListener('resize', fit); vv.addEventListener('scroll', fit); window.addEventListener('orientationchange', fit); apply();
    document.addEventListener('focusout', () => setTimeout(fit, 50));
  }
  // 面板内输入框聚焦时，等键盘动画结束后滚动到可视区中央
  document.addEventListener('focusin', (e) => {
    if (isEditable(e.target) && e.target.closest('.sheet')) { revealFocused(120); revealFocused(400); }
  });
}

async function init() {
  try {
    await openDB();
    const [providers, personas, convs, settings, seeded] = await Promise.all([
      idb.all('providers'), idb.all('personas'), idb.all('conversations'), idb.get('kv', 'settings'), idb.get('kv', 'seeded'),
    ]);
    S.providers = providers.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    S.personas = personas; S.convs = convs;
    S.settings = { ...DEFAULT_SETTINGS, ...(settings || {}) };
    if (!seeded) {
      for (const p of SEED_PERSONAS) { await savePersona(p); S.personas.push(clone(p)); }
      S.settings.defaultPersonaId = 'p-default';
      await saveSettings(); await idb.put('kv', true, 'seeded');
    }
    // 修复上次异常退出时的“生成中”状态
    for (const c of S.convs) for (const m of c.messages) if (m.pending) { m.pending = false; if (!m.content) m.error = '生成被中断'; }
    const last = localStorage.getItem('groky.current');
    S.currentId = S.convs.some((c) => c.id === last) ? last : ([...S.convs].sort((a, b) => b.updatedAt - a.updatedAt)[0]?.id || null);
  } catch (e) {
    console.error(e);
    toast('无法打开本地数据库：' + e.message, 5000);
  }
  if (window.hljs) hljs.configure({ ignoreUnescapedHTML: true });
  applyTheme(); bindEvents(); renderAll();
  document.documentElement.classList.add('ready');
}

init();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW 注册失败', e)));
}
