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
    description: '老牌随机美女图，支持 JSON 返回',
    type: 'json',
    url: 'https://v2.xxapi.cn/api/meinvpic',
    extract: (d) => d?.data || d?.url || d?.imgurl,
    category: 'realistic',
  },
  {
    name: 'pic-re',
    label: 'Pic.re Random',
    description: '通用随机图片，支持多种分类',
    type: 'image',
    url: 'https://pic.re/image',
    category: 'realistic',
  },
  {
    name: 'mtyqx',
    label: 'Random Girl',
    description: '老牌随机美女图接口，返回图片直链',
    type: 'image',
    url: 'https://api.mtyqx.cn/api/random.php',
    category: 'realistic',
  },
  {
    name: 'dmoe',
    label: 'DMOE Random Girl',
    description: '小清新风格随机妹子图',
    type: 'image',
    url: 'https://www.dmoe.cc/random.php',
    category: 'realistic',
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
      const absoluteUrl = imgUrl.startsWith('http') ? imgUrl : new URL(imgUrl, source.url).href;
      return { url: absoluteUrl, source: source.name };
    }

    if (source.type === 'redirect') {
      const resp = await fetch(source.url, {
        method: 'HEAD',
        redirect: 'manual',
        signal: controller.signal,
      });
      if (resp.status >= 300 && resp.status < 400) {
        const location = resp.headers.get('Location');
        if (location) {
          const absoluteUrl = location.startsWith('http') ? location : new URL(location, source.url).href;
          return { url: absoluteUrl, source: source.name };
        }
      }
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

    // image 类型：直接返回图片地址（由客户端获取）
    return { url: source.url, source: source.name };
  } finally {
    clearTimeout(timeout);
  }
}

export { SOURCES, fetchImageUrl };
