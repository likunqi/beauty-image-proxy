 <p align="center">
   <h1 align="center">馃柤锔?Beauty Image Proxy</h1>
   <p align="center">
     缇庡コ鍥?API 鑱氬悎浠ｇ悊 路 涓€閿儴缃插埌 Cloudflare Workers
     <br>
     鑱氬悎 8 涓叕寮€鍥炬簮锛岀粺涓€鎺ュ彛杈撳嚭锛岃嚜鍔ㄥ閿?
   </p>
 </p>


 <div align="center">


 [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/likunqi/beauty-image-proxy)
 [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
 [![Wrangler](https://img.shields.io/badge/wrangler-3.x-orange)](https://developers.cloudflare.com/workers/wrangler/)
 [![Node](https://img.shields.io/badge/node-%3E%3D18-brightgreen)](https://nodejs.org/)

 </div>

 ## 椤圭洰姒傝堪

 鍦?Cloudflare Workers 涓婅繍琛岀殑鍏嶈垂缇庡コ鍥?API 浠ｇ悊鏈嶅姟銆傝仛鍚堜簡 8 涓叕寮€鍥炬簮锛屽皢涓嶅悓鐨勫搷搴旀牸寮忥紙JSON / 鐩存帴鍥剧墖 / 302 璺宠浆锛夌粺涓€涓轰竴鑷寸殑鎺ュ彛杈撳嚭锛屾敮鎸佽嚜鍔ㄥ閿欏垏鎹€?

 ### 鏍稿績鐗规€?

 - 馃幆 **鑱氬悎 8 涓浘婧?* - 娑电洊涓夋鍏?鐪熶汉鍜屼簩娆″厓/ACG 涓ゅぇ绫?
 - 馃攢 **缁熶竴鎺ュ彛** - JSON 杩斿洖 + 302 鐩撮摼璺宠浆锛堝吋瀹?`<img src>`锛?
 - 馃攧 **鑷姩瀹归敊** - 婧愭寕浜嗚嚜鍔ㄥ皾璇曚笅涓€涓紙鏈€澶氳瘯 5 涓級
 - 鈴?**瓒呮椂淇濇姢** - 10 绉掕秴鏃讹紝閬垮厤璇锋眰鎸傛
 - 馃帥 **绠＄悊鍚庡彴** - 鍐呯疆 Web 鐣岄潰锛屽湪绾挎祴璇曟瘡涓浘婧?
 - 馃寪 **CORS 鍏ㄥ紑** - 鍓嶇鐩存帴璋冪敤
 - 馃彿 **鍒嗙被杩囨护** - `category=realistic` / `category=anime`
 - 馃挵 **闆舵垚鏈?* - Cloudflare Workers 鍏嶈垂璁″垝瓒冲鏃ュ父浣跨敤

 ## 鐩綍

 - [API 鏂囨。](#api-鏂囨。)
 - [鑱氬悎鍥炬簮鍒楄〃](#鑱氬悎鍥炬簮鍒楄〃)
 - [閮ㄧ讲鎸囧崡](#閮ㄧ讲鎸囧崡)
   - [涓€閿儴缃诧紙鎺ㄨ崘锛塢(#鏂瑰紡涓€涓€閿儴缃叉帹鑽?
   - [GitHub Actions 鑷姩閮ㄧ讲](#鏂瑰紡浜実ithub-actions-鑷姩閮ㄧ讲)
   - [Wrangler CLI 閮ㄧ讲](#鏂瑰紡涓墂rangler-cli-閮ㄧ讲)
   - [Cloudflare Dashboard 閮ㄧ讲](#鏂瑰紡鍥沜loudflare-dashboard-鎵嬪姩閮ㄧ讲)
 - [浣跨敤绀轰緥](#浣跨敤绀轰緥)
 - [蹇€熶笂鎵媇(#蹇€熶笂鎵?
 - [鏈湴寮€鍙慮(#鏈湴寮€鍙?
 - [甯歌闂](#甯歌闂)
 - [澹版槑](#澹版槑)

---

 ## API 鏂囨。

 鎵€鏈夋帴鍙ｉ儴缃插湪 `https://beauty-image-proxy.<浣犵殑鐢ㄦ埛鍚?.workers.dev`锛屼互涓嬪姞 `/api/v1/` 鍓嶇紑銆?

 ### 鎺ュ彛涓€瑙?

| 鏂规硶 | 璺緞                                | 璇存槑                                  |
| ---- | ----------------------------------- | ------------------------------------- |
| GET  | `/`                                 | 绠＄悊鍚庡彴 - 鍦ㄧ嚎娴嬭瘯姣忎釜鍥炬簮銆侀殢鏈洪瑙?|
| GET  | `/api/v1/random`                    | 闅忔満鍥剧墖锛圝SON锛?                     |
| GET  | `/api/v1/random?redirect`           | 闅忔満鍥剧墖锛?02 璺宠浆锛屽吋瀹?`<img>`锛?   |
| GET  | `/api/v1/random?category=anime`     | 浠呬簩娆″厓闅忔満                          |
| GET  | `/api/v1/random?category=realistic` | 浠呬笁娆″厓闅忔満                          |
| GET  | `/api/v1/image/:name`               | 鎸囧畾鍥炬簮锛圝SON锛?                     |
| GET  | `/api/v1/image/:name?redirect`      | 鎸囧畾鍥炬簮锛?02 璺宠浆锛?                 |
| GET  | `/api/v1/sources`                   | 鏁版嵁婧愬垪琛?                           |

 ### 鍝嶅簲鏍煎紡

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

 ### 绠＄悊鍚庡彴

 閮ㄧ讲鍚庤闂牴璺緞 `/` 鍗冲彲鐪嬪埌鍐呯疆鐨勭鐞嗗悗鍙帮細

 - 姣忎釜鍥炬簮鏈夌嫭绔嬬殑銆屾祴璇曘€嶆寜閽紝涓€閿獙璇佸彲鐢ㄦ€?
 - 闅忔満棰勮 + 鍒嗙被绛涢€?
 - 澶嶅埗 API 鐩撮摼鍦板潃
 - 娣辫壊 UI锛屽搷搴斿紡璁捐

---

 ## 鑱氬悎鍥炬簮鍒楄〃

 鑱氬悎浜嗕互涓?**8 涓?* 鍏紑鍏嶈垂鍥炬簮锛堝凡鍓旈櫎澶辨晥婧愶紝鏇挎崲涓烘洿绋冲畾鐨勬浛浠ｏ級锛?

 ### 涓夋鍏?/ 鐪熶汉缇庡コ

| 鍚嶇О             | 绫诲瀷     | 璇存槑                 |
| ---------------- | -------- | -------------------- |
| XXAPI Beauty     | JSON     | 鑰佺墝闅忔満缇庡コ鍥?      |
| Pic.re Random    | 鐩存帴鍥剧墖 | 閫氱敤闅忔満鍥剧墖         |
| Random Girl      | 鐩存帴鍥剧墖 | 鑰佺墝闅忔満缇庡コ鍥炬帴鍙?  |
| DMOE Random Girl | 鐩存帴鍥剧墖 | 灏忔竻鏂伴鏍奸殢鏈哄瀛愬浘 |

 ### 浜屾鍏?/ ACG

| 鍚嶇О        | 绫诲瀷     | 璇存槑                           |
| ----------- | -------- | ------------------------------ |
| Nekos.life  | JSON     | 缁忓吀浜屾鍏冪尗濞橀殢鏈哄浘锛岄暱鏈熺淮鎶?|
| Nekos.best  | JSON     | 浜屾鍏冨姩婕鑹查殢鏈哄浘锛岄珮娓呯敾璐?|
| LoliAPI ACG | 302 璺宠浆 | 浜屾鍏冨姩婕绾?                |
| LoliAPI PC  | 302 璺宠浆 | 鍔ㄦ极 PC 澹佺焊                   |

---

 ## 閮ㄧ讲鎸囧崡

 ### 鏂瑰紡涓€锛氫竴閿儴缃诧紙鎺ㄨ崘锛?

 [![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/likunqi/beauty-image-proxy)

  1. 鐐瑰嚮涓婃柟鎸夐挳
  2. 鐧诲綍/娉ㄥ唽 Cloudflare 璐﹀彿锛堝厤璐癸級
  3. 纭鍒涘缓 Worker
  4. 閮ㄧ讲瀹屾垚鍗冲彲浣跨敤

 ### 鏂瑰紡浜岋細GitHub Actions 鑷姩閮ㄧ讲

 Fork 浠撳簱鍚庯紝鍦?GitHub 浠撳簱璁剧疆涓坊鍔犱袱涓?Secrets锛?

| Secret            | 璇存槑                |
| ----------------- | ------------------- |
| `CF_API_TOKEN`    | Cloudflare API 浠ょ墝 |
| `CF_ACCOUNT_NAME` | Cloudflare 璐︽埛鍚?  |

 鎺ㄩ€?`main` 鍒嗘敮鑷姩閮ㄧ讲銆?

 ### 鏂瑰紡涓夛細Wrangler CLI 閮ㄧ讲

 ```bash
git clone https://github.com/likunqi/beauty-image-proxy.git
cd beauty-image-proxy
npm install
npx wrangler login
npx wrangler deploy
 ```

 ### 鏂瑰紡鍥涳細Cloudflare Dashboard 鎵嬪姩閮ㄧ讲

 灏?`src/index.js` 鍜?`src/sources.js` 鍐呭鍚堝苟鍚庣矘璐村埌 Worker 缂栬緫鍣ㄣ€?

---

 ## 浣跨敤绀轰緥

 ### HTML `<img>` 鏍囩

 ```html
<img src="https://浣犵殑鍩熷悕.workers.dev/api/v1/random?redirect">
<img src="https://浣犵殑鍩熷悕.workers.dev/api/v1/image/xxapi?redirect">
<img src="https://浣犵殑鍩熷悕.workers.dev/api/v1/random?category=anime&redirect">
 ```

 ### JavaScript / Fetch

 ```js
const res = await fetch("https://浣犵殑鍩熷悕.workers.dev/api/v1/random");
const data = await res.json();
document.querySelector("img").src = data.data.url;
 ```

 ### Python / Requests

 ```python
import requests
resp = requests.get("https://浣犵殑鍩熷悕.workers.dev/api/v1/random")
data = resp.json()
print(data["data"]["url"])
 ```

 ### cURL

 ```bash
curl -s https://浣犵殑鍩熷悕.workers.dev/api/v1/random | jq .
curl -L -o img.jpg https://浣犵殑鍩熷悕.workers.dev/api/v1/random?redirect
 ```

---

 ## 鏈湴寮€鍙?

 ```bash
npm install
npx wrangler dev
# 璁块棶 http://localhost:8787
 ```

 ### 娣诲姞鏂板浘婧?

 缂栬緫 `src/sources.js`锛屽湪 `SOURCES` 鏁扮粍涓坊鍔狅細

 ```js
{
  name: "my-source",
  label: "鎴戠殑鍥炬簮",
  type: "json",          // json / image / redirect
  url: "https://...",
  extract: (d) => d.url, // json 绫诲瀷闇€瑕?
  category: "realistic",  // realistic / anime
}
 ```

---

 ## 椤圭洰缁撴瀯

 ```
beauty-image-proxy/
鈹溾攢鈹€ src/
鈹?  鈹溾攢鈹€ index.js         # Worker 鍏ュ彛 + 璺敱 + 绠＄悊鍚庡彴
鈹?  鈹斺攢鈹€ sources.js       # 8 涓?API 婧愬畾涔?
鈹溾攢鈹€ .github/workflows/
鈹?  鈹斺攢鈹€ deploy.yml       # GitHub Actions 鑷姩閮ㄧ讲
鈹溾攢鈹€ wrangler.toml        # Cloudflare 閰嶇疆
鈹溾攢鈹€ package.json
鈹斺攢鈹€ README.md
 ```

---

 ## 甯歌闂

 ### 鍥炬簮绋冲畾鍚楋紵

 鍏嶈垂鍏泭 API 娌℃湁缁濆涓嶆寕鐨勩€傞」鐩仛浜嗗灞傚閿欙細

 - 姣忔璇锋眰闅忔満鎵撲贡婧愰『搴?
 - 澶辫触鑷姩鍒囨崲涓嬩竴涓紙鏈€澶?5 涓級
 - 10 绉掕秴鏃朵繚鎶?
 - 鍐呯疆绠＄悊鍚庡彴鍙殢鏃舵祴璇?

 ### 鏀惰垂鍚楋紵

 瀹屽叏鍏嶈垂銆侰loudflare Workers 鍏嶈垂璁″垝姣忓ぉ 10 涓囨璇锋眰锛屼釜浜轰娇鐢ㄨ冻澶熴€?

 ### 濡備綍绉婚櫎鏌愪釜婧愶紵

 鍦?`src/sources.js` 涓敞閲婃垨鍒犻櫎瀵瑰簲閰嶇疆锛岄噸鏂伴儴缃插嵆鍙€?

---

 ## 澹版槑

 - 浠呯敤浜庡涔犲拰鐮旂┒鐩殑
 - 鏁版嵁鏉ユ簮鏁寸悊鑷?[鑵捐鍏冨疂](https://yb.tencent.com/s/FP4V1yLgzUcL) 鐨勫叕寮€鍥炵瓟
 - 涓嶅瓨鍌ㄣ€佺紦瀛樹换浣曞浘鐗囧唴瀹?
 - 浣跨敤璇烽伒瀹堝悇 API 婧愮殑浣跨敤鏉℃

---

 <p align="center">
   濡傛灉瑙夊緱杩欎釜椤圭洰鏈夊府鍔╋紝娆㈣繋 猸?Star
   <br>
   Built with Cloudflare Workers
 </p>

