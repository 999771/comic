// DOM元素
const elements = {
  searchInput: document.getElementById('search-input'),
  searchBtn: document.getElementById('search-btn'),
  backBtn: document.getElementById('back-btn'),
  comicList: document.getElementById('comic-list'),
  comicDetail: document.getElementById('comic-detail'),
  loading: document.getElementById('loading'),
  detailTitle: document.getElementById('detail-title'),
  detailCover: document.getElementById('detail-cover'),
  detailAuthor: document.getElementById('detail-author'),
  detailCategory: document.getElementById('detail-category'),
  detailDesc: document.getElementById('detail-desc'),
  chapterList: document.getElementById('chapter-list')
};

// 当前状态
let currentState = {
  comics: [],
  currentComic: null
};

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 事件监听
  elements.searchBtn.addEventListener('click', handleSearch);
  elements.searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleSearch();
  });
  elements.backBtn.addEventListener('click', showComicList);
  
  // 初始加载热门漫画
  loadHotComics();
});

// 搜索处理
async function handleSearch() {
  const keyword = elements.searchInput.value.trim();
  if (!keyword) return;
  
  showLoading();
  try {
    const comics = await searchComics(keyword);
    currentState.comics = comics;
    renderComicList(comics);
  } catch (error) {
    console.error("搜索失败:", error);
    alert("搜索失败，请稍后重试");
  } finally {
    hideLoading();
  }
}

// 真实API搜索
async function searchComics(keyword) {
  const response = await fetch(`/api/search?q=${encodeURIComponent(keyword)}`);
  if (!response.ok) throw new Error('搜索失败');
  const data = await response.json();
  
  return data.map(item => ({
    name: item.title || item.book_name,
    cover: ensureAbsoluteUrl(item.cover || item.cover_url),
    author: item.author || item.author_name,
    detailUrl: item.url || `http://manwaso.cc/book/${item.id}`
  }));
}

// 确保URL是绝对路径
function ensureAbsoluteUrl(url) {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  if (url.startsWith('//')) return `https:${url}`;
  return `https://manwaso.cc${url.startsWith('/') ? '' : '/'}${url}`;
}

// 渲染漫画列表
function renderComicList(comics) {
  elements.comicList.innerHTML = '';
  
  if (comics.length === 0) {
    elements.comicList.innerHTML = '<p class="no-result">没有找到相关漫画</p>';
    return;
  }
  
  comics.forEach(comic => {
    const comicEl = document.createElement('div');
    comicEl.className = 'comic-card';
    comicEl.innerHTML = `
      <img src="${comic.cover}" alt="${comic.name}" class="comic-cover" 
           onerror="handleImageError(this)">
      <div class="comic-info">
        <div class="comic-title">${comic.name}</div>
        <div class="comic-author">${comic.author || '作者未知'}</div>
      </div>
    `;
    
    comicEl.addEventListener('click', () => showComicDetail(comic));
    elements.comicList.appendChild(comicEl);
  });
}

// 显示漫画详情
async function showComicDetail(comic) {
  showLoading();
  currentState.currentComic = comic;
  
  try {
    const detail = await fetchComicDetail(comic.detailUrl);
    
    // 填充详情数据
    elements.detailTitle.textContent = detail.title;
    elements.detailCover.src = detail.cover;
    elements.detailCover.onerror = function() {
      handleImageError(this);
    };
    elements.detailAuthor.textContent = detail.author;
    elements.detailCategory.textContent = detail.category;
    elements.detailDesc.textContent = detail.desc;
    
    // 渲染章节列表
    renderChapterList(detail.chapters);
    
    // 切换视图
    elements.comicList.style.display = 'none';
    elements.comicDetail.style.display = 'block';
  } catch (error) {
    console.error("获取详情失败:", error);
    alert("获取漫画详情失败");
  } finally {
    hideLoading();
  }
}

// 获取漫画详情
async function fetchComicDetail(url) {
  const response = await fetch(`/api/detail?url=${encodeURIComponent(url)}`);
  if (!response.ok) throw new Error('获取详情失败');
  const data = await response.json();
  
  return {
    title: data.title || data.book_name,
    cover: ensureAbsoluteUrl(data.cover || data.cover_url),
    author: data.author || '作者未知',
    category: data.category || data.tags?.join(', ') || '未知',
    desc: data.desc || '暂无简介',
    chapters: data.chapters?.map((chap, idx) => ({
      name: chap.name || `第${idx + 1}章`,
      url: chap.url || `${url}/chapter/${idx + 1}`
    })) || []
  };
}

// 渲染章节列表
function renderChapterList(chapters) {
  elements.chapterList.innerHTML = '';
  
  chapters.forEach((chapter, index) => {
    const chapterEl = document.createElement('div');
    chapterEl.className = 'chapter-item';
    chapterEl.textContent = chapter.name;
    chapterEl.addEventListener('click', () => {
      alert(`准备阅读 ${chapter.name}`);
      // 实际项目中这里会打开阅读器
    });
    elements.chapterList.appendChild(chapterEl);
  });
}

// 显示漫画列表
function showComicList() {
  elements.comicDetail.style.display = 'none';
  elements.comicList.style.display = 'grid';
}

// 加载热门漫画
async function loadHotComics() {
  showLoading();
  try {
    const comics = await fetchHotComics();
    currentState.comics = comics;
    renderComicList(comics);
  } catch (error) {
    console.error("加载热门漫画失败:", error);
  } finally {
    hideLoading();
  }
}

// 获取热门漫画
async function fetchHotComics() {
  const response = await fetch('/api/hot');
  if (!response.ok) throw new Error('加载热门失败');
  const data = await response.json();
  
  return data.map(item => ({
    name: item.title || item.book_name,
    cover: ensureAbsoluteUrl(item.cover || item.cover_url),
    author: item.author || item.author_name,
    detailUrl: item.url || `http://manwaso.cc/book/${item.id}`
  }));
}

// 显示/隐藏加载状态
function showLoading() {
  elements.loading.style.display = 'block';
}

function hideLoading() {
  elements.loading.style.display = 'none';
}
