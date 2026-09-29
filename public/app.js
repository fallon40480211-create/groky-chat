/* groky chat —— 纯前端 AI 聊天客户端。所有数据（含 API Key）只保存在本机 IndexedDB。 */
const APP_VERSION = '1.2.0';

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
  paint: L('<path d="M12 21a9 9 0 1 1 9-9c0 2.5-2 3.5-3.5 3.5H15a2 2 0 0 0-1.5 3.3A1.4 1.4 0 0 1 12 21Z"/><circle cx="7.5" cy="11.5" r="1"/><circle cx="10.5" cy="7.5" r="1"/><circle cx="15.5" cy="8.5" r="1"/>'),
  translate: L('<path d="M4 5h9M8.5 3v2M6 5c.5 3 2.5 5.5 5 7M11 5c-.7 3.5-3 6.5-6.5 8"/><path d="m12 21 4-9 4 9M13.5 18h5"/>'),
  chatdots: L('<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.3A8.5 8.5 0 1 1 21 12Z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/>', 1.9),
  textfmt: L('<path d="M4 19h8M5.5 14 9 5l3.5 9M6.6 11h4.8M15 8h5M15 12h5M15 16h5"/>'),
  pie: L('<path d="M21 12A9 9 0 1 1 12 3v9Z"/><path d="M21 12a9 9 0 0 0-9-9"/>'),
  image: L('<rect x="3" y="3" width="18" height="18" rx="3"/><circle cx="9" cy="9" r="2"/><path d="m21 15-4.5-4.5L6 21"/>'),
  msgsq: L('<path d="M20 4H4v13h4v4l5-4h7Z"/>'),
  refresh: L('<path d="M20 11a8 8 0 0 0-14.3-4.9L4 8M4 4v4h4M4 13a8 8 0 0 0 14.3 4.9L20 16m0 4v-4h-4"/>'),
  vibrate: L('<rect x="8" y="4" width="8" height="16" rx="1.5"/><path d="M4 9l-2 3 2 3M20 9l2 3-2 3"/>'),
  activity: L('<path d="M3 12h4l3-8 4 16 3-8h4"/>'),
  type: L('<path d="M5 6V4h14v2M12 4v16M9 20h6"/>'),
  code: L('<path d="m8 7-5 5 5 5M16 7l5 5-5 5"/>'),
  fontsize: L('<path d="M3 18 8 6l5 12M4.8 14h6.4"/><circle cx="17.5" cy="15.5" r="2.5"/><path d="M20 13v5"/>'),
  arrowdown: L('<path d="M12 5v14M6 13l6 6 6-6"/>'),
  arrowup: L('<path d="M12 19V5M6 11l6-6 6 6"/>'),
  rect: L('<rect x="3" y="7" width="18" height="10" rx="2.5"/>'),
  user: L('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  clock: L('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  dots: '<svg viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="19" cy="12" r="1.7"/></svg>',
  hash: L('<path d="M5 9h15M4 15h15M10 3 8 21M16 3l-2 18"/>'),
  listnum: L('<path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1"/>'),
  wrap: L('<path d="M3 6h18M3 12h15a3 3 0 0 1 0 6h-4M3 18h7"/><path d="m16 16-2 2 2 2"/>'),
  collapse: L('<path d="M12 3v6M9 6l3 3 3-3M12 21v-6M9 18l3-3 3 3M4 12h2M10 12h4M18 12h2"/>'),
  alert: L('<path d="M21 12a8.5 8.5 0 0 1-12.6 7.4L3 21l1.6-5.3A8.5 8.5 0 1 1 21 12Z"/><path d="M12 8v4M12 15.5h.01"/>'),
  sun: L('<circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/>'),
  calendar: L('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  sidebar: L('<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 4v16"/>'),
  wrench: L('<path d="M14.7 6.3a4 4 0 0 0 5 5L21 13l-8 8-3-3 .5-.5a4 4 0 0 0-5-5L3 10.7 6.3 7.4a4 4 0 0 0 5 5"/>'),
  file: L('<path d="M14 3H6v18h12V7Z"/><path d="M14 3v4h4M9 12h6M9 16h6"/>'),
  sparkles: L('<path d="M10 3l1.8 5.2L17 10l-5.2 1.8L10 17l-1.8-5.2L3 10l5.2-1.8Z"/><path d="M18 3v4M16 5h4M18 15v4M16 17h4"/>'),
  download: L('<path d="M12 4v11M7 10l5 5 5-5M4 20h16"/>'),
  upload: L('<path d="M12 20V9M7 14l5-5 5 5M4 4h16"/>'),
  branch: L('<circle cx="6" cy="6" r="2"/><circle cx="18" cy="6" r="2"/><circle cx="12" cy="18" r="2"/><path d="M6 8c0 4 6 4 6 8M18 8c0 4-6 4-6 8"/>'),
  imageoff: L('<path d="M3 3l18 18M21 15V3H9M3 7v14h14"/><path d="m3 17 5-5 3 3"/>'),
  infoc: L('<circle cx="12" cy="12" r="9"/><path d="M12 16v-5M12 8h.01"/>', 1.5),
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
  putRaw: (s, v, k) => tx(s, 'readwrite', (st) => st.put(v, k)), // 保存 Blob（字体 / 背景图）

  del: (s, k) => tx(s, 'readwrite', (st) => st.delete(k)),
  clear: (s) => tx(s, 'readwrite', (st) => st.clear()),
};

/* ================= 状态 ================= */
const DEFAULT_SETTINGS = {
  theme: 'auto', enterSend: false, defaultModel: null, defaultPersonaId: null, maxContext: 0, userName: '', currentAssistantId: null, asstOpen: true,
  // 主题
  themeId: 'default', pureBg: true, customThemes: [],
  // 聊天项显示
  showUserAvatar: false, showUserName: false, showUserTime: false, showUserActions: true, showTitleAvatar: false,
  showModelName: true, showModelTime: false, showProvider: false, showTokenStats: false, showThinking: true,
  // 渲染
  dollarMath: true, mathRender: true, userMarkdown: false, reasoningMarkdown: false, assistantMarkdown: true,
  codeCollapse: false, codeCollapseLines: 20, mobileCodeWrap: false,
  // 行为
  autoCollapseThinking: true, regenDeleteBelow: true, confirmRegen: false, collapseLong: false, keepAwake: false,
  showListDates: true, keepDrawerOnAssistant: false, msgNav: 'scroll',
  // 外观与其他
  language: 'zh-CN', chatFontScale: 100, appFont: 'system', codeFont: 'system', appFontName: '', codeFontName: '',
  autoBottomDelay: 0, bgImage: false, bgMask: 60, composerAlpha: 100, msgStyle: 'bubble', haptics: true,
  retryEnabled: true, retryCount: 2, retryDelay: 2,
};
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
  const err = new Error(`HTTP ${res.status}${res.statusText ? ' ' + res.statusText : ''}${msg ? '：' + String(msg).slice(0, 600) : ''}`);
  err.status = res.status; return err;
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
async function streamChat({ provider, model, system, messages, temperature, think, includeUsage, signal, onDelta }) {
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
      if (type === 'message_start' && j.message?.usage) onDelta({ usage: { input: j.message.usage.input_tokens ?? null } });
      else if (type === 'message_delta' && j.usage) onDelta({ usage: { output: j.usage.output_tokens ?? null } });
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
  if (think) body.reasoning_effort = think;
  if (includeUsage) body.stream_options = { include_usage: true }; // 仅在开启 Token 统计时请求 usage // OpenAI 兼容推理强度（仅推理模型支持）
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
    if (j.usage) onDelta({ usage: { input: j.usage.prompt_tokens ?? null, output: j.usage.completion_tokens ?? null } });
    if (m.reasoning_content) onDelta({ reasoning: m.reasoning_content });
    onDelta({ text: m.content || '' });
    return;
  }
  for await (const ev of sseEvents(res)) {
    if (ev.data === '[DONE]') break;
    let j; try { j = JSON.parse(ev.data); } catch { continue; }
    if (j.error) throw new Error(j.error.message || JSON.stringify(j.error));
    if (j.usage) onDelta({ usage: { input: j.usage.prompt_tokens ?? null, output: j.usage.completion_tokens ?? null } });
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
  const sel = c?.target || personaOf(c)?.model || S.settings.defaultModel;
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
/* ---------- 颜色工具 ---------- */
const hexRgb = (hx) => { let x = String(hx || '').replace('#', ''); if (x.length === 3) x = [...x].map((c) => c + c).join(''); const n = parseInt(x, 16); return Number.isNaN(n) ? [0, 0, 0] : [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const rgbHex = (r) => '#' + r.map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('');
const mix = (a, b, t) => { const x = hexRgb(a), y = hexRgb(b); return rgbHex(x.map((v, i) => v * t + y[i] * (1 - t))); }; // t = a 的占比
const lum = (hx) => { const c = hexRgb(hx).map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
const validHex = (v) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(v || '').trim());

/* ---------- 主题 ---------- */
const PRESET_THEMES = [
  { id: 'default', name: '默认', accent: '#d97757' },
  { id: 'ocean', name: '海霄蓝', accent: '#3f5c96' },
  { id: 'bamboo', name: '竹影绿', accent: '#2f6b4b' },
  { id: 'dusk', name: '暮紫韵', accent: '#5b5497' },
  { id: 'amber', name: '琥珀金', accent: '#7c5518' },
  { id: 'rose', name: '暮霭玫', accent: '#7b4f6b' },
  { id: 'terra', name: '陶砂红', accent: '#80503d' },
  { id: 'ink', name: '纸墨灰', accent: '#111111' },
  { id: 'cherry', name: '樱桃绿', accent: '#4fb36d' },
];
const BASE = {
  light: { bg: '#fcfcfb', bg2: '#ffffff', card: '#f5f5f4', s2: '#f3f3f2', bubble: '#f1f1ef', surface: '#ffffff' },
  dark: { bg: '#151515', bg2: '#1b1b1c', card: '#1f1f21', s2: '#2a2a2c', bubble: '#2a2a2c', surface: '#232325' },
};
function allThemes() { return [...PRESET_THEMES, ...(S.settings.customThemes || [])]; }
function currentTheme() { return allThemes().find((t) => t.id === S.settings.themeId) || PRESET_THEMES[0]; }
function themeVars(theme, mode) {
  const b = BASE[mode];
  let acc = validHex(theme.accent) ? theme.accent : PRESET_THEMES[0].accent;
  if (mode === 'dark') { let i = 0; while (lum(acc) < 0.2 && i++ < 10) acc = mix(acc, '#ffffff', 0.85); }
  else { let i = 0; while (lum(acc) > 0.45 && i++ < 10) acc = mix(acc, '#000000', 0.88); }
  const v = {
    '--accent': acc,
    '--accent-2': mode === 'dark' ? mix(acc, '#ffffff', 0.85) : mix(acc, '#000000', 0.85),
    '--on-accent': lum(acc) > 0.4 ? '#111111' : '#ffffff',
    '--accent-soft': mix(acc, b.bg, mode === 'dark' ? 0.22 : 0.13),
    '--user-bubble': validHex(theme.bubble) ? (mode === 'dark' ? mix(theme.bubble, b.bubble, 0.3) : theme.bubble) : mix(acc, b.bubble, mode === 'dark' ? 0.2 : 0.1),
  };
  if (!S.settings.pureBg) Object.assign(v, {
    '--bg': mix(acc, b.bg, 0.05), '--bg-2': mix(acc, b.bg2, 0.04), '--card': mix(acc, b.card, 0.07), '--surface-2': mix(acc, b.s2, 0.08),
  });
  return v;
}
let appliedVars = [];
function applyTheme() {
  const t = S.settings.theme === 'auto' ? (mqDark.matches ? 'dark' : 'light') : S.settings.theme;
  const root = document.documentElement;
  root.dataset.theme = t;
  $('#hl-light').disabled = t === 'dark';
  $('#hl-dark').disabled = t !== 'dark';
  for (const k of appliedVars) root.style.removeProperty(k);
  const vars = themeVars(currentTheme(), t);
  for (const [k, v] of Object.entries(vars)) root.style.setProperty(k, v);
  appliedVars = Object.keys(vars);
  const color = vars['--bg'] || BASE[t].bg;
  document.querySelectorAll('meta[name=theme-color]').forEach((m) => m.setAttribute('content', color));
}

/* ---------- 字体 / 背景 / 外观 ---------- */
const SYS_FONT = '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", "Segoe UI", sans-serif';
const APP_FONTS = {
  system: { label: '系统默认', css: SYS_FONT },
  rounded: { label: '圆体', css: `ui-rounded, "SF Pro Rounded", "Hiragino Maru Gothic ProN", ${SYS_FONT}` },
  serif: { label: '宋体 / 衬线', css: '"Songti SC", "Noto Serif CJK SC", "Source Han Serif SC", "SimSun", ui-serif, serif' },
  kai: { label: '楷体', css: '"Kaiti SC", "STKaiti", "KaiTi", "Noto Serif CJK SC", serif' },
  local: { label: '本地文件', css: `"GrokyAppLocal", ${SYS_FONT}` },
};
const MONO = 'ui-monospace, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';
const CODE_FONTS = {
  system: { label: '系统等宽', css: MONO },
  courier: { label: 'Courier', css: `"Courier New", Courier, ${MONO}` },
  local: { label: '本地文件', css: `"GrokyCodeLocal", ${MONO}` },
};
const loadedFonts = {};
async function loadLocalFont(kind) {
  const rec = await idb.get('kv', `font-${kind}`).catch(() => null);
  const data = rec?.data || (rec?.blob ? await rec.blob.arrayBuffer() : null);
  if (!data) return false;
  const family = kind === 'app' ? 'GrokyAppLocal' : 'GrokyCodeLocal';
  try {
    if (loadedFonts[kind]) document.fonts.delete(loadedFonts[kind]);
    const ff = new FontFace(family, data);
    await ff.load(); document.fonts.add(ff); loadedFonts[kind] = ff;
    return true;
  } catch (e) { console.warn('字体加载失败', e); toast('字体文件无法解析：' + (e.message || e)); return false; }
}
let bgUrl = null;
async function loadBgImage() {
  if (bgUrl) { URL.revokeObjectURL(bgUrl); bgUrl = null; }
  const rec = S.settings.bgImage ? await idb.get('kv', 'bg-image').catch(() => null) : null;
  const blob = rec instanceof Blob ? rec : rec?.data ? new Blob([rec.data], { type: rec.type || 'image/*' }) : null;
  if (blob) bgUrl = URL.createObjectURL(blob);
  applyPrefs();
}
function applyPrefs() {
  const st = S.settings, root = document.documentElement;
  root.style.setProperty('--font-app', (APP_FONTS[st.appFont] || APP_FONTS.system).css);
  root.style.setProperty('--font-code', (CODE_FONTS[st.codeFont] || CODE_FONTS.system).css);
  root.style.setProperty('--chat-scale', String((Number(st.chatFontScale) || 100) / 100));
  root.style.setProperty('--composer-alpha', `${Math.max(0, Math.min(100, Number(st.composerAlpha ?? 100)))}%`);
  root.style.setProperty('--bg-mask', String(Math.max(0, Math.min(100, Number(st.bgMask ?? 60))) / 100));
  root.style.setProperty('--chat-bg', bgUrl ? `url("${bgUrl}")` : 'none');
  root.classList.toggle('has-bg', !!bgUrl);
  root.classList.toggle('code-wrap-mobile', !!st.mobileCodeWrap);
  root.classList.toggle('msg-plain', st.msgStyle === 'plain');
}
function haptic(ms = 10) { if (S.settings.haptics && navigator.vibrate) { try { navigator.vibrate(ms); } catch { /* ignore */ } } }
mqDark.addEventListener?.('change', applyTheme);

/* ================= Markdown & 数学公式 ================= */
const escHtml = (t) => String(t ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
let katexPromise = null;
function loadKatex() {
  return katexPromise ||= new Promise((res) => {
    document.head.append(h('link', { rel: 'stylesheet', href: 'vendor/katex/katex.min.css' }));
    const sc = h('script', { src: 'vendor/katex/katex.min.js' });
    sc.onload = () => res(true); sc.onerror = () => res(false);
    document.head.append(sc);
  }).then((ok) => { if (ok && !S.streaming) renderMessages(); return ok; });
}
/** 把公式替换成占位符（跳过代码块 / 行内代码），返回 { text, maths } */
function extractMath(text) {
  const st = S.settings, maths = [];
  if (!st.mathRender || !text) return { text, maths };
  const put = (tex, display) => { maths.push({ tex, display }); return `KXMATH${maths.length - 1}XK`; };
  const conv = (seg) => {
    seg = seg.replace(/\$\$([\s\S]+?)\$\$/g, (_, t) => put(t, true));
    seg = seg.replace(/\\\[([\s\S]+?)\\\]/g, (_, t) => put(t, true));
    seg = seg.replace(/\\\(([\s\S]+?)\\\)/g, (_, t) => put(t, false));
    if (st.dollarMath) seg = seg.replace(/(^|[^\\$\w])\$(?!\s)([^\n$]+?)(?<!\s)\$(?![\w$])/g, (_, pre, t) => pre + put(t, false));
    return seg;
  };
  // 按 ``` 代码块与 `行内代码` 切分，只处理普通文本
  const out = text.split(/(```[\s\S]*?(?:```|$)|~~~[\s\S]*?(?:~~~|$)|`[^`\n]*`)/g).map((seg, i) => (i % 2 ? seg : conv(seg))).join('');
  return { text: out, maths };
}
function renderMd(text, { math = true } = {}) {
  const ex = math ? extractMath(text || '') : { text: text || '', maths: [] };
  let html = window.marked ? marked.parse(ex.text, { gfm: true, breaks: true }) : escHtml(ex.text);
  html = window.DOMPurify ? DOMPurify.sanitize(html) : html;
  if (ex.maths.length) {
    if (!window.katex) loadKatex();
    html = html.replace(/KXMATH(\d+)XK/g, (_, i) => {
      const m = ex.maths[Number(i)]; if (!m) return '';
      if (!window.katex) return `<code class="math-pending">${escHtml(m.display ? `$$${m.tex}$$` : `$${m.tex}$`)}</code>`;
      try { return katex.renderToString(m.tex, { displayMode: m.display, throwOnError: false, output: 'html', trust: false }); }
      catch { return `<code>${escHtml(m.tex)}</code>`; }
    });
  }
  return html;
}
const expandedCode = new Set();
function enhanceMd(el, key = '') {
  const st = S.settings;
  const limit = Math.max(1, Number(st.codeCollapseLines) || 20);
  el.querySelectorAll('pre > code').forEach((code, i) => {
    const pre = code.parentElement;
    if (pre.parentElement?.classList.contains('code-wrap')) return;
    const lang = (code.className.match(/language-([\w+#-]+)/) || [])[1] || '';
    try { if (window.hljs) hljs.highlightElement(code); } catch { /* ignore */ }
    const wrap = h('div', { class: 'code-wrap' });
    const btn = h('button', { onclick: () => copyText(code.innerText) }, '复制');
    const lines = code.textContent.replace(/\n$/, '').split('\n').length;
    const head = h('div', { class: 'code-head' }, h('span', {}, lang || 'code'), h('span', { class: 'grow' }));
    pre.replaceWith(wrap);
    if (st.codeCollapse && lines > limit) {
      const k = `${key}:${i}`;
      const toggle = h('button', { class: 'code-toggle' });
      const sync = () => {
        const open = expandedCode.has(k);
        wrap.classList.toggle('collapsed', !open);
        pre.style.maxHeight = open ? '' : `calc(${limit} * 1.5em + 20px)`;
        toggle.textContent = open ? '收起' : `展开（${lines} 行）`;
      };
      toggle.addEventListener('click', () => { expandedCode.has(k) ? expandedCode.delete(k) : expandedCode.add(k); sync(); });
      head.append(toggle); sync();
    }
    head.append(btn);
    wrap.append(head, pre);
  });
  el.querySelectorAll('a[href]').forEach((a) => { a.target = '_blank'; a.rel = 'noopener noreferrer'; });
}
function mdOrText(text, useMd, key, cls = 'md') {
  if (!useMd) return h('div', { class: cls + ' plain-text' }, text);
  const d = h('div', { class: cls, html: renderMd(text) }); enhanceMd(d, key); return d;
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
  if (!S.settings.keepDrawerOnAssistant) closeSidebar();
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
    const g = c.pinned ? '置顶' : (S.settings.showListDates ? dayLabel(c.updatedAt) : '对话');
    if (g !== last) { last = g; if (g !== '对话' || convs[0].pinned) list.append(h('div', { class: 'conv-group' }, g)); }
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
  const ta = $('#title-avatar'); ta.innerHTML = '';
  ta.hidden = !S.settings.showTitleAvatar;
  if (S.settings.showTitleAvatar) ta.append(avatarEl((c ? personaOf(c) : currentAssistant()) || { emoji: '✨' }, 'title-av'));
}

function renderMessages({ keepScroll = false } = {}) {
  const box = $('#messages');
  const c = currentConv();
  const prev = box.scrollTop;
  box.innerHTML = '';
  if (!c || !c.messages.length) { box.append(emptyState()); updateMsgNav(); return; }
  const wrap = h('div', { class: 'msg-wrap' });
  c.messages.forEach((m, i) => wrap.append(msgEl(c, m, i)));
  box.append(wrap);
  if (keepScroll) setScroll(prev); else { S.follow = true; setScroll(box.scrollHeight); }
  updateMsgNav();
}
/* ---------- 滚动跟随 / 自动回到底部 / 消息导航 ---------- */
let progScroll = 0, progY = -1, followTimer = null, navTimer = null;
function setScroll(y) { const box = $('#messages'); progScroll = Date.now(); box.scrollTop = y; progY = box.scrollTop; }
const nearBottom = (box = $('#messages')) => box.scrollHeight - box.scrollTop - box.clientHeight < 120;
function onMessagesScroll() {
  const box = $('#messages');
  // 程序滚动：位置与我们设置的一致（或平滑滚动进行中）；否则视为用户手动滚动
  const programmatic = Math.abs(box.scrollTop - progY) < 2 || (Date.now() - progScroll < 600 && progY === -2);
  if (!programmatic) {
    S.follow = nearBottom(box);
    clearTimeout(followTimer);
    const delay = Number(S.settings.autoBottomDelay) || 0;
    if (!S.follow && S.streaming && delay > 0) {
      followTimer = setTimeout(() => { if (S.streaming) { S.follow = true; setScroll(box.scrollHeight); } }, delay * 1000);
    }
  }
  if (S.settings.msgNav === 'scroll') {
    $('#msg-nav').classList.add('show');
    clearTimeout(navTimer); navTimer = setTimeout(() => $('#msg-nav').classList.remove('show'), 1800);
  }
}
function updateMsgNav() {
  const nav = $('#msg-nav'); if (!nav) return;
  const mode = S.settings.msgNav;
  const has = !!currentConv()?.messages.length;
  nav.hidden = mode === 'off' || !has;
  nav.classList.toggle('show', mode === 'always');
}
function navMsg(dir) {
  const box = $('#messages');
  const items = [...box.querySelectorAll('.msg')];
  if (!items.length) return;
  const top = box.getBoundingClientRect().top;
  const pos = items.map((e) => e.getBoundingClientRect().top - top);
  let target;
  if (dir < 0) target = [...pos].reverse().find((y) => y < -8);
  else target = pos.find((y) => y > 8);
  if (target == null) setScroll(dir < 0 ? 0 : box.scrollHeight);
  else { progScroll = Date.now(); progY = -2; box.scrollBy({ top: target - 4, behavior: 'smooth' }); }
  if (dir > 0 && target == null) S.follow = true;
  haptic(6);
}

function emptyState() {
  if (S.providers.length) return h('div', { class: 'empty blank' });
  return h('div', { class: 'empty' },
    h('h2', {}, '欢迎使用 groky chat'),
    h('p', {}, '先添加一个模型服务（API Key 只保存在本机）'),
    h('button', { class: 'btn primary', onclick: () => openProviders() }, '＋ 添加模型服务'));
}

function fmtStamp(ts) {
  if (!ts) return '';
  const d = new Date(ts), now = new Date();
  const hm = `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  if (d.toDateString() === now.toDateString()) return hm;
  return `${d.getFullYear() === now.getFullYear() ? '' : d.getFullYear() + '-'}${pad2(d.getMonth() + 1)}-${pad2(d.getDate())} ${hm}`;
}
const expandedMsgs = new Set();
const reasonOpen = new Map();
function estimateTokens(t) {
  t = String(t || ''); const cjk = (t.match(/[\u3000-\u9fff\uac00-\ud7af\uff00-\uffef]/g) || []).length;
  return Math.max(0, Math.round(cjk + (t.length - cjk) / 4));
}
function collapsible(el, m, text) {
  if (!S.settings.collapseLong || m.pending) return;
  const long = (text || '').length > 1200 || (text || '').split('\n').length > 24;
  if (!long) return;
  const open = expandedMsgs.has(m.id);
  el.classList.toggle('long-collapsed', !open);
  el.append(h('button', { class: 'long-toggle', onclick: () => { open ? expandedMsgs.delete(m.id) : expandedMsgs.add(m.id); renderMessages({ keepScroll: true }); } }, open ? '收起' : '展开全文'));
}
function msgEl(c, m, idx) {
  const st = S.settings;
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
    const uname = (st.userName || '').trim() || '我';
    if (st.showUserAvatar || st.showUserName || st.showUserTime) {
      el.append(h('div', { class: 'msg-head user-head' },
        st.showUserTime ? h('span', { class: 'msg-time' }, fmtStamp(m.createdAt)) : null,
        st.showUserName ? h('span', { class: 'msg-name' }, uname) : null,
        st.showUserAvatar ? h('span', { class: 'avatar user-av' }, [...uname][0].toUpperCase()) : null));
    }
    const bubble = h('div', { class: 'bubble' + (st.userMarkdown ? ' md-bubble' : '') }, mdOrText(m.content, st.userMarkdown, m.id, 'md'));
    el.append(bubble);
    collapsible(bubble, m, m.content);
    if (st.showUserActions) {
      el.append(h('div', { class: 'msg-actions' },
        h('button', { 'aria-label': '复制', title: '复制', onclick: () => copyText(m.content) }, icon('copy')),
        !busy && h('button', { 'aria-label': '编辑并重发', title: '编辑并重发', onclick: () => { S.editingMsgId = m.id; renderMessages(); } }, icon('edit')),
        !busy && h('button', { 'aria-label': '删除', title: '删除', onclick: () => deleteMsg(c, m) }, icon('trash'))));
    }
    return el;
  }

  const persona = personaOf(c);
  const prov = S.providers.find((p) => p.id === m.providerId);
  el.append(h('div', { class: 'msg-head' }, avatarEl(persona || { emoji: '✨' }, 'avatar'),
    st.showModelName ? h('span', { class: 'msg-name' }, m.model || 'assistant', st.showProvider && prov ? h('span', { class: 'msg-prov' }, ` | ${prov.name}`) : null) : null,
    st.showModelTime ? h('span', { class: 'msg-time' }, fmtStamp(m.createdAt)) : null));
  if (m.reasoning && st.showThinking) {
    const thinking = m.pending && !m.content;
    const open = reasonOpen.has(m.id) ? reasonOpen.get(m.id) : (st.autoCollapseThinking ? thinking : true);
    const det = h('details', { class: 'reasoning', open },
      h('summary', {}, thinking ? '思考中…' : '思考过程'), mdOrText(m.reasoning, st.reasoningMarkdown, m.id + 'r', 'r-body'));
    det.addEventListener('toggle', () => { if (det.open !== open || reasonOpen.has(m.id)) reasonOpen.set(m.id, det.open); });
    el.append(det);
  }
  if (m.content) {
    const body = mdOrText(m.content, st.assistantMarkdown, m.id, 'md');
    el.append(body); collapsible(body, m, m.content);
  } else if (m.pending && (!m.reasoning || !st.showThinking)) {
    el.append(h('div', { class: 'typing' }, h('i'), h('i'), h('i')));
  }
  if (m.retrying) el.append(h('div', { class: 'msg-note' }, m.retrying));
  if (m.error) el.append(h('div', { class: 'msg-error' }, m.error));
  if (m.stopped) el.append(h('div', { class: 'msg-note' }, '已停止生成'));
  if (!m.pending && st.showTokenStats && (m.usage || m.content)) {
    const u = m.usage || { input: null, output: estimateTokens(m.content), estimated: true };
    el.append(h('div', { class: 'msg-stats' },
      `${u.estimated ? '估算 · ' : ''}${u.input != null ? `输入 ${u.input} · ` : ''}输出 ${u.output ?? '—'} tokens${m.ctxCount != null ? ` · 上下文 ${m.ctxCount} 条` : ''}`));
  }
  if (!m.pending) {
    el.append(h('div', { class: 'msg-actions' },
      m.content && h('button', { 'aria-label': '复制', title: '复制', onclick: () => copyText(m.content) }, icon('copy')),
      !busy && h('button', { 'aria-label': '重新生成', title: '重新生成', onclick: () => regenerate(c, m) }, icon('redo')),
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
    const old = box.querySelector(`.msg[data-id="${m.id}"]`);
    const idx = c.messages.indexOf(m);
    if (old && idx >= 0) { const n = msgEl(c, m, idx); n.style.animation = 'none'; old.replaceWith(n); }
    if (S.follow !== false) setScroll(box.scrollHeight);
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
    target: null, // 为空时依次使用：助手默认模型 → 全局默认模型
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
  input.value = ''; autoGrow(); haptic(8);
  c.messages.push({ id: uid(), role: 'user', content: text, createdAt: Date.now() });
  if (!c.title || c.title === '新对话') c.title = text.replace(/\s+/g, ' ').slice(0, 24);
  await generate(c);
}

let wakeLock = null;
async function acquireWake() {
  if (!S.settings.keepAwake || !('wakeLock' in navigator) || wakeLock) return;
  try { wakeLock = await navigator.wakeLock.request('screen'); wakeLock.addEventListener?.('release', () => { wakeLock = null; }); } catch { wakeLock = null; }
}
function releaseWake() { try { wakeLock?.release(); } catch { /* ignore */ } wakeLock = null; }
document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible' && S.streaming) acquireWake(); });
const isRetryable = (e) => e instanceof TypeError || /Failed to fetch|Load failed|NetworkError/i.test(e?.message || '') || e?.status === 429 || e?.status >= 500;
const sleepAbortable = (ms, signal) => new Promise((res, rej) => {
  const t = setTimeout(res, ms);
  signal.addEventListener('abort', () => { clearTimeout(t); rej(Object.assign(new Error('aborted'), { name: 'AbortError' })); }, { once: true });
});

async function generate(c, { at = null } = {}) {
  const t = resolveTarget(c);
  if (!t) { toast('请先添加模型服务'); openProviders(); return; }
  if (!c.target) c.target = { providerId: t.provider.id, model: t.model };
  const st = S.settings;
  const asst = { id: uid(), role: 'assistant', content: '', reasoning: '', model: t.model, providerId: t.provider.id, createdAt: Date.now(), pending: true };
  const base = at == null ? c.messages : c.messages.slice(0, at);
  const history = base.filter((m) => !m.error || m.content).map((m) => ({ role: m.role, content: m.content }));
  const limit = Number(c.maxContext ?? st.maxContext) || 0;
  const ctx = limit > 0 ? history.slice(-limit) : history;
  asst.ctxCount = ctx.length;
  if (at == null) c.messages.push(asst); else c.messages.splice(at, 1, asst);
  c.updatedAt = Date.now();
  await saveConv(c);
  const controller = new AbortController();
  S.streaming = { convId: c.id, controller, msgId: asst.id };
  S.follow = true;
  renderAll();
  if (at != null) { const el = $(`.msg[data-id="${asst.id}"]`); el?.scrollIntoView({ block: 'nearest' }); S.follow = false; }
  acquireWake();
  const system = systemPromptOf(c);
  const usage = { input: null, output: null };
  const maxRetry = st.retryEnabled ? Math.max(0, Math.min(10, Number(st.retryCount) || 0)) : 0;
  const delay = Math.max(0, Number(st.retryDelay) || 0);
  try {
    for (let attempt = 0; ; attempt++) {
      try {
        await streamChat({
          provider: t.provider, model: t.model, system, messages: ctx,
          temperature: temperatureOf(c), think: c.think || null, includeUsage: !!st.showTokenStats, signal: controller.signal,
          onDelta: (d) => {
            if (d.text) asst.content += d.text;
            if (d.reasoning) asst.reasoning += d.reasoning;
            if (d.usage) { if (d.usage.input != null) usage.input = d.usage.input; if (d.usage.output != null) usage.output = d.usage.output; }
            if (d.text || d.reasoning) { asst.retrying = ''; scheduleMsgUpdate(c, asst); }
          },
        });
        break;
      } catch (e) {
        if (e.name === 'AbortError' || asst.content || asst.reasoning || attempt >= maxRetry || !isRetryable(e)) throw e;
        asst.retrying = `请求失败（${String(e.message).slice(0, 60)}），${delay} 秒后自动重试（${attempt + 1}/${maxRetry}）…`;
        scheduleMsgUpdate(c, asst);
        await sleepAbortable(delay * 1000, controller.signal);
        asst.retrying = `正在重试（${attempt + 1}/${maxRetry}）…`; scheduleMsgUpdate(c, asst);
      }
    }
    if (!asst.content && !asst.reasoning) asst.error = '模型没有返回任何内容。';
  } catch (e) {
    if (e.name === 'AbortError') asst.stopped = true;
    else asst.error = friendlyError(e);
  } finally {
    asst.pending = false; asst.retrying = ''; c.updatedAt = Date.now();
    if (usage.input != null || usage.output != null) asst.usage = { ...usage, estimated: false };
    else if (asst.content || asst.reasoning) asst.usage = { input: estimateTokens(system + ctx.map((m) => m.content).join('\n')), output: estimateTokens(asst.content + asst.reasoning), estimated: true };
    S.streaming = null;
    releaseWake(); clearTimeout(followTimer);
    await saveConv(c);
    if (rafPending) { cancelAnimationFrame(rafPending); rafPending = null; }
    if (S.currentId === c.id) renderMessages({ keepScroll: S.follow === false });
    renderConvList(); updateComposer();
    if (!asst.error) haptic(12);
  }
}

function stop() { S.streaming?.controller.abort(); }

async function regenerate(c, m = null) {
  if (S.streaming) return;
  let i = m ? c.messages.indexOf(m) : c.messages.length - 1;
  if (i < 0) return;
  if (c.messages[i].role !== 'assistant') i = c.messages.length; // 最后一条是用户消息：直接生成
  if (S.settings.confirmRegen && !confirm('确定重新生成这条回复吗？')) return;
  const isLast = i >= c.messages.length - 1;
  if (S.settings.regenDeleteBelow || isLast) {
    c.messages = c.messages.slice(0, i);
    if (!c.messages.length) return;
    await generate(c);
  } else {
    await generate(c, { at: i }); // 仅替换这条回复，保留下面的消息
  }
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
function openPersonas() { return openAssistantsPage(); }

function editPersona(p, onDone) {
  const isNew = !p.id;
  const emoji = h('input', { type: 'text', maxlength: 8, placeholder: '🙂', 'aria-label': '头像 Emoji', style: { width: '64px', textAlign: 'center', flex: 'none' } }); emoji.value = p.emoji ?? '🙂';
  const name = h('input', { type: 'text', placeholder: '助手名称' }); name.value = p.name || '';
  const prompt = h('textarea', { placeholder: '系统提示词，例如：你是一位温柔耐心的英语老师……', style: { minHeight: '180px' } }); prompt.value = p.prompt || '';
  const temp = temperatureControl(p.temperature);
  const msel = modelSelect(p.model || null, { allowDefault: true });
  const isDefault = h('input', { type: 'checkbox', class: 'switch' }); isDefault.checked = !isNew && S.settings.defaultPersonaId === p.id;
  const sh = openSheet({
    title: isNew ? '新建助手' : '编辑助手', back: true,
    body: [
      h('div', { class: 'field' }, h('label', {}, '头像 Emoji（留空显示名称首字）与名称'), h('div', { class: 'input-row' }, emoji, name)),
      field('系统提示 System Prompt', prompt),
      h('div', { class: 'field' }, h('label', {}, '默认温度'), temp.el),
      field('默认模型', msel, '使用该助手的新对话默认用这个模型（对话里仍可切换）'),
      h('div', { class: 'switch-row' }, h('div', { class: 'sr-text' }, '设为新对话默认助手'), isDefault),
      !isNew ? h('button', {
        class: 'btn danger', style: { width: '100%', marginTop: '10px' }, onclick: async () => {
          if (!confirm(`删除助手“${p.name}”？`)) return;
          S.personas = S.personas.filter((x) => x.id !== p.id); await idb.del('personas', p.id);
          if (S.settings.defaultPersonaId === p.id) { S.settings.defaultPersonaId = null; await saveSettings(); }
          sh.close(); onDone?.(); renderAll();
        },
      }, '删除助手') : null,
    ],
    footer: [h('button', { class: 'btn', onclick: () => sh.close() }, '取消'), h('button', {
      class: 'btn primary', onclick: async () => {
        const d = { ...p, emoji: emoji.value.trim(), name: name.value.trim() || '未命名助手', prompt: prompt.value, temperature: temp.get(), model: parseModelValue(msel.value) };
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
      row('bot', '助手', { value: `${S.personas.length} 个`, onClick: openAssistantsPage })),
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
  openSheet({ title: '颜色模式', body: [h('div', { class: 'field' }, seg([['auto', '跟随系统'], ['light', '浅色'], ['dark', '深色']], st.theme, async (v) => { await setSetting('theme', v); }))] });
}

/* ================= 子页面框架（Kelivo 风格：返回箭头 + 分组圆角卡片） ================= */
const pages = [];
function openPage({ title, render, actions = [] }) {
  closeSidebar();
  const body = h('div', { class: 'page-body' });
  const back = h('button', { class: 'icon-btn page-back', 'aria-label': '返回' }, icon('arrowleft'));
  const el = h('section', { class: 'page subpage', role: 'dialog', 'aria-label': title },
    h('header', { class: 'page-head' }, back, h('h1', {}, title), h('span', { class: 'grow' }),
      actions.map((a) => h('button', { class: 'icon-btn', 'aria-label': a.label, onclick: a.onClick }, icon(a.icon)))),
    body);
  el.style.zIndex = String(41 + pages.length);
  const pg = { el, title, refresh: () => { const y = body.scrollTop; body.innerHTML = ''; render(body, pg); body.scrollTop = y; }, close: () => {
    el.classList.remove('show'); const i = pages.indexOf(pg); if (i >= 0) pages.splice(i, 1);
    setTimeout(() => el.remove(), 260);
  } };
  back.addEventListener('click', pg.close);
  $('#app').append(el); pages.push(pg); pg.refresh();
  requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add('show')));
  return pg;
}
function refreshPages() { for (const pg of pages) pg.refresh(); if (!$('#settings-page').hidden) renderSettingsPage(); }
async function setSetting(key, val, { silent = false } = {}) {
  S.settings[key] = val; await saveSettings();
  applyTheme(); applyPrefs();
  if (!silent) { renderSide(); renderHeader(); renderMessages({ keepScroll: true }); updateComposer(); refreshPages(); }
}
function card(...rows) { return h('div', { class: 'set-card' }, rows.flat().filter(Boolean)); }
function navRow(ic, label, { value, onClick, soon, info } = {}) {
  return h('button', { class: 'set-row' + (soon ? ' soon' : ''), disabled: !!soon, onclick: onClick, 'aria-label': label },
    icon(ic), h('span', { class: 'sr-label' }, label, info ? infoBtn(info) : null),
    h('span', { class: 'sr-value' }, soon ? '即将推出' : (value ?? '')), soon ? null : icon('chevright'));
}
function infoBtn(text) {
  return h('span', { class: 'info-btn', role: 'button', tabindex: 0, 'aria-label': '说明', onclick: (e) => { e.stopPropagation(); e.preventDefault(); toast(text, 4200); } }, icon('infoc'));
}
function toggleRow(ic, label, key, { info, soon, sub, onChange } = {}) {
  const sw = h('input', { type: 'checkbox', class: 'switch', 'aria-label': label, disabled: !!soon, 'data-key': key });
  sw.checked = soon ? false : !!S.settings[key];
  sw.addEventListener('change', async () => { haptic(8); if (onChange) await onChange(sw.checked); else await setSetting(key, sw.checked); });
  return h('label', { class: 'set-row toggle' + (soon ? ' soon' : '') }, icon(ic),
    h('span', { class: 'sr-label' }, label, sub ? h('small', {}, sub) : null, soon ? h('small', {}, '即将推出') : null),
    info ? infoBtn(info) : null, sw);
}
function numberRow(ic, label, key, { min = 1, max = 999, unit = '' } = {}) {
  const inp = h('input', { type: 'number', inputmode: 'numeric', min, max, class: 'num-input', 'aria-label': label });
  inp.value = S.settings[key];
  inp.addEventListener('change', async () => { let v = Math.round(Number(inp.value)); if (!Number.isFinite(v)) v = S.settings[key]; v = Math.max(min, Math.min(max, v)); inp.value = v; await setSetting(key, v); });
  return h('div', { class: 'set-row' }, icon(ic), h('span', { class: 'sr-label' }, label), inp, unit ? h('span', { class: 'sr-unit' }, unit) : null);
}
function sliderSheet(title, key, { min = 0, max = 100, step = 1, fmt = (v) => `${v}%`, hint } = {}) {
  const range = h('input', { type: 'range', min, max, step, 'aria-label': title }); range.value = S.settings[key];
  const out = h('output', {}, fmt(Number(range.value)));
  range.addEventListener('input', () => { out.textContent = fmt(Number(range.value)); S.settings[key] = Number(range.value); applyPrefs(); });
  range.addEventListener('change', () => setSetting(key, Number(range.value)));
  openSheet({ title, onClose: () => setSetting(key, Number(range.value)), body: [h('div', { class: 'range-row big' }, range, out), hint ? h('p', { class: 'muted' }, hint) : null] });
}

/* ---------- 偏好设置 ---------- */
const bubbleLabel = { bubble: '气泡', plain: '纯文本' };
const hasVibrate = () => typeof navigator.vibrate === 'function';
function openPrefs() {
  return openPage({ title: '偏好设置', render: (body) => {
    const st = S.settings;
    const persona = S.personas.find((x) => x.id === st.defaultPersonaId);
    body.append(card(
      navRow('paint', '主题设置', { value: currentTheme().name, onClick: openThemePage }),
      navRow('translate', '应用语言', { value: '简体中文', onClick: openLanguageSheet }),
      navRow('chatdots', '聊天项显示', { onClick: openDisplayPage }),
      navRow('textfmt', '渲染设置', { onClick: openRenderPage }),
      navRow('pie', '行为与启动', { onClick: openBehaviorPage }),
      navRow('image', '图片处理', { soon: true }),
      navRow('msgsq', '消息样式', { value: bubbleLabel[st.msgStyle] || '气泡', onClick: () => choiceSheet('消息样式', Object.entries(bubbleLabel).map(([k, l]) => ({ label: l, sub: k === 'bubble' ? '用户消息显示在右侧气泡中' : '用户消息与助手消息一样平铺显示', selected: st.msgStyle === k, onPick: () => setSetting('msgStyle', k) }))) }),
      navRow('refresh', '自动重试', { value: st.retryEnabled ? `${st.retryCount} 次 · ${st.retryDelay}s` : '关闭', onClick: openRetryPage }),
      navRow('vibrate', '触觉反馈', { value: !hasVibrate() ? '不支持' : st.haptics ? '开启' : '关闭', onClick: openHapticsSheet }),
      navRow('activity', '后台任务', { soon: true }),
      navRow('type', '应用字体', { value: st.appFont === 'local' ? (st.appFontName || '本地文件') : APP_FONTS[st.appFont]?.label, onClick: () => openFontSheet('app') }),
      navRow('code', '代码字体', { value: st.codeFont === 'local' ? (st.codeFontName || '本地文件') : CODE_FONTS[st.codeFont]?.label, onClick: () => openFontSheet('code') }),
      navRow('fontsize', '聊天字体大小', { value: `${st.chatFontScale}%`, onClick: () => sliderSheet('聊天字体大小', 'chatFontScale', { min: 80, max: 150, step: 5, hint: '只影响聊天消息，不影响界面其他文字。' }) }),
      navRow('arrowdown', '自动回到底部延迟', { value: st.autoBottomDelay ? `${st.autoBottomDelay}s` : '关闭', onClick: () => sliderSheet('自动回到底部延迟', 'autoBottomDelay', { min: 0, max: 30, step: 1, fmt: (v) => (v ? `${v}s` : '关闭'), hint: '生成回复时如果你向上翻看，停止滚动这么多秒后自动回到底部继续跟随；0 表示不自动回到底部。' }) }),
      navRow('image', '背景图片', { value: st.bgImage ? '已设置' : '未设置', onClick: openBgSheet }),
      navRow('image', '背景图片遮罩透明度', { value: `${st.bgMask}%`, onClick: () => sliderSheet('背景图片遮罩透明度', 'bgMask', { hint: '在背景图片上叠加一层背景色，数值越大图片越淡、文字越清楚。' }) }),
      navRow('rect', '输入框背景透明度', { value: `${st.composerAlpha}%`, onClick: () => sliderSheet('输入框背景透明度', 'composerAlpha', { hint: '100% 为不透明；设置背景图片后调低可以透出图片。' }) }),
    ));
    body.append(h('div', { class: 'set-title' }, '输入与对话'), card(
      navRow('user', '我的名字', { value: (st.userName || '').trim() || '我', onClick: async () => { const t = await askText('我的名字', st.userName || '', { placeholder: '我' }); if (t != null) await setSetting('userName', t.trim().slice(0, 20)); } }),
      toggleRow('msgsq', '回车键发送', 'enterSend', { sub: '关闭时回车换行，Ctrl/⌘ + 回车发送' }),
      navRow('layers', '默认上下文消息数', { value: Number(st.maxContext) ? `最近 ${st.maxContext} 条` : '全部历史', onClick: () => choiceSheet('默认上下文消息数', [[0, '全部历史'], [6, '最近 6 条'], [10, '最近 10 条'], [20, '最近 20 条'], [40, '最近 40 条']].map(([v, l]) => ({ label: l, selected: Number(st.maxContext || 0) === v, onPick: () => setSetting('maxContext', v) }))) }),
      navRow('bot', '新对话默认助手', { value: persona ? persona.name : '无', onClick: () => choiceSheet('新对话默认助手', [{ label: '（无）', selected: !persona, onPick: () => setSetting('defaultPersonaId', null) }, ...S.personas.map((p) => ({ label: p.name, icon: avatarEl(p), selected: persona?.id === p.id, onPick: () => setSetting('defaultPersonaId', p.id) }))]) }),
    ));
  } });
}
function openLanguageSheet() {
  choiceSheet('应用语言', [
    { label: '简体中文', selected: true, onPick: () => {} },
    { label: '繁體中文', sub: '即将推出', disabled: true },
    { label: 'English', sub: '即将推出', disabled: true },
  ]);
}
function openHapticsSheet() {
  const sw = h('input', { type: 'checkbox', class: 'switch', 'aria-label': '触觉反馈' }); sw.checked = !!S.settings.haptics;
  sw.addEventListener('change', async () => { await setSetting('haptics', sw.checked); haptic(15); });
  openSheet({ title: '触觉反馈', body: [
    h('div', { class: 'switch-row' }, h('div', { class: 'sr-text' }, '启用触觉反馈', h('small', {}, '发送消息、回复完成、切换开关时轻微振动')), sw),
    h('p', { class: 'muted' }, hasVibrate() ? '当前浏览器支持振动接口（navigator.vibrate）。' : '当前浏览器不支持振动接口：iOS Safari / 主屏幕 Web App 均未开放 navigator.vibrate，开启后在 iPhone 上不会有效果；Android Chrome 可用。'),
  ] });
}
function openRetryPage() {
  openPage({ title: '自动重试', render: (body) => {
    body.append(card(
      toggleRow('refresh', '网络错误时自动重试', 'retryEnabled', { sub: '网络失败、429 限流或 5xx 服务端错误，且还没收到任何内容时' }),
      numberRow('listnum', '最多重试次数', 'retryCount', { min: 1, max: 10, unit: '次' }),
      numberRow('clock', '重试间隔', 'retryDelay', { min: 0, max: 60, unit: '秒' }),
    ), h('p', { class: 'muted page-note' }, '401/403/400 等请求错误不会重试；点“停止”可随时取消等待中的重试。'));
  } });
}
async function openFontSheet(kind) {
  const presets = kind === 'app' ? APP_FONTS : CODE_FONTS;
  const key = kind === 'app' ? 'appFont' : 'codeFont', nameKey = kind === 'app' ? 'appFontName' : 'codeFontName';
  const rec = await idb.get('kv', `font-${kind}`).catch(() => null);
  const file = h('input', { type: 'file', accept: '.ttf,.otf,.woff,.woff2,font/*', style: { display: 'none' }, 'aria-label': '选择字体文件' });
  file.addEventListener('change', async () => {
    const f = file.files[0]; file.value = ''; if (!f) return;
    if (f.size > 30 * 1048576) return toast('字体文件过大（>30MB）');
    // 以 ArrayBuffer 形式保存（部分 WebKit 版本不支持在 IndexedDB 中存 Blob）
    await idb.putRaw('kv', { name: f.name, type: f.type, data: await f.arrayBuffer() }, `font-${kind}`);
    if (await loadLocalFont(kind)) { await setSetting(nameKey, f.name.replace(/\.(ttf|otf|woff2?)$/i, ''), { silent: true }); await setSetting(key, 'local'); sh.close(); toast('已应用本地字体'); }
  });
  const items = Object.entries(presets).filter(([k]) => k !== 'local').map(([k, v]) => ({ label: v.label, sub: h('span', { style: { fontFamily: v.css } }, kind === 'app' ? '中文 Aa 123 永远年轻' : 'const x = 0x1F; // 0Oo lI1'), selected: S.settings[key] === k, onPick: () => setSetting(key, k) }));
  if (rec?.data || rec?.blob) items.push({ label: `本地文件：${rec.name}`, selected: S.settings[key] === 'local', onPick: async () => { if (await loadLocalFont(kind)) setSetting(key, 'local'); } });
  const sh = choiceSheet(kind === 'app' ? '应用字体' : '代码字体', items, { note: '本地字体文件保存在本机 IndexedDB 中，不会上传。支持 ttf / otf / woff / woff2。', footer: h('div', { class: 'input-row', style: { marginTop: '12px' } },
    h('button', { class: 'btn', style: { flex: 1 }, onclick: () => file.click() }, '上传本地字体'),
    (rec?.data || rec?.blob) ? h('button', { class: 'btn danger', style: { flex: 1 }, onclick: async () => { await idb.del('kv', `font-${kind}`); if (S.settings[key] === 'local') await setSetting(key, 'system'); sh.close(); toast('已移除本地字体'); } }, '移除本地字体') : null, file) });
}
function openBgSheet() {
  const file = h('input', { type: 'file', accept: 'image/*', style: { display: 'none' }, 'aria-label': '选择背景图片' });
  file.addEventListener('change', async () => {
    const f = file.files[0]; file.value = ''; if (!f) return;
    if (f.size > 20 * 1048576) return toast('图片过大（>20MB）');
    await idb.putRaw('kv', { name: f.name, type: f.type, data: await f.arrayBuffer() }, 'bg-image'); await setSetting('bgImage', true, { silent: true }); await loadBgImage(); refreshPages(); sh.close(); toast('已设置背景图片');
  });
  const sh = openSheet({ title: '背景图片', body: [
    h('p', { class: 'muted' }, '图片只保存在本机，显示在聊天区域后方。可在“背景图片遮罩透明度”中调整清晰度。'),
    h('div', { class: 'input-row' },
      h('button', { class: 'btn', style: { flex: 1 }, onclick: () => file.click() }, S.settings.bgImage ? '更换图片' : '选择图片'),
      S.settings.bgImage ? h('button', { class: 'btn danger', style: { flex: 1 }, onclick: async () => { await idb.del('kv', 'bg-image'); await setSetting('bgImage', false, { silent: true }); await loadBgImage(); refreshPages(); sh.close(); } }, '移除') : null, file),
  ] });
}

/* ---------- 主题设置 ---------- */
function themeDot(t, extra = '') {
  const d = h('span', { class: 'theme-dot' + extra }); d.style.setProperty('--dot', t.accent);
  if (t.bubble) d.style.setProperty('--ring', t.bubble);
  return d;
}
function openThemePage() {
  openPage({ title: '主题设置', actions: [{ icon: 'tune', label: '颜色模式', onClick: openThemeSheet }], render: (body) => {
    const st = S.settings;
    body.append(card(toggleRow('paint', '纯色背景', 'pureBg', { sub: '仅气泡与强调色随主题变化；关闭后背景也会带上主题色调' })));
    body.append(h('div', { class: 'set-card theme-list', style: { marginTop: '14px' } }, PRESET_THEMES.map((t) => h('button', {
      class: 'set-row theme-row' + (st.themeId === t.id ? ' on' : ''), 'aria-pressed': String(st.themeId === t.id), 'data-theme-id': t.id, onclick: () => setSetting('themeId', t.id),
    }, themeDot(t), h('span', { class: 'sr-label' }, t.name), st.themeId === t.id ? icon('check') : null))));
    const imp = h('input', { type: 'file', accept: 'application/json,.json', style: { display: 'none' }, 'aria-label': '导入主题文件' });
    imp.addEventListener('change', async () => { const f = imp.files[0]; imp.value = ''; if (f) await importThemes(f); });
    body.append(h('div', { class: 'set-title with-actions' }, h('span', {}, '自定义主题'), h('span', { class: 'grow' }),
      h('button', { class: 'icon-btn small', 'aria-label': '新建主题', onclick: () => editTheme(null) }, icon('plus')),
      h('button', { class: 'icon-btn small', 'aria-label': '导入主题', onclick: () => imp.click() }, icon('download')),
      h('button', { class: 'icon-btn small', 'aria-label': '导出主题', onclick: exportThemes }, icon('upload')), imp));
    const cts = st.customThemes || [];
    body.append(cts.length ? h('div', { class: 'set-card' }, cts.map((t) => h('div', { class: 'set-row theme-row custom' + (st.themeId === t.id ? ' on' : ''), 'data-theme-id': t.id },
      h('button', { class: 'theme-pick', 'aria-label': `使用主题 ${t.name}`, onclick: () => setSetting('themeId', t.id) }, themeDot(t, ' two'), h('span', { class: 'sr-label' }, t.name)),
      st.themeId === t.id ? icon('check') : null,
      h('button', { class: 'icon-btn small', 'aria-label': `复制主题 ${t.name}`, onclick: () => saveTheme({ ...t, id: uid(), name: `${t.name} 副本` }) }, icon('copy')),
      h('button', { class: 'icon-btn small', 'aria-label': `编辑主题 ${t.name}`, onclick: () => editTheme(t) }, icon('pencil')),
      h('button', { class: 'icon-btn small danger', 'aria-label': `删除主题 ${t.name}`, onclick: async () => {
        if (!confirm(`删除主题“${t.name}”？`)) return;
        S.settings.customThemes = cts.filter((x) => x.id !== t.id);
        await setSetting('themeId', st.themeId === t.id ? 'default' : st.themeId);
      } }, icon('trash'))))) : h('p', { class: 'muted page-note' }, '还没有自定义主题。点 ＋ 用取色器创建，或导入 JSON 主题文件。'));
  } });
}
async function saveTheme(t) {
  const list = [...(S.settings.customThemes || [])];
  const i = list.findIndex((x) => x.id === t.id);
  if (i >= 0) list[i] = t; else list.push(t);
  S.settings.customThemes = list;
  await setSetting('themeId', t.id);
}
function editTheme(t) {
  const isNew = !t;
  const d = t ? { ...t } : { id: uid(), name: '', accent: currentTheme().accent, bubble: '' };
  const name = h('input', { type: 'text', placeholder: '主题名称', maxlength: 20 }); name.value = d.name;
  const colorPair = (val, label) => {
    const picker = h('input', { type: 'color', class: 'color-input', 'aria-label': label }); picker.value = validHex(val) ? (val.length === 4 ? '#' + [...val.slice(1)].map((c) => c + c).join('') : val) : '#d97757';
    const hex = h('input', { type: 'text', class: 'hex-input', 'aria-label': label + '（十六进制）', maxlength: 7, autocapitalize: 'off', spellcheck: false }); hex.value = picker.value;
    picker.addEventListener('input', () => { hex.value = picker.value; preview(); });
    hex.addEventListener('input', () => { if (validHex(hex.value)) { picker.value = hex.value.length === 4 ? '#' + [...hex.value.slice(1)].map((c) => c + c).join('') : hex.value; preview(); } });
    return { picker, hex, row: h('div', { class: 'input-row color-row' }, picker, hex) };
  };
  const acc = colorPair(d.accent, '强调色');
  const useBubble = h('input', { type: 'checkbox', class: 'switch', 'aria-label': '自定义气泡颜色' }); useBubble.checked = validHex(d.bubble);
  const bub = colorPair(d.bubble || mix(d.accent, '#f1f1ef', 0.12), '气泡颜色');
  const pv = h('div', { class: 'theme-preview' });
  const preview = () => {
    const tmp = { accent: acc.picker.value, bubble: useBubble.checked ? bub.picker.value : '' };
    const v = themeVars(tmp, document.documentElement.dataset.theme || 'light');
    pv.innerHTML = '';
    pv.append(h('div', { class: 'pv-bubble', style: { background: v['--user-bubble'] } }, '你好，这是我的消息'),
      h('div', { class: 'pv-row' }, h('span', { class: 'pv-switch', style: { background: v['--accent'] } }), h('span', { class: 'pv-send', style: { background: v['--accent'], color: v['--on-accent'] } }, '↑'), h('span', { class: 'pv-link', style: { color: v['--accent'] } }, '链接与高亮')));
    bub.row.style.display = useBubble.checked ? '' : 'none';
  };
  useBubble.addEventListener('change', preview);
  preview();
  const sh = openSheet({ title: isNew ? '新建主题' : '编辑主题', back: true, body: [
    field('名称', name), field('强调色（开关、发送按钮、高亮）', acc.row),
    h('div', { class: 'switch-row' }, h('div', { class: 'sr-text' }, '自定义气泡颜色', h('small', {}, '关闭时由强调色自动生成')), useBubble), bub.row,
    h('div', { class: 'field' }, h('label', {}, '预览'), pv),
  ], footer: [h('button', { class: 'btn', onclick: () => sh.close() }, '取消'), h('button', { class: 'btn primary', onclick: async () => {
    if (!validHex(acc.picker.value)) return toast('颜色无效');
    await saveTheme({ id: d.id, name: name.value.trim() || '自定义主题', accent: acc.picker.value, bubble: useBubble.checked ? bub.picker.value : '' });
    sh.close(); toast('主题已保存');
  } }, '保存')] });
}
function exportThemes() {
  const themes = S.settings.customThemes || [];
  if (!themes.length) return toast('没有可导出的自定义主题');
  const blob = new Blob([JSON.stringify({ app: 'groky-chat', type: 'themes', version: 1, themes }, null, 2)], { type: 'application/json' });
  const a = h('a', { href: URL.createObjectURL(blob), download: 'groky-chat-themes.json' });
  document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  toast(`已导出 ${themes.length} 个主题`);
}
async function importThemes(f) {
  let data; try { data = JSON.parse(await f.text()); } catch { return toast('不是有效的 JSON 文件'); }
  const arr = Array.isArray(data) ? data : Array.isArray(data?.themes) ? data.themes : data?.accent ? [data] : [];
  const ok = arr.filter((t) => t && validHex(t.accent)).map((t) => ({ id: uid(), name: String(t.name || '导入的主题').slice(0, 20), accent: t.accent, bubble: validHex(t.bubble) ? t.bubble : '' }));
  if (!ok.length) return toast('文件中没有有效的主题（需要 accent 颜色）');
  S.settings.customThemes = [...(S.settings.customThemes || []), ...ok];
  await setSetting('themeId', S.settings.themeId);
  toast(`已导入 ${ok.length} 个主题`);
}

/* ---------- 聊天项显示 / 渲染 / 行为 ---------- */
function openDisplayPage() {
  openPage({ title: '聊天项显示', render: (body) => body.append(card(
    toggleRow('user', '显示用户头像', 'showUserAvatar'),
    toggleRow('chatdots', '显示用户名称', 'showUserName'),
    toggleRow('clock', '显示用户时间戳', 'showUserTime'),
    toggleRow('dots', '显示用户消息操作按钮', 'showUserActions'),
    toggleRow('bot', '聊天标题栏显示助手头像', 'showTitleAvatar'),
    toggleRow('msgsq', '显示模型名称', 'showModelName'),
    toggleRow('clock', '显示模型时间戳', 'showModelTime'),
    toggleRow('globe', '模型名称后显示供应商', 'showProvider'),
    toggleRow('type', '显示Token和上下文统计', 'showTokenStats', { info: '开启后，OpenAI 兼容接口会额外请求 stream_options.include_usage；服务未返回用量时显示按字数估算的值（标注“估算”）。' }),
    toggleRow('sparkles', '显示思考卡片', 'showThinking', { info: '关闭后隐藏模型返回的思考过程（reasoning）。' }),
    toggleRow('wrench', '显示工具卡片', 'x', { soon: true }),
    toggleRow('file', '显示回复底部文件卡片', 'x', { soon: true }),
  )) });
}
function openRenderPage() {
  openPage({ title: '渲染设置', render: (body) => body.append(card(
    toggleRow('hash', '启用 $...$ 渲染', 'dollarMath', { info: '把单个美元符号包裹的内容当作行内公式；关闭后只识别 $$…$$、\\(…\\)、\\[…\\]。' }),
    toggleRow('code', '启用数学公式渲染', 'mathRender', { info: '使用本地打包的 KaTeX 渲染 LaTeX 公式（离线可用）。' }),
    toggleRow('type', '用户消息 Markdown 渲染', 'userMarkdown'),
    toggleRow('brain', '思维链 Markdown 渲染', 'reasoningMarkdown'),
    toggleRow('msgsq', '助手消息 Markdown 渲染', 'assistantMarkdown'),
    toggleRow('collapse', '自动折叠代码块', 'codeCollapse'),
    numberRow('listnum', '超过多少行自动折叠', 'codeCollapseLines', { min: 1, max: 500, unit: '行' }),
    toggleRow('wrap', '移动端代码块自动换行', 'mobileCodeWrap'),
  )) });
}
const NAV_LABEL = { scroll: '滚动时显示', always: '始终显示', off: '关闭' };
function openBehaviorPage() {
  openPage({ title: '行为与启动', render: (body) => body.append(card(
    toggleRow('brain', '自动折叠思考', 'autoCollapseThinking', { info: '思考结束、开始输出正文后自动收起思考过程。' }),
    toggleRow('collapse', '折叠过长消息', 'collapseLong', { info: '超过约 1200 字或 24 行的消息默认折叠，可点“展开全文”。' }),
    toggleRow('refresh', '重新生成时删除下面的消息', 'regenDeleteBelow', { info: '关闭后，重新生成中间某条回复只替换这一条，下面的对话保留。' }),
    toggleRow('alert', '重新生成前弹出确认', 'confirmRegen'),
    toggleRow('sun', '生成时保持屏幕常亮', 'keepAwake', { info: 'wakeLock' in navigator ? '使用 Screen Wake Lock API。iOS 需 16.4+（主屏幕 Web App 需 iOS 18.4+）。' : '当前浏览器不支持 Screen Wake Lock API（iOS 需 16.4+，主屏幕 Web App 需 18.4+），开启后不会生效。' }),
    navRow('chevright', '消息导航按钮', { value: NAV_LABEL[S.settings.msgNav] || '滚动时显示', onClick: () => choiceSheet('消息导航按钮', Object.entries(NAV_LABEL).map(([k, l]) => ({ label: l, selected: S.settings.msgNav === k, onPick: () => setSetting('msgNav', k) }))) }),
    toggleRow('calendar', '显示对话列表日期', 'showListDates'),
    toggleRow('sidebar', '点选助手时不自动关闭侧边栏', 'keepDrawerOnAssistant'),
    toggleRow('file', '显示工具结果摘要', 'x', { soon: true }),
    toggleRow('imageoff', '隐藏工具结果中的图片', 'x', { soon: true }),
    toggleRow('branch', '创建分支时保留消息版本', 'x', { soon: true }),
  )) });
}

/* ---------- 助手设置 ---------- */
function openAssistantsPage() {
  const pg = openPage({ title: '助手设置', actions: [{ icon: 'plus', label: '新建助手', onClick: () => editPersona({ id: null, name: '', emoji: '🙂', prompt: '', temperature: null }, () => pg.refresh()) }], render: (body) => {
    if (!S.personas.length) body.append(h('p', { class: 'muted page-note' }, '还没有助手，点右上角 ＋ 新建。'));
    body.append(h('div', { class: 'asst-cards' }, S.personas.map((p) => h('button', { class: 'asst-card', 'data-id': p.id, onclick: () => editPersona(p, () => pg.refresh()) },
      avatarEl(p, 'asst-avatar big'),
      h('span', { class: 'ac-main' }, h('span', { class: 'ac-name' }, `${p.emoji && p.emoji.trim() ? p.emoji + ' ' : ''}${p.name}`),
        h('span', { class: 'ac-sub' }, (p.prompt || '').trim().split('\n')[0] || '暂无提示词')),
      S.settings.defaultPersonaId === p.id ? h('span', { class: 'li-badge' }, '默认') : null))));
  } });
  return pg;
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
  $('#messages').addEventListener('scroll', onMessagesScroll, { passive: true });
  $('#nav-up').addEventListener('click', () => navMsg(-1));
  $('#nav-down').addEventListener('click', () => navMsg(1));
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
  applyTheme(); applyPrefs(); bindEvents(); renderAll();
  // 本地字体 / 背景图片（Blob 存在 IndexedDB）
  if (S.settings.appFont === 'local') loadLocalFont('app');
  if (S.settings.codeFont === 'local') loadLocalFont('code');
  if (S.settings.bgImage) loadBgImage();
  document.documentElement.classList.add('ready');
}

init();

if ('serviceWorker' in navigator && location.protocol !== 'file:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch((e) => console.warn('SW 注册失败', e)));
}
