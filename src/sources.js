/**
 * 美女图 API 数据源定义
 * 每个源指定获取模式：
 *   - json:    请求返回 JSON，通过 extract 字段取出图片 URL
 *   - image:   直接返回图片二进制数据
 *   - redirect:请求返回 302 跳转，提取 Location 头
 */

const SOURCES = [
  // ---- 三次元/真人美女 ----
  {
    name: 'xxapi',
    label: 'XXAPI Beauty',
    description: 'Old-school random beauty image API, supports ?return=302 redirect',
    type: 'json',
    url: 'https://v2.xxapi.cn/api/meinvpic',
    extract: (d) => d?.data || d?.url || d?.imgurl,
    category: 'realistic',
  },
  {
    name: 'vmy',
    label: 'Weimeng Random',
    description: 'From ai-bz/bing, years of operation',
    type: 'json',
    url: 'https://api.52vmy.cn/api/img/tu/girl',
    extract: (d) => d?.url || d?.data?.url,
    category: 'realistic',
  },
  {
    name: 'mtyqx',
    label: 'Random Girl',
    description: 'Old-school API, returns image directly',
    type: 'image',
    url: 'http://api.mtyqx.cn/api/random.php',
    category: 'realistic',
  },
  {
    name: 'dmoe',
    label: 'DMOE Random Girl',
    description: 'Fresh style, returns image directly',
    type: 'image',
    url: 'http://www.dmoe.cc/random.php',
    category: 'realistic',
  },
  {
    name: 'lofter',
    label: 'Lofter Random',
    description: 'Supports JSON and redirect modes',
    type: 'json',
    url: 'https://api.ooopn.com/image/lofter/api.php?type=json',
    extract: (d) => d?.data?.url || d?.url || d?.imgurl,
    category: 'realistic',
  },
  {
    name: 'yviii-suiji',
    label: 'YVIII Random',
    description: 'HTTPS + CDN, portrait random',
    type: 'image',
    url: 'https://api.yviii.com/img/suiji',
    category: 'realistic',
  },
  {
    name: 'yviii-meitu',
    label: 'YVIII 4K Beauty',
    description: 'YVIII 4K HD beauty images',
    type: 'image',
    url: 'https://api.yviii.com/img/meitu',
    category: 'realistic',
  },
  {
    name: 'gezia',
    label: 'Bizhi Proxy',
    description: 'Portrait random girl image, 302 redirect',
    type: 'redirect',
    url: 'http://cn.gezia.top/api/mzt/?mom=302',
    category: 'realistic',
  },
  {
    name: 'suyanw',
    label: 'Suyanw Beauty',
    description: 'Returns JSON, years of maintenance',
    type: 'json',
    url: 'https://api.suyanw.cn/api/pcmv.php',
    extract: (d) => d?.url || d?.data?.url || d?.imgurl || d?.pcmv || d?.img,
    category: 'realistic',
  },
  {
    name: 'gz-pages',
    label: 'GZ-Pages PCMV',
    description: 'PCMV image source proxy',
    type: 'json',
    url: 'https://gz-api.pages.dev/pcmv',
    extract: (d) => d?.url || d?.data?.url || d?.imgurl,
    category: 'realistic',
  },

  // ---- 二次元/ACG ----
  {
    name: 'nmb',
    label: 'ACG Beauty Girl',
    description: 'Anime female character random image',
    type: 'image',
    url: 'https://api.nmb.show/1985acg.php',
    category: 'anime',
  },
  {
    name: 'eees',
    label: 'Anime Girl',
    description: 'Anime random image',
    type: 'image',
    url: 'https://tuapi.eees.cc/dongman.php',
    category: 'anime',
  },
  {
    name: 'dongmanxingkong',
    label: 'Anime Starry Sky',
    description: 'ACGMAN anime random, supports JSON',
    type: 'json',
    url: 'https://api.dongmanxingkong.com/suijitupian/acg/1080p/index.php?return=json',
    extract: (d) => d?.imgurl || d?.url || d?.data?.imgurl,
    category: 'anime',
  },
  {
    name: 'btstu',
    label: 'Anime Random',
    description: 'Specify lx=dongman for anime',
    type: 'image',
    url: 'http://api.btstu.cn/sjbz/?lx=dongman',
    category: 'anime',
  },
  {
    name: 'yviii-ecy',
    label: 'YVIII Anime',
    description: 'YVIII anime random image',
    type: 'image',
    url: 'https://api.yviii.com/img/ecy',
    category: 'anime',
  },
];

/**
 * 从指定源获取图片 URL
 * @param {object} source - 源配置对象
 * @returns {Promise<{url: string, type: string}>} 图片 URL 和 MIME 类型
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
      try { data = JSON.parse(text); } catch { throw new Error('非 JSON 响应'); }
      const imgUrl = source.extract(data);
      if (!imgUrl) throw new Error('JSON 中未找到图片 URL');
      // 确保 URL 是绝对地址
      const absoluteUrl = imgUrl.startsWith('http') ? imgUrl : new URL(imgUrl, source.url).href;
      return { url: absoluteUrl, source: source.name };
    }

    if (source.type === 'redirect') {
      const resp = await fetch(source.url, {
        method: 'HEAD',
        redirect: 'manual',
        signal: controller.signal,
      });
      // 先尝试 302
      if (resp.status >= 300 && resp.status < 400) {
        const location = resp.headers.get('Location');
        if (location) {
          const absoluteUrl = location.startsWith('http') ? location : new URL(location, source.url).href;
          return { url: absoluteUrl, source: source.name };
        }
      }
      // 降级：用 GET 请求
      const getResp = await fetch(source.url, { redirect: 'manual', signal: controller.signal });
      if (getResp.status >= 300 && getResp.status < 400) {
        const location = getResp.headers.get('Location');
        if (location) {
          const absoluteUrl = location.startsWith('http') ? location : new URL(location, source.url).href;
          return { url: absoluteUrl, source: source.name };
        }
      }
      throw new Error('未获取到跳转地址');
    }

    // image 类型：直接返回图片地址（由 proxy 来获取）
    return { url: source.url, source: source.name };
  } finally {
    clearTimeout(timeout);
  }
}

export { SOURCES, fetchImageUrl };
