 /**
  * 缇庡コ鍥?API 鏁版嵁婧愬畾涔?  * 姣忎釜婧愭寚瀹氳幏鍙栨ā寮忥細
  *   - json:    璇锋眰杩斿洖 JSON锛岄€氳繃 extract 瀛楁鍙栧嚭鍥剧墖 URL
  *   - image:   鐩存帴杩斿洖鍥剧墖浜岃繘鍒舵暟鎹?  *   - redirect:璇锋眰杩斿洖 302 璺宠浆锛屾彁鍙?Location 澶?  */
 const SOURCES = [
   // ---- 涓夋鍏?鐪熶汉缇庡コ ----
   {
     name: 'xxapi',
     label: 'XXAPI 缇庡コ',
     description: '鑰佺墝闅忔満缇庡コ鍥撅紝鏀寔 ?return=302 鐩存帴璺宠浆',
     type: 'json',
     url: 'https://v2.xxapi.cn/api/meinvpic',
     extract: (d) => d?.data || d?.url || d?.imgurl,
     category: 'realistic',
   },
   {
     name: 'vmy',
     label: '缁存ⅵ闅忔満缇庡コ',
     description: '鏉ヨ嚜鐖卞绾?蹇呭簲锛屽骞磋繍钀?,
     type: 'json',
     url: 'https://api.52vmy.cn/api/img/tu/girl',
     extract: (d) => d?.url || d?.data?.url,
     category: 'realistic',
   },
   {
     name: 'mtyqx',
     label: '闅忔満濡瑰瓙鍥?,
     description: '鑰佺墝鎺ュ彛锛岀洿鎺ヨ繑鍥炲浘鐗?,
     type: 'image',
     url: 'http://api.mtyqx.cn/api/random.php',
     category: 'realistic',
   },
   {
     name: 'dmoe',
     label: 'DMOE 闅忔満濡瑰瓙',
     description: '灏忔竻鏂伴鏍硷紝鐩存帴杩斿洖鍥剧墖',
     type: 'image',
     url: 'http://www.dmoe.cc/random.php',
     category: 'realistic',
   },
   {
     name: 'lofter',
     label: 'Lofter 闅忔満鍥?,
     description: '鏀寔 JSON 鍜岃烦杞袱绉嶆ā寮?,
     type: 'json',
     url: 'https://api.ooopn.com/image/lofter/api.php?type=json',
     extract: (d) => d?.data?.url || d?.url || d?.imgurl,
     category: 'realistic',
   },
   {
     name: 'yviii-suiji',
     label: 'YVIII 闅忔満缇庡浘',
     description: 'HTTPS + CDN锛岀珫灞忛殢鏈?,
     type: 'image',
     url: 'https://api.yviii.com/img/suiji',
     category: 'realistic',
   },
   {
     name: 'yviii-meitu',
     label: 'YVIII 4K缇庡コ',
     description: 'YVIII 4K 楂樻竻缇庡コ鍥?,
     type: 'image',
     url: 'https://api.yviii.com/img/meitu',
     category: 'realistic',
   },
   {
     name: 'gezia',
     label: '褰煎哺鍥剧綉浠ｇ悊',
     description: '绔栧睆闅忔満濡瑰瓙鍥撅紝302璺宠浆',
     type: 'redirect',
     url: 'http://cn.gezia.top/api/mzt/?mom=302',
     category: 'realistic',
   },
   {
     name: 'suyanw',
     label: 'Suyanw 缇庡コ鍥?,
     description: '杩斿洖 JSON锛屽骞寸淮鎶?,
     type: 'json',
     url: 'https://api.suyanw.cn/api/pcmv.php',
     extract: (d) => d?.url || d?.data?.url || d?.imgurl || d?.pcmv || d?.img,
     category: 'realistic',
   },
   {
     name: 'gz-pages',
     label: 'GZ-Pages PCMV',
     description: 'PCMV 鍥炬簮浠ｇ悊',
     type: 'json',
     url: 'https://gz-api.pages.dev/pcmv',
     extract: (d) => d?.url || d?.data?.url || d?.imgurl,
     category: 'realistic',
   },
   // ---- 浜屾鍏?ACG ----
   {
     name: 'nmb',
     label: 'ACG 缇庡皯濂?,
     description: '浜屾鍏冨コ鎬ц鑹查殢鏈哄浘',
     type: 'image',
     url: 'https://api.nmb.show/1985acg.php',
     category: 'anime',
   },
   {
     name: 'eees',
     label: '鍔ㄦ极濡瑰瓙',
     description: '浜屾鍏冮殢鏈哄浘',
     type: 'image',
     url: 'https://tuapi.eees.cc/dongman.php',
     category: 'anime',
   },
   {
     name: 'dongmanxingkong',
     label: '鍔ㄦ极鏄熺┖',
     description: 'ACGMAN 浜屾鍏冮殢鏈猴紝鏀寔 JSON',
     type: 'json',
     url: 'https://api.dongmanxingkong.com/suijitupian/acg/1080p/index.php?return=json',
     extract: (d) => d?.imgurl || d?.url || d?.data?.imgurl,
     category: 'anime',
   },
   {
     name: 'btstu',
     label: '浜屾鍏冮殢鏈?,
     description: '鎸囧畾 lx=dongman 鑾峰彇浜屾鍏?,
     type: 'image',
     url: 'http://api.btstu.cn/sjbz/?lx=dongman',
     category: 'anime',
   },
   {
     name: 'yviii-ecy',
     label: 'YVIII 浜屾鍏?,
     description: 'YVIII 浜屾鍏冮殢鏈哄浘',
     type: 'image',
     url: 'https://api.yviii.com/img/ecy',
     category: 'anime',
   },
 ];
 
 /**
  * 浠庢寚瀹氭簮鑾峰彇鍥剧墖 URL
  * @param {object} source - 婧愰厤缃璞?  * @returns {Promise<{url: string, type: string}>} 鍥剧墖 URL 鍜?MIME 绫诲瀷
  */
 async function fetchImageUrl(source) {
   const controller = new AbortController();
   const timeout = setTimeout(() => controller.abort(), 10000);
 
   try {
     if (source.type === 'json') {
       const resp = await fetch(source.url, { signal: controller.signal });
       if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
       const text = await resp.text();
       let data;
       try { data = JSON.parse(text); } catch { throw new Error('闈?JSON 鍝嶅簲'); }
       const imgUrl = source.extract(data);
       if (!imgUrl) throw new Error('JSON 涓湭鎵惧埌鍥剧墖 URL');
       // 纭繚 URL 鏄粷瀵瑰湴鍧€
       const absoluteUrl = imgUrl.startsWith('http') ? imgUrl : new URL(imgUrl, source.url).href;
       return { url: absoluteUrl, source: source.name };
     }
 
     if (source.type === 'redirect') {
       const resp = await fetch(source.url, {
         method: 'HEAD',
         redirect: 'manual',
         signal: controller.signal,
       });
       // 鍏堝皾璇?302
       if (resp.status >= 300 && resp.status < 400) {
         const location = resp.headers.get('Location');
         if (location) {
           const absoluteUrl = location.startsWith('http') ? location : new URL(location, source.url).href;
           return { url: absoluteUrl, source: source.name };
         }
       }
       // 闄嶇骇锛氱敤 GET 璇锋眰
       const getResp = await fetch(source.url, { redirect: 'manual', signal: controller.signal });
       if (getResp.status >= 300 && getResp.status < 400) {
         const location = getResp.headers.get('Location');
         if (location) {
           const absoluteUrl = location.startsWith('http') ? location : new URL(location, source.url).href;
           return { url: absoluteUrl, source: source.name };
         }
       }
       throw new Error('鏈幏鍙栧埌璺宠浆鍦板潃');
     }
 
     // image 绫诲瀷锛氱洿鎺ヨ繑鍥炲浘鐗囧湴鍧€锛堢敱 proxy 鏉ヨ幏鍙栵級
     return { url: source.url, source: source.name };
   } finally {
     clearTimeout(timeout);
   }
 }
 
 export { SOURCES, fetchImageUrl };
