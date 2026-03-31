# 🖼️ Image Background Remover

一键移除图片背景的工具网站。

## 技术架构

```
用户浏览器 → Cloudflare Worker → Remove.bg API → 透明PNG
              ↑ API Key 隐藏在这里
```

- **前端**: Vanilla HTML/JS（Cloudflare Pages 托管）
- **后端**: Cloudflare Worker（TypeScript）
- **图片处理**: Remove.bg API

## 快速开始

### 1. 部署 Worker

```bash
cd worker
npm install
wrangler deploy
```

### 2. 设置 API Key

```bash
wrangler secret put REMOVE_BG_API_KEY
# 输入你的 Remove.bg API Key
```

获取 API Key: https://www.remove.bg/api

### 3. 配置前端 API 地址

编辑 `frontend/index.html`，找到这行：

```javascript
const API_URL = 'https://image-background-remover.your-account.workers.dev';
```

改成你的 Worker 地址，例如：

```javascript
const API_URL = 'https://image-background-remover-worker.LHF3120.workers.dev';
```

### 4. 部署前端

**方式一：Cloudflare Pages**
1. 登录 https://pages.cloudflare.com
2. 创建项目，上传 `frontend/index.html`

**方式二：GitHub Pages / Vercel / Netlify**
直接把 `frontend/index.html` 扔上去即可（纯静态）。

## 功能

- ✅ 拖拽或点击上传图片
- ✅ 支持 JPG、PNG、WEBP
- ✅ 实时预览原图 vs 结果
- ✅ 一键下载透明PNG
- ✅ 移动端适配
- ✅ 错误提示

## 成本

| 服务 | 费用 |
|------|------|
| Cloudflare Pages | 免费 |
| Cloudflare Worker | 免费（每天10万次） |
| Remove.bg API | $0.012/张 |

## 项目结构

```
image-background-remover/
├── frontend/
│   └── index.html          # 前端页面
├── worker/
│   ├── src/
│   │   └── index.ts        # Worker 主逻辑
│   ├── wrangler.toml       # Wrangler 配置
│   └── package.json        # 依赖
└── README.md
```

## License

MIT
