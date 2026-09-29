# groky chat

仿 Kelivo 风格的 AI 聊天 PWA：纯静态、纯前端，数据（含 API Key）只存在本机浏览器 IndexedDB。

## 目录
- `public/` —— 可直接部署的静态站点（index.html / style.css / app.js / sw.js / manifest.json / icons/ / vendor/）
- `dist/` —— `npm run build` 生成（public 的拷贝）
- `scripts/make-icons.mjs` 生成图标；`scripts/fake-sse-server.mjs` 假 LLM 流式服务；`scripts/e2e.mjs` 端到端测试（默认 WebKit，`BROWSER=chromium` 可切换）；`scripts/sheet-keyboard.mjs` iOS 键盘遮挡回归测试；`scripts/ui-shots.mjs` 界面截图；`scripts/prefs.mjs` 偏好设置回归测试（主题 / 显示 / 渲染 / 行为 / 重试 / 字体 / 背景 / 助手）
- `screenshots/` 测试截图

## 本地运行
```bash
npm run serve        # http://localhost:8787
npm run fake-api     # 可选：假 SSE 服务 http://localhost:8788/v1（CORS 已开）
npm test             # 需要以上两个服务在运行；WebKit 需先 npx playwright install webkit（Linux 另需 install-deps）
```

## 部署（iPhone “添加到主屏幕”需 HTTPS）
把 `public/`（或 `dist/`）上传到任意静态托管即可：GitHub Pages、Cloudflare Pages、Netlify、Vercel。
所有路径均为相对路径，可部署在子目录（如 `https://user.github.io/groky-chat/`）。
更新版本时修改 `sw.js` 里的 `VERSION` 以刷新缓存。

## 偏好设置（v1.2）
设置 → 偏好设置：主题（9 个预设 + 自定义主题，可复制/编辑/删除/导入导出 JSON，纯色背景开关）、聊天项显示、渲染设置（KaTeX 本地打包的数学公式、Markdown 开关、代码块折叠/换行）、行为与启动、消息样式、自动重试、触觉反馈、应用/代码字体（可上传本地字体）、聊天字号、自动回到底部延迟、背景图片与遮罩、输入框透明度。
所有设置保存在本机 IndexedDB；字体与背景图片以 ArrayBuffer 形式保存。
