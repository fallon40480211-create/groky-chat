// 本地假 LLM 服务：模拟 OpenAI 兼容 & Anthropic 的 SSE 流式输出（带 CORS），仅用于测试
import http from 'node:http';
const PORT = Number(process.env.PORT || 8788);
const REPLY = '你好！我是**假模型**，这是流式测试。\n\n```python\ndef hello():\n    print("你好, groky")\n```\n\n- 列表项一\n- 列表项二\n\n| 列 | 值 |\n|---|---|\n| a | 1 |';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};
const pieces = (s, n = 6) => { const out = []; for (let i = 0; i < s.length; i += n) out.push(s.slice(i, i + n)); return out; };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function writeSplit(res, text) {
  // 故意把 SSE 字节切成不规则块，考验解析器（跨块的行/UTF-8 字符）
  const buf = Buffer.from(text);
  for (let i = 0; i < buf.length; i += 7) { res.write(buf.subarray(i, i + 7)); }
}

http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') { res.writeHead(204, cors); return res.end(); }
  let body = '';
  for await (const c of req) body += c;
  const url = req.url;
  console.log(req.method, url, req.headers['authorization'] || req.headers['x-api-key'] || '', req.headers['anthropic-dangerous-direct-browser-access'] || '');
  if (req.method === 'GET' && url.endsWith('/models')) {
    res.writeHead(200, { ...cors, 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ data: [{ id: 'fake-gpt' }, { id: 'fake-reasoner' }, { id: 'fake-claude' }] }));
  }
  const j = body ? JSON.parse(body) : {};
  const delay = j.messages?.some((m) => String(m.content).includes('慢')) ? 250 : 30;
  if (url.endsWith('/chat/completions')) {
    res.writeHead(200, { ...cors, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
    if (j.model === 'fake-reasoner') {
      for (const p of pieces('先想一想用户要什么……')) { await writeSplit(res, `data: ${JSON.stringify({ choices: [{ delta: { reasoning_content: p } }] })}\n\n`); await sleep(delay); }
    }
    await writeSplit(res, ': keep-alive comment\n\n');
    const sysNote = j.messages?.[0]?.role === 'system' ? `\n\n> system: ${j.messages[0].content.slice(0, 20)} · temp=${j.temperature ?? '默认'}` : '';
    for (const p of pieces(REPLY + sysNote)) {
      await writeSplit(res, `data: ${JSON.stringify({ choices: [{ delta: { content: p } }] })}\r\n\r\n`);
      await sleep(delay);
    }
    await writeSplit(res, 'data: [DONE]\n\n');
    return res.end();
  }
  if (url.endsWith('/messages')) {
    if (req.headers['anthropic-dangerous-direct-browser-access'] !== 'true' || !req.headers['x-api-key']) {
      res.writeHead(401, { ...cors, 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ type: 'error', error: { type: 'authentication_error', message: 'missing headers' } }));
    }
    res.writeHead(200, { ...cors, 'Content-Type': 'text/event-stream' });
    const ev = (name, data) => writeSplit(res, `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);
    await ev('message_start', { type: 'message_start', message: { id: 'msg_1', model: j.model } });
    await ev('content_block_start', { type: 'content_block_start', index: 0, content_block: { type: 'text', text: '' } });
    await ev('ping', { type: 'ping' });
    for (const p of pieces(`来自 Anthropic 格式的回复（system=${j.system ? '有' : '无'}，max_tokens=${j.max_tokens}）。\n\n` + REPLY)) {
      await ev('content_block_delta', { type: 'content_block_delta', index: 0, delta: { type: 'text_delta', text: p } });
      await sleep(delay);
    }
    await ev('content_block_stop', { type: 'content_block_stop', index: 0 });
    await ev('message_delta', { type: 'message_delta', delta: { stop_reason: 'end_turn' } });
    await ev('message_stop', { type: 'message_stop' });
    return res.end();
  }
  res.writeHead(404, cors); res.end('not found');
}).listen(PORT, () => console.log('fake SSE server on', PORT));
