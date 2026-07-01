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

        
        if (route === "upload-random") {
          const count = Math.min(parseInt(query.get("count") || "3", 10) || 3, 10);
          const catFilter = query.get("category");
          const pool = catFilter
            ? SOURCES.filter((s) => s.category === catFilter)
            : SOURCES;
          if (pool.length === 0) return json({ success: false, error: "no matching source" }, 404);

          const results = [];
          const attempted = new Set();
          let budget = Math.min(pool.length * 3, 30);
          let lastError = "";

          while (results.length < count && budget-- > 0) {
            const src = pool[Math.floor(Math.random() * pool.length)];
            if (attempted.has(src.name)) continue;
            attempted.add(src.name);
            try {
              const imgResult = await fetchImageUrl(src);

              const dlCtl = new AbortController();
              const dlTimer = setTimeout(() => dlCtl.abort(), 10000);
              let imgResp;
              try {
                imgResp = await fetch(imgResult.url, { signal: dlCtl.signal });
              } finally {
                clearTimeout(dlTimer);
              }
              if (!imgResp.ok) throw new Error("download HTTP " + imgResp.status);
              const imgBytes = await imgResp.arrayBuffer();
              const contentType = imgResp.headers.get("Content-Type") || "image/jpeg";

              const formData = new FormData();
              const ext = contentType.split("/").pop() || "jpg";
              formData.append("image", new Blob([imgBytes], { type: contentType }), "upload." + ext);

              const upCtl = new AbortController();
              const upTimer = setTimeout(() => upCtl.abort(), 15000);
              let uploadResp;
              try {
                uploadResp = await fetch("https://likunqi.top/upload", {
                  method: "POST",
                  body: formData,
                  signal: upCtl.signal,
                });
              } finally {
                clearTimeout(upTimer);
              }

              if (!uploadResp.ok) throw new Error("upload HTTP " + uploadResp.status);
              const uploadText = await uploadResp.text();
              let uploadData;
              try {
                uploadData = JSON.parse(uploadText);
              } catch {
                throw new Error("upload non-JSON: " + uploadText.slice(0, 100));
              }
              const uploadedUrl = uploadData.src
                ? (uploadData.src.startsWith("http") ? uploadData.src : "https://likunqi.top" + uploadData.src)
                : uploadData.url;

              if (!uploadedUrl) throw new Error("upload response missing url, got: " + JSON.stringify(uploadData));

              results.push({
                url: uploadedUrl,
                source: src.name,
                label: src.label,
                originalUrl: imgResult.url,
              });
            } catch (e) {
              lastError = src.name + ": " + e.message;
            }
          }

          if (results.length === 0) {
            return json({ success: false, error: "all sources failed: " + lastError }, 502);
          }

          return json({ success: true, count: results.length, data: results });
        }

        }
                return json({ success: false, error: "route not found" }, 404);
      }

      const catLabel = () => "涓夋鍏?鐪熶汉";
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
                    `<button onclick="testSource('${s.name}')">娴嬭瘯</button>` +
                    `<button onclick="copyUrl('${s.name}')">澶嶅埗API鍦板潃</button>` +
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
<title>缇庡コ鍥?API 鑱氬悎浠ｇ悊</title>
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
<h1>缇庡コ鍥?API 鑱氬悎浠ｇ悊</h1>
<p class="subtitle">鑱氬悎 ${SOURCES.length} 涓叕寮€鍥炬簮锛屼竴閿儴缃插埌 Cloudflare Workers</p>

<div class="endpoints">
<strong>鎺ュ彛鍒楄〃锛?/strong><br>
<code>GET /api/v1/random</code> 鈥?闅忔満涓€寮犲浘锛圝SON锛?br>
<code>GET /api/v1/random?redirect</code> 鈥?闅忔満涓€寮犲浘锛?02 璺宠浆锛?br>
<code>GET /api/v1/image/:name</code> 鈥?鎸囧畾婧?鈫?<a href="/api/v1/image/xxapi">/api/v1/image/xxapi</a><br>
<code>GET /api/v1/image/:name?redirect</code> 鈥?鎸囧畾婧?302 璺宠浆<br>
<code>GET /api/v1/upload-random</code> &rarr; 随机3张上传图床（可跟 ?count=N）<br>
<code>GET /api/v1/sources</code> 鈥?鍒楀嚭鎵€鏈夋簮 鈫?<a href="/api/v1/sources">鏌ョ湅</a>
</div>

<div class="random-bar">
<button onclick="randomPreview('all')">闅忔満涓€寮?/button>
<span id="current-category" style="color:#a1a1aa;font-size:13px">鍏ㄩ儴</span>
</div>

<div class="preview-box" id="preview-box">
<img id="preview-img" src="" alt="preview">
<div class="meta" id="preview-meta"></div>
</div>

<div class="random-bar">
<button onclick="uploadRandom(3)" style="background:#7c3aed">上传3张到图床</button>
<button onclick="uploadRandom(1)" style="background:#7c3aed">上传1张</button>
<span style="color:#a1a1aa;font-size:13px">自动上传到 likunqi.top 图床</span>
</div>
<div id="upload-results" style="display:none;margin-bottom:20px;background:#1a1a24;border-radius:8px;padding:14px;border:1px solid #27272a"></div>
<h2 style="font-size:18px;margin:20px 0 8px">鏁版嵁婧?/h2>
${sourceCards}

<script>
async function testSource(name){
const el=document.getElementById('result-'+name);
el.className='card-result';el.textContent='璇锋眰涓?..';
try{const r=await fetch('/api/v1/image/'+name);const d=await r.json();
if(d.success){el.className='card-result success';
el.innerHTML='<span>鎴愬姛</span><br><img src=\"'+d.data.url+'\" loading=\"lazy\">';
}else{el.className='card-result error';el.textContent='澶辫触: '+d.error;}
}catch(e){el.className='card-result error';el.textContent='閿欒: '+e.message;}}

function copyUrl(name){
const url=window.location.origin+'/api/v1/image/'+name+'?redirect';
navigator.clipboard.writeText(url).then(()=>{
const el=document.getElementById('result-'+name);
el.className='card-result success';el.textContent='宸插鍒? '+url;});}

async function randomPreview(category){
const box=document.getElementById('preview-box');
const img=document.getElementById('preview-img');
const meta=document.getElementById('preview-meta');
const url=category==='all'?'/api/v1/random':'/api/v1/random?category='+category;
try{const r=await fetch(url);const d=await r.json();
if(d.success){box.style.display='block';img.src=d.data.url;
meta.textContent='鏉ユ簮: '+d.data.label+' | 鍒嗙被: '+(d.data.category==='realistic'?'涓夋鍏?鐪熶汉':'鍏朵粬');
}else{meta.textContent='澶辫触: '+d.error;}
}catch(e){meta.textContent='閿欒: '+e.message;}}
async function uploadRandom(count){
const box=document.getElementById('upload-results');
box.style.display='block';box.innerHTML='<span style="color:#a1a1aa">上传中...</span>';
try{const r=await fetch('/api/v1/upload-random?count='+count);const d=await r.json();
if(d.success){let html='<strong style="color:#4ade80">上传成功 ('+d.count+'张)</strong><br><br>';
d.data.forEach(item=>{html+='<div style="margin-bottom:10px;padding:10px;background:#27272a;border-radius:6px">'+
'<strong>'+item.label+'</strong><br>'+
'<span style="font-size:12px;color:#60a5fa;word-break:break-all">'+item.url+'</span><br>'+
'<button onclick="navigator.clipboard.writeText(\''+item.url+'\')" style="margin-top:4px;background:#3f3f46;color:#e4e4e7;border:1px solid #52525b;padding:2px 8px;border-radius:4px;cursor:pointer;font-size:11px">复制链接</button>'+
'</div>';});box.innerHTML=html;}else{box.innerHTML='<span style="color:#f87171">上传失败: '+d.error+'</span>';}
}catch(e){box.innerHTML='<span style="color:#f87171">错误: '+e.message+'</span>';}}
</script>
</body>
</html>`;

      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8", ...corsHeaders },
      });
    } catch (e) {
      return new Response(JSON.stringify({ success: false, error: "鏈嶅姟鍣ㄥ唴閮ㄩ敊璇? " + e.message }), {
        status: 500,
        headers: { "Content-Type": "application/json; charset=utf-8", "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};





