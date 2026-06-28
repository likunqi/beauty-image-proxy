 # Beauty Image Proxy - 美女图 API 聚合代理
 
 在 Cloudflare Workers 上聚合多个公开美女图 API，统一格式输出。
 
 ## 部署
 
 需要 [Node.js](https://nodejs.org/) 和 [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)。
 
 ```bash
 # 1. 安装依赖
 npm install
 
 # 2. 本地开发测试
 npx wrangler dev
 
 # 3. 部署到 Cloudflare
 npx wrangler deploy
 ```
 
 首次部署会被引导完成 Cloudflare 登录和 Workers 创建流程。
 
 ## 聚合的数据源（共 15 个）
 
 ### 三次元/真人
 - **XXAPI 美女** — `https://v2.xxapi.cn/api/meinvpic`
 - **维梦随机美女** — `https://api.52vmy.cn/api/img/tu/girl`
 - **随机妹子图** — `http://api.mtyqx.cn/api/random.php`
 - **DMOE 随机妹子** — `http://www.dmoe.cc/random.php`
 - **Lofter 随机图** — `https://api.ooopn.com/image/lofter/api.php?type=json`
 - **YVIII 随机美图** — `https://api.yviii.com/img/suiji`
 - **YVIII 4K美女** — `https://api.yviii.com/img/meitu`
 - **彼岸图网代理** — `http://cn.gezia.top/api/mzt/?mom=302`
 - **Suyanw 美女图** — `https://api.suyanw.cn/api/pcmv.php`
 - **GZ-Pages PCMV** — `https://gz-api.pages.dev/pcmv`
 
 ### 二次元/ACG
 - **ACG 美少女** — `https://api.nmb.show/1985acg.php`
 - **动漫妹子** — `https://tuapi.eees.cc/dongman.php`
 - **动漫星空** — `https://api.dongmanxingkong.com/suijitupian/acg/1080p/index.php?return=json`
 - **二次元随机** — `http://api.btstu.cn/sjbz/?lx=dongman`
 - **YVIII 二次元** — `https://api.yviii.com/img/ecy`
 
 ## API 接口
 
 默认部署在 `https://beauty-image-proxy.<你的用户名>.workers.dev`
 
 | 接口 | 说明 |
 |------|------|
 | `GET /` | 管理后台（含随机预览和数据源测试） |
 | `GET /api/v1/random` | 随机图片（JSON） |
 | `GET /api/v1/random?redirect` | 随机图片（302 跳转） |
 | `GET /api/v1/random?category=anime` | 仅二次元随机 |
 | `GET /api/v1/random?category=realistic` | 仅三次元随机 |
 | `GET /api/v1/image/:name` | 指定源图片（JSON） |
 | `GET /api/v1/image/:name?redirect` | 指定源图片（302 跳转） |
 | `GET /api/v1/sources` | 列出所有数据源 |
 
 ### 响应格式
 
 ```json
 {
   "success": true,
   "data": {
     "url": "https://example.com/image.jpg",
     "source": "vmy",
     "label": "维梦随机美女",
     "category": "realistic"
   }
 }
 ```
 
 ## 快速使用
 
 **HTML 中使用（直接跳转）：**
 ```html
 <img src="https://beauty-image-proxy.<你的用户名>.workers.dev/api/v1/random?redirect">
 ```
 
 **HTML 中使用（指定源）：**
 ```html
 <img src="https://beauty-image-proxy.<你的用户名>.workers.dev/api/v1/image/vmy?redirect">
 ```
 
 **JavaScript 中使用：**
 ```js
 const res = await fetch('https://beauty-image-proxy.<你的用户名>.workers.dev/api/v1/random');
 const data = await res.json();
 console.log(data.data.url); // 图片 URL
 ```
 
 ## 架构
 
 ```
 客户端 → Cloudflare Worker → 上游 API（随机选一个）
                             → 返回统一 JSON / 302 跳转
 ```
 
 自动容错：随机选择一个源，失败则自动切换下一个（最多试 5 个）。
 每个请求 10 秒超时，避免挂死。
 
 ## 项目说明
 
 数据来源：全部来自 https://yb.tencent.com/s/FP4V1yLgzUcL 中整理的公开免费 API。
 仅供学习参考使用，请遵守各 API 源的使用条款。
