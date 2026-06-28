 import { SOURCES, fetchImageUrl } from "./sources.js";
 
 // 閫氱敤 CORS 澶? const CORS_HEADERS = {
   'Access-Control-Allow-Origin': '*',
   'Access-Control-Allow-Methods': 'GET, OPTIONS',
   'Access-Control-Allow-Headers': 'Content-Type',
 };
 
 // 瀹夊叏杩斿洖 JSON
 function json(data, status = 200) {
   return new Response(JSON.stringify(data, null, 2), {
     status,
     headers: { ...CORS_HEADERS, 'Content-Type': 'application/json; charset=utf-8' },
   });
 }
 
 // 瑙ｆ瀽璺緞
 function parsePath(url) {
   const u = new URL(url);
   const parts = u.pathname.split('/').filter(Boolean);
   return { parts, query: u.searchParams };
 }
 
 // ---------- 璺敱澶勭悊 ----------
 
 async function handleSources() {
   const list = SOURCES.map((s) => ({
     name: s.name,
     label: s.label,
     description: s.description,
     category: s.category,
     type: s.type,
   }));
   return json({ success: true, count: list.length, sources: list });
 }
 
 async function handleRandom(query) {
   const category = query.get('category'); // realistic | anime | undefined锛堝叏閮級
   const redirect = query.has('redirect');  // ?redirect 鐩存帴 302 璺宠浆
 
   const pool = category ? SOURCES.filter((s) => s.category === category) : SOURCES;
   if (pool.length === 0) return json({ success: false, error: '娌℃湁鍖归厤鐨勬暟鎹簮' }, 404);
 
   // 闅忔満灏濊瘯婧愶紙鏈€澶?5 娆★級锛屾寕涓€涓崲涓嬩竴涓?   const shuffled = [...pool].sort(() => Math.random() - 0.5);
   const MAX_ATTEMPTS = Math.min(shuffled.length, 5);
   let lastError = null;
 
   for (let i = 0; i < MAX_ATTEMPTS; i++) {
     const source = shuffled[i];
     try {
       const result = await fetchImageUrl(source);
 
       if (redirect) {
         return new Response(null, {
           status: 302,
           headers: { Location: result.url, ...CORS_HEADERS },
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
       lastError = e.message;
       continue;
     }
   }
 
   return json({ success: false, error: `鎵€鏈夋簮鍧囧け璐? ${lastError}` }, 502);
 }
 
 async function handleImage(sourceName, query) {
   const source = SOURCES.find((s) => s.name === sourceName);
   if (!source) return json({ success: false, error: '鏈煡鏁版嵁婧? }, 404);
 
   const redirect = query.has('redirect');
 
   try {
     const result = await fetchImageUrl(source);
 
     if (redirect) {
       return new Response(null, {
         status: 302,
         headers: { Location: result.url, ...CORS_HEADERS },
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
 
 // ---------- 棣栭〉 HTML ----------
 
 function renderIndex() {
   // 鎸夊垎绫诲垎缁?   const groups = {};
   for (const s of SOURCES) {
     const cat = s.category === 'anime' ? '浜屾鍏? : '涓夋鍏?鐪熶汉';
     if (!groups[cat]) groups[cat] = [];
     groups[cat].push(s);
   }
 
   const sourceRows = Object.entries(groups)
     .map(
       ([cat, list]) => `
     <h3>${cat}</h3>
     <div class="grid">
       ${list
         .map(
           (s) => `
         <div class="card" data-source="${s.name}">
           <div class="card-title">${s.label}</div>
           <div class="card-desc">${s.description || ''}</div>
           <div class="card-btns">
             <button onclick="testSource('${s.name}')">馃幉 娴嬭瘯</button>
             <button onclick="copyUrl('${s.name}')">馃搵 澶嶅埗API鍦板潃</button>
           </div>
           <div class="card-result" id="result-${s.name}"></div>
         </div>`
         )
         .join('')}
     </div>`
     )
     .join('');
 
   return `<!DOCTYPE html>
 <html lang="zh-CN">
 <head>
 <meta charset="utf-8">
 <meta name="viewport" content="width=device-width, initial-scale=1">
 <title>缇庡コ鍥?API 鑱氬悎浠ｇ悊</title>
 <style>
 * { margin: 0; padding: 0; box-sizing: border-box; }
 body {
   font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
   background: #0f0f13;
   color: #e4e4e7;
   padding: 24px;
   max-width: 1100px;
   margin: 0 auto;
 }
 h1 { font-size: 24px; margin-bottom: 4px; }
 .subtitle { color: #a1a1aa; margin-bottom: 20px; font-size: 14px; }
 .endpoints {
   background: #1a1a24;
   border-radius: 8px;
   padding: 16px;
   margin-bottom: 20px;
   font-size: 13px;
   line-height: 1.8;
 }
 .endpoints code {
   background: #2a2a36;
   padding: 2px 6px;
   border-radius: 4px;
   color: #fbbf24;
   font-size: 12px;
 }
 .endpoints a { color: #60a5fa; text-decoration: none; }
 .endpoints a:hover { text-decoration: underline; }
 h3 { font-size: 16px; margin: 16px 0 8px; color: #a1a1aa; }
 .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 12px; }
 .card {
   background: #1a1a24;
   border-radius: 8px;
   padding: 14px;
   border: 1px solid #27272a;
 }
 .card-title { font-size: 15px; font-weight: 600; margin-bottom: 4px; }
 .card-desc { font-size: 12px; color: #a1a1aa; margin-bottom: 10px; }
 .card-btns { display: flex; gap: 8px; }
 .card-btns button {
   background: #27272a;
   color: #e4e4e7;
   border: 1px solid #3f3f46;
   padding: 4px 10px;
   border-radius: 6px;
   cursor: pointer;
   font-size: 12px;
   transition: background 0.15s;
 }
 .card-btns button:hover { background: #3f3f46; }
 .card-result {
   margin-top: 8px;
   font-size: 12px;
   color: #a1a1aa;
   min-height: 18px;
   word-break: break-all;
 }
 .card-result img {
   max-width: 100%;
   max-height: 200px;
   border-radius: 6px;
   margin-top: 6px;
   display: block;
 }
 .card-result.error { color: #f87171; }
 .card-result.success { color: #4ade80; }
 /* 鍏ㄥ眬闅忔満鎸夐挳 */
 .random-bar {
   display: flex;
   gap: 10px;
   align-items: center;
   margin-bottom: 16px;
   flex-wrap: wrap;
 }
 .random-bar button {
   background: #2563eb;
   color: #fff;
   border: none;
   padding: 8px 18px;
   border-radius: 8px;
   cursor: pointer;
   font-size: 14px;
   font-weight: 500;
 }
 .random-bar button:hover { background: #1d4ed8; }
 .random-bar select {
   background: #1a1a24;
   color: #e4e4e7;
   border: 1px solid #3f3f46;
   padding: 6px 10px;
   border-radius: 6px;
   font-size: 13px;
 }
 .preview-box {
   margin-bottom: 20px;
   display: none;
 }
 .preview-box img {
   max-width: 100%;
   max-height: 60vh;
   border-radius: 10px;
   display: block;
 }
 .preview-box .meta {
   font-size: 12px;
   color: #a1a1aa;
   margin-top: 6px;
 }
 </style>
 </head>
 <body>
 <h1>馃柤锔?缇庡コ鍥?API 鑱氬悎浠ｇ悊</h1>
 <p class="subtitle">鑱氬悎 ${SOURCES.length} 涓叕寮€鍥炬簮锛屼竴閿儴缃插埌 Cloudflare Workers</p>
 
 <div class="endpoints">
   <strong>鎺ュ彛鍒楄〃锛?/strong><br>
   <code>GET /api/v1/random</code> 鈥?闅忔満涓€寮犲浘锛圝SON锛?br>
   <code>GET /api/v1/random?redirect</code> 鈥?闅忔満涓€寮犲浘锛?02 璺宠浆锛?br>
   <code>GET /api/v1/random?category=anime</code> 鈥?浠呬簩娆″厓<br>
   <code>GET /api/v1/image/:name</code> 鈥?鎸囧畾婧?鈫?<a href="/api/v1/image/vmy">/api/v1/image/vmy</a><br>
   <code>GET /api/v1/image/:name?redirect</code> 鈥?鎸囧畾婧?302 璺宠浆<br>
   <code>GET /api/v1/sources</code> 鈥?鍒楀嚭鎵€鏈夋簮 鈫?<a href="/api/v1/sources">鏌ョ湅</a>
 </div>
 
 <div class="random-bar">
   <button onclick="randomPreview('all')">馃幉 闅忔満涓€寮?/button>
   <select id="category-select">
     <option value="all">鍏ㄩ儴</option>
     <option value="realistic">涓夋鍏?鐪熶汉</option>
     <option value="anime">浜屾鍏?/option>
   </select>
   <button onclick="randomPreview(document.getElementById('category-select').value)">鎸夊垎绫婚殢鏈?/button>
 </div>
 
 <div class="preview-box" id="preview-box">
   <img id="preview-img" src="" alt="preview">
   <div class="meta" id="preview-meta"></div>
 </div>
 
 <h2 style="font-size:18px;margin:20px 0 8px;">馃摝 鏁版嵁婧?/h2>
 ${sourceRows}
 
 <script>
 async function testSource(name) {
   const el = document.getElementById('result-' + name);
   el.className = 'card-result';
   el.textContent = '璇锋眰涓?..';
   try {
     const r = await fetch('/api/v1/image/' + name);
     const d = await r.json();
     if (d.success) {
       el.className = 'card-result success';
       el.innerHTML = '<span>鉁?鎴愬姛</span><br><img src="' + d.data.url + '" loading="lazy">';
     } else {
       el.className = 'card-result error';
       el.textContent = '鉂?' + d.error;
     }
   } catch (e) {
     el.className = 'card-result error';
     el.textContent = '鉂?' + e.message;
   }
 }
 
 function copyUrl(name) {
   const url = window.location.origin + '/api/v1/image/' + name + '?redirect';
   navigator.clipboard.writeText(url).then(() => {
     const el = document.getElementById('result-' + name);
     el.className = 'card-result success';
     el.textContent = '鉁?宸插鍒讹細' + url;
   });
 }
 
 async function randomPreview(category) {
   const box = document.getElementById('preview-box');
   const img = document.getElementById('preview-img');
   const meta = document.getElementById('preview-meta');
   const url = category === 'all' ? '/api/v1/random' : '/api/v1/random?category=' + category;
   try {
     const r = await fetch(url);
     const d = await r.json();
     if (d.success) {
       box.style.display = 'block';
       img.src = d.data.url;
       meta.textContent = '鏉ユ簮: ' + d.data.label + ' | 鍒嗙被: ' + (d.data.category === 'anime' ? '浜屾鍏? : '涓夋鍏?);
     } else {
       meta.textContent = '鉂?' + d.error;
     }
   } catch (e) {
     meta.textContent = '鉂?' + e.message;
   }
 }
 </script>
 </body>
 </html>`;
 }
 
 // ---------- Worker 鍏ュ彛 ----------
 
 export default {
   async fetch(request, env, ctx) {
     try {
       const { parts, query } = parsePath(request.url);
 
       // OPTIONS 棰勬
       if (request.method === 'OPTIONS') {
         return new Response(null, { status: 204, headers: CORS_HEADERS });
       }
 
       // /api/v1/...
       if (parts[0] === 'api' && parts[1] === 'v1') {
         const route = parts[2]; // random | image | sources
 
         if (route === 'sources') return handleSources();
         if (route === 'random') return handleRandom(query);
         if (route === 'image' && parts[3]) return handleImage(parts[3], query);
 
         return json({ success: false, error: '鏈壘鍒拌矾鐢? }, 404);
       }
 
       // 棣栭〉
       return new Response(renderIndex(), {
         headers: { 'Content-Type': 'text/html; charset=utf-8', ...CORS_HEADERS },
       });
     } catch (e) {
       return json({ success: false, error: `鏈嶅姟鍣ㄥ唴閮ㄩ敊璇? ${e.message}` }, 500);
     }
   },
 };
