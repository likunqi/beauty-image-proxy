# Beauty Image Proxy

美女图 API 聚合代理 · 一键部署到 Cloudflare Workers

聚合 6 个公开图源，统一接口输出，自动容错。

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/likunqi/beauty-image-proxy)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Wrangler](https://img.shields.io/badge/wrangler-3.x-orange)](https://developers.cloudflare.com/workers/wrangler/)
[![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

## 项目概述

在 Cloudflare Workers 上运行的免费美女图 API 代理服务。聚合 6 个公开图源，将不同的响应格式统一为一致的接口输出，支持自动容错切换。

### 核心特性

- 聚合 6 个图源 - 全部为三次元/真人美女图片
- 统一接口 - JSON 返回 + 302 直链跳转（兼容 `<img src>`）
- 自动容错 - 源挂了自动尝试下一个（最多试 5 个）
- 超时保护 - 10 秒超时，避免请求挂死
- 管理后台 - 内置 Web 界面，在线测试每个图源
- CORS 全开 - 前端直接调用
- 图床上传 - 随机图片自动上传到 likunqi.top 图床
- 零成本 - Cloudflare Workers 免费计划足够日常使用

## 目录

- [API 文档](#api-文档)
- [图源列表](#图源列表)
- [部署指南](#部署指南)
- [使用示例](#使用示例)
- [本地开发](#本地开发)
- [常见问题](#常见问题)
- [声明](#声明)

---

## API 文档

所有接口部署在 `https://beauty-image-proxy.<你的用户名>.workers.dev`，访问根路径 `/` 可查看管理后台。

### 接口一览

| 方法 | 路径 | 说明 |
| ---- | ---- | ---- |
| GET  | `/` | 管理后台 - 在线测试每个图源 |
| GET  | `/api/v1/random` | 随机图片（JSON） |
| GET  | `/api/v1/random?redirect` | 随机图片（302 跳转，兼容 `<img>`） |
| GET  | `/api/v1/image/:name` | 指定图源（JSON） |
| GET  | `/api/v1/image/:name?redirect` | 指定图源（302 跳转） |
| GET  | `/api/v1/upload-random?count=N` | 随机 N 张自动上传到图床 |
| GET  | `/api/v1/sources` | 数据源列表 |

### 响应格式

```json
{
  "success": true,
  "data": {
    "url": "https://example.com/image.jpg",
    "source": "xxapi",
    "label": "XXAPI Beauty",
    "category": "realistic"
  }
}
```

### 管理后台

部署后访问根路径 `/` 即可看到内置的管理后台：
- 每个图源有独立的"测试"按钮，一键验证可用性
- 随机预览
- 复制 API 直链地址
- 一键上传图片到图床
- 深色 UI，响应式设计

## 图源列表

聚合了以下 **6 个** 公开免费图源（全部为三次元/真人美女图片），

| 名称 | 类型 | 说明 |
| ---- | ---- | ---- |
| XXAPI Beauty | JSON | 老牌随机美女图 |
| 52VMy Girl | JSON | 随机美女图片，JSON 直链 |
| YVIII 随机 | 302 跳转 | 随机图片接口 |
| YVIII 美图 | 302 跳转 | 美女图片接口 |
| YVIII 白丝 | 302 跳转 | 白丝图片 |
| YVIII 黑丝 | 302 跳转 | 黑丝图片 |

## 部署指南

### 方式一：一键部署（推荐）

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/likunqi/beauty-image-proxy)

1. 点击上方按钮
2. 登录/注册 Cloudflare 账号（免费）
3. 确认创建 Worker
4. 部署完成即可使用

### 方式二：GitHub Actions

Fork 仓库后，在设置中添加 CF_API_TOKEN 和 CF_ACCOUNT_NAME。推送 main 分支自动部署。

### 方式三：Wrangler CLI

```bash
git clone https://github.com/likunqi/beauty-image-proxy.git
cd beauty-image-proxy
npm install
npx wrangler login
npx wrangler deploy
```

### 方式四：手动部署

将 src/index.js 和 src/sources.js 内容合并后粘贴到 Worker 编辑器。

## 使用示例

### HTML `<img>` 标签

```html
<img src="https://你的域名.workers.dev/api/v1/random?redirect">
<img src="https://你的域名.workers.dev/api/v1/image/xxapi?redirect">
```

### JavaScript / Fetch

```js
const res = await fetch("https://你的域名.workers.dev/api/v1/random");
const data = await res.json();
document.querySelector("img").src = data.data.url;
```

### Python / Requests

```python
import requests
resp = requests.get("https://你的域名.workers.dev/api/v1/random")
data = resp.json()
print(data["data"]["url"])
```

### cURL

```bash
curl -s https://你的域名.workers.dev/api/v1/random | jq .
curl -L -o img.jpg https://你的域名.workers.dev/api/v1/random?redirect
```

## 项目结构

```
beauty-image-proxy/
├── src/
│   ├── index.js         # Worker 入口 + 路由 + 管理后台
│   └── sources.js       # 6 个 API 源定义
├── .github/workflows/
│   └── deploy.yml       # GitHub Actions 自动部署
├── wrangler.toml        # Cloudflare 配置
├── package.json
└── README.md
```

## 本地开发

```bash
npm install
npx wrangler dev
# 访问 http://localhost:8787
```

### 添加新图源

编辑 `src/sources.js`，在 `SOURCES` 数组中添加：

```js
{
  name: "my-source",
  label: "我的图源",
  type: "json",          // json / image / redirect
  url: "https://...",
  extract: (d) => d.url, // json 类型需要
  category: "realistic",  // 目前仅 realistic
}
```

## 常见问题

### 图源稳定吗？

免费公益 API 没有绝对不挂的。项目做了多层容错：
- 每次请求随机打乱源顺序
- 失败自动切换下一个（最多 5 个）
- 10 秒超时保护
- 内置管理后台可随时测试

### 收费吗？

完全免费。Cloudflare Workers 免费计划每天 10 万次请求，个人使用足够。

### upload-random 上传失败？

上传到 https://likunqi.top/upload 可能会因为源图片下载超时、图床接口不可用等原因失败。
失败时会返回具体错误信息，可根据错误排查。

## 声明

- 仅用于学习和研究目的
- 数据来源整理自腾讯元宝的公开回答
- 不存储、缓存任何图片内容
- 使用请遵守各 API 源的使用条款
