/**
 * 美女图 API 数据源定义
 * 每个源指定获取模式：
 *   - json:     请求返回 JSON，通过 extract 字段取出图片 URL
 *   - image:    直接返回图片二进制数据（由客户端获取）
 *   - redirect: 请求返回 302 跳转，提取 Location 头
 *
 * 注意：部分 URI 自带末尾斜杠（如 yviii），因不带斜杠会返回 301 导致 HEAD 拿不到 Location
 */

const SOURCES = [
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
    name: 'vmy',
    label: '52VMy Girl',
    description: '随机美女图片，JSON 返回直链',
    type: 'json',
    url: 'https://api.52vmy.cn/api/img/tu/girl',
    extract: (d) => d?.url,
    category: 'realistic',
  },
  {
    name: 'suiji',
    label: '随机图片',
    description: '随机图片接口',
    type: 'redirect',
    url: 'https://api.yviii.com/img/suiji/',
    category: 'realistic',
  },
  {
    name: 'meitu',
    label: '美图',
    description: '美女图片接口',
    type: 'redirect',
    url: 'https://api.yviii.com/img/meitu/',
    category: 'realistic',
  },
  {
    name: 'baisi',
    label: '白丝',
    description: '白丝图片',
    type: 'redirect',
    url: 'https://api.yviii.com/img/baisi/',
    category: 'realistic',
  },
  {
    name: 'heisi',
    label: '黑丝',
    description: '黑丝图片',
    type: 'redirect',
    url: 'https://api.yviii.com/img/heisi/',
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
      if (!resp.ok) throw new Error(HTTP );
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
