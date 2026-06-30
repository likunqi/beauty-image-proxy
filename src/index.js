import { SOURCES, fetchImageUrl } from "./sources.js";

export default {
  async fetch(request, env, ctx) {
    try {
      const url = new URL(request.url);
      const parts = url.pathname.split("/").filter(Boolean);
      const query = url.searchParams;

      const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      };

      const json = (data, status = 200) =>
        new Response(JSON.stringify(data, null, 2), {
          status,
          headers: { ...corsHeaders, "Content-Type": "application/json; charset=utf-8" },
        });

      if (request.method === "OPTIONS") {
        return new Response(null, { status: 204, headers: corsHeaders });
      }

      if (parts[0] === "api" && parts[1] === "v1") {
        const route = parts[2];
        if (route === "sources") {
          const list = SOURCES.map((s) => ({
            name: s.name,
            label: s.label,
            description: s.description,
            category: s.category,
            type: s.type,
          }));
          return json({ success: true, count: list.length, sources: list });
        }
        if (route === "random") {
          const catFilter = query.get("category");
          const doRedirect = query.has("redirect");
          const pool = catFilter
            ? SOURCES.filter((s) => s.category === catFilter)
            : SOURCES;
          if (pool.length === 0) return json({ success: false, error: "no matching source" }, 404);
          const shuffled = [...pool].sort(() => Math.random() - 0.5);
          const maxAttempts = Math.min(shuffled.length, 5);
          let lastError = null;
          for (let i = 0; i < maxAttempts; i++) {
            try {
              const result = await fetchImageUrl(shuffled[i]);
              if (doRedirect) {
                return new Response(null, {
                  status: 302,
                  headers: { Location: result.url, ...corsHeaders },
                });
              }
              return json({
                success: true,
                data: {
                  url: result.url,
                  source: result.source,
                  label: shuffled[i].label,
                  category: shuffled[i].category,
                },
              });
            } catch (e) {
              lastError = e.message;
            }
          }
          return json({ success: false, error: "All sources failed: " + lastError }, 502);
        }
        if (route === "image" && parts[3]) {
          const source = SOURCES.find((s) => s.name === parts[3]);
          if (!source) return json({ success: false, error: "unknown source" }, 404);
          const doRedirect = query.has("redirect");
          try {
            const result = await fetchImageUrl(source);
            if (doRedirect) {
              return new Response(null, {
                status: 302,
                headers: { Location: result.url, ...corsHeaders },
              });
            }
            return json({
              success: true,
              data: {
                url: result.url,
                source: result.source,
                label: source.label,
                category: source.category,
              },
            });
          } catch (e) {
            return json({ success: false, error: e.message }, 502);
          }
        }
        return json({ success: false, error: "route not found" }, 404);
      }

      const catLabel = () => "三次元/真人";
      const groups = {};
      for (const s of SOURCES) {
        const g = catLabel();
        if (!groups[g]) groups[g] = [];
        groups[g].push(s);
      }

      const sourceCards = Object.entries(groups)
        .map(
          ([cat, list]) =>
            `<h3>${cat}</h3>` +
            `<div class="grid">${
              list
                .map(
                  (s) =>
                    `<div class="card" data-source="${s.name}">` +
                    `<div class="card-title">${s.label}</div>` +
                    `<div class="card-desc">${s.description || ""}</div>` +
                    `<div class="card-btns">` +
                    `<button onclick="testSource('${s.name}')">测试</button>` +
                    `<button onclick="copyUrl('${s.name}')">复制API地址</button>` +
                    `</div>` +
                    `<div class="card-result" id="result-${s.name}"></div>` +
                    `</div>`
                )
                .join("")
            }</div>`
        )
        .join("");

      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>美女图 API 聚合代理</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#0f0f13;color:#e4e4e7;padding:24px;max-width:1100px;margin:0 auto}
h1{font-size:24px;margin-bottom:4px}
.subtitle{color:#a1a1aa;margin-bottom:20px;font-size:14px}
.endpoints{background:#1a1a24;border-radius:8px;padding:16px;margin-bottom:20px;font-size:13px;line-height:1.8}
.endpoints code{background:#2a2a36;padding:2px 6px;border-radius:4px;color:#fbbf24;font-size:12px}
.endpoints a{color:#60a5fa;text-decoration:none}
.endpoints a:hover{text-decoration:underline}
h3{font-size:16px;margin:16px 0 8px;color:#a1a1aa}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:12px}
.card{background:#1a1a24;border-radius:8px;padding:14px;border:1px solid #27272a}
.card-title{font-size:15px;font-weight:600;margin-bottom:4px}
.card-desc{font-size:12px;color:#a1a1aa;margin-bottom:10px}
.card-btns{display:flex;gap:8px}
.card-btns button{background:#27272a;color:#e4e4e7;border:1px solid #3f3f46;padding:4px 10px;border-radius:6px;cursor:pointer;font-size:12px;transition:background .15s}
.card-btns button:hover{background:#3f3f46}
.card-result{margin-top:8px;font-size:12px;color:#a1a1aa;min-height:18px;word-break:break-all}
.card-result img{max-width:100%;max-height:200px;border-radius:6px;margin-top:6px;display:block}
.card-result.error{color:#f87171}
.card-result.success{color:#4ade80}
.random-bar{display:flex;gap:10px;align-items:center;margin-bottom:16px;flex-wrap:wrap}
.random-bar button{background:#2563eb;color:#fff;border:none;padding:8px 18px;border-radius:8px;cursor:pointer;font-size:14px;font-weight:500}
.random-bar button:hover{background:#1d4ed8}
.random-bar select{background:#1a1a24;color:#e4e4e7;border:1px solid #3f3f46;padding:6px 10px;border-radius:6px;font-size:13px}
.preview-box{margin-bottom:20px;display:none}
.preview-box img{max-width:100%;max-height:60vh;border-radius:10px;display:block}
.preview-box .meta{font-size:12px;color:#a1a1aa;margin-top:6px}
</style>
</head>
<body>
<h1>美女图 API 聚合代理</h1>
<p class="subtitle">聚合 ${SOURCES.length} 个公开图源，一键部署到 Cloudflare Workers</p>

<div class="endpoints">
<strong>接口列表：</strong><br>
<code>GET /api/v1/random</code> — 随机一张图（JSON）<br>
<code>GET /api/v1/random?redirect</code> — 随机一张图（302 跳转）<br>
<code>GET /api/v1/image/:name</code> — 指定源 → <a href="/api/v1/image/vmy">/api/v1/image/vmy</a><br>
<code>GET /api/v1/image/:name?redirect</code> — 指定源 302 跳转<br>
<code>GET /api/v1/sources</code> — 列出所有源 → <a href="/api/v1/sources">查看</a>
</div>

<div class="random-bar">
<button onclick="randomPreview('all')">随机一张</button>
<span id="current-category" style="color:#a1a1aa;font-size:13px">全部</span>
</div>

<div class="preview-box" id="preview-box">
<img id="preview-img" src="" alt="preview">
<div class="meta" id="preview-meta"></div>
</div>

<h2 style="font-size:18px;margin:20px 0 8px">数据源</h2>
${sourceCards}

<script>
async function testSource(name){
const el=document.getElementById('result-'+name);
el.className='card-result';el.textContent='请求中...';
try{const r=await fetch('/api/v1/image/'+name);const d=await r.json();
if(d.success){el.className='card-result success';
el.innerHTML='<span>成功</span><br><img src=\"'+d.data.url+'\" loading=\"lazy\">';
}else{el.className='card-result error';el.textContent='失败: '+d.error;}
}catch(e){el.className='card-result error';el.textContent='错误: '+e.message;}}

function copyUrl(name){
const url=window.location.origin+'/api/v1/image/'+name+'?redirect';
navigator.clipboard.writeText(url).then(()=>{
const el=document.getElementById('result-'+name);
el.className='card-result success';el.textContent='已复制: '+url;});}

async function randomPreview(category){
const box=document.getElementById('preview-box');
const img=document.getElementById('preview-img');
const meta=document.getElementById('preview-meta');
const url=category==='all'?'/api/v1/random':'/api/v1/random?category='+category;
try{const r=await fetch(url);const d=await r.json();
if(d.success){box.style.display='block';img.src=d.data.url;
meta.textContent='来源: '+d.data.label+' | 分类: '+(d.data.category==='realistic'?'三次元/真人':'其他');
}else{meta.textContent='失败: '+d.error;}
}catch(e){meta.textContent='错误: '+e.message;}}
</script>
</body>
</html>`;

      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: "服务器内部错误: " + e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};
