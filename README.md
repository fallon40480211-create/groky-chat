# groky chat

仿 Kelivo 风格的 AI 聊天 PWA：纯静态、纯前端，数据（含 API Key）只存在本机浏览器 IndexedDB。

## 目录
- `public/` —— 可直接部署的静态站点（index.html / style.css / app.js / sw.js / manifest.json / icons/ / vendor/）
- `dist/` —— `npm run build` 生成（public 的拷贝）
- `scripts/make-icons.mjs` 生成图标；`scripts/fake-sse-server.mjs` 假 LLM 流式服务；`scripts/e2e.mjs` 端到端测试
- `screenshots/` 测试截图

## 本地运行
```bash
npm run serve        # http://localhost:8787
npm run fake-api     # 可选：假 SSE 服务 http://localhost:8788/v1（CORS 已开）
npm test             # 需要以上两个服务在运行
```

## 部署（iPhone “添加到主屏幕”需 HTTPS）
把 `public/`（或 `dist/`）上传到任意静态托管即可：GitHub Pages、Cloudflare Pages、Netlify、Vercel。
所有路径均为相对路径，可部署在子目录（如 `https://user.github.io/groky-chat/`）。
更新版本时修改 `sw.js` 里的 `VERSION` 以刷新缓存。
