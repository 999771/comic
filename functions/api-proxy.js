export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const apiUrl = 'http://manwaso.cc';

    // 搜索代理
    if (url.pathname === '/api/search') {
      const searchKey = url.searchParams.get('q');
      const targetUrl = `${apiUrl}/search?keyword=${encodeURIComponent(searchKey)}`;
      
      return fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': apiUrl
        }
      });
    }

    // 详情代理
    if (url.pathname === '/api/detail') {
      const detailUrl = url.searchParams.get('url');
      const targetUrl = detailUrl.includes(apiUrl) ? detailUrl : `${apiUrl}${detailUrl}`;
      
      return fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': apiUrl
        }
      });
    }

    // 热门漫画
    if (url.pathname === '/api/hot') {
      const targetUrl = `${apiUrl}/getUpdate?page=0`;
      
      return fetch(targetUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Referer': apiUrl
        }
      });
    }

    return new Response('Not Found', { status: 404 });
  }
}
