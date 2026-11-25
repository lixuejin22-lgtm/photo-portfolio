// ===== 数据初始化 =====
const STORAGE_KEY = 'photo_portfolio';

function loadData() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}
function saveData(d) { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); }

// 示例作品（使用 Unsplash 随机图）
const DEMO_PHOTOS = [
  { id: 1, title: '晨雾山谷', desc: '清晨第一缕阳光穿透云层', category: 'landscape', src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800', likes: 42 },
  { id: 2, title: '街角故事', desc: '上海南京路的傍晚', category: 'street',    src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=800', likes: 28 },
  { id: 3, title: '光影之间', desc: '自然光人像', category: 'portrait',  src: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=800', likes: 67 },
  { id: 4, title: '星空旷野', desc: '内蒙古戈壁银河', category: 'landscape', src: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800', likes: 95 },
  { id: 5, title: '雨中城市', desc: '霓虹映在湿润的路面', category: 'street',    src: 'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=800', likes: 33 },
  { id: 6, title: '素颜', desc: '简单背景，真实情绪', category: 'portrait',  src: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=800', likes: 51 },
  { id: 7, title: '云海之上', desc: '黄山日出前的片刻', category: 'landscape', src: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800', likes: 82 },
  { id: 8, title: '市集人群', desc: '成都宽窄巷子', category: 'street',    src: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800', likes: 19 },
];

// ===== 状态 =====
let photos   = [...DEMO_PHOTOS];
let userData = loadData();
let currentFilter = 'all';
let lightboxIndex  = 0;

function getLiked(id)      { return !!(userData[`like_${id}`]); }
function getBookmarked(id) { return !!(userData[`bm_${id}`]); }
function getLikeCount(id)  {
  const base = photos.find(p => p.id === id)?.likes || 0;
  return base + (getLiked(id) ? 1 : 0);
}

// ===== 渲染 =====
const gallery   = document.getElementById('gallery');
const emptyState = document.getElementById('empty-state');

function filteredPhotos() {
  if (currentFilter === 'bookmarks') return photos.filter(p => getBookmarked(p.id));
  if (currentFilter === 'all') return photos;
  return photos.filter(p => p.category === currentFilter);
}

function renderGallery() {
  const list = filteredPhotos();
  gallery.innerHTML = '';
  emptyState.style.display = list.length === 0 ? 'block' : 'none';

  list.forEach((photo, idx) => {
    const liked      = getLiked(photo.id);
    const bookmarked = getBookmarked(photo.id);
    const likeCount  = getLikeCount(photo.id);

    const card = document.createElement('div');
    card.className = 'photo-card';
    card.dataset.id  = photo.id;
    card.dataset.idx = idx;
    card.innerHTML = `
      <span class="card-category">${catLabel(photo.category)}</span>
      <img src="${photo.src}" alt="${photo.title}" loading="lazy"/>
      <div class="card-overlay">
        <div class="card-title">${photo.title}</div>
        <div class="card-desc">${photo.desc}</div>
        <div class="card-actions">
          <button class="card-btn like-btn ${liked ? 'liked' : ''}" data-id="${photo.id}">
            <i class="fa-heart ${liked ? 'fa-solid' : 'fa-regular'}"></i> ${likeCount}
          </button>
          <button class="card-btn bm-btn ${bookmarked ? 'bookmarked' : ''}" data-id="${photo.id}">
            <i class="fa-bookmark ${bookmarked ? 'fa-solid' : 'fa-regular'}"></i>
            ${bookmarked ? '已收藏' : '收藏'}
          </button>
        </div>
      </div>`;

    card.addEventListener('click', (e) => {
      if (e.target.closest('.card-btn')) return;
      openLightbox(photo.id);
    });

    gallery.appendChild(card);
  });

  updateBadges();
  bindCardBtns();
}

function catLabel(cat) {
  return { landscape: '风光', portrait: '人像', street: '街拍' }[cat] || cat;
}

function bindCardBtns() {
  document.querySelectorAll('.like-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); toggleLike(+btn.dataset.id); });
  });
  document.querySelectorAll('.bm-btn').forEach(btn => {
    btn.addEventListener('click', e => { e.stopPropagation(); toggleBookmark(+btn.dataset.id); });
  });
}

// ===== 点赞 / 收藏 =====
function toggleLike(id) {
  userData[`like_${id}`] = !getLiked(id);
  saveData(userData);
  renderGallery();
  if (lightboxOpen && currentLbId === id) updateLightboxButtons(id);
}

function toggleBookmark(id) {
  userData[`bm_${id}`] = !getBookmarked(id);
  saveData(userData);
  renderGallery();
  if (lightboxOpen && currentLbId === id) updateLightboxButtons(id);
}

function updateBadges() {
  const totalLikes = photos.reduce((s, p) => s + (getLiked(p.id) ? 1 : 0), 0);
  const totalBm    = photos.filter(p => getBookmarked(p.id)).length;
  document.getElementById('like-count').textContent     = `❤️ ${totalLikes}`;
  document.getElementById('bookmark-count').textContent = `🔖 ${totalBm}`;
}

// ===== 灯箱 =====
const lightbox  = document.getElementById('lightbox');
const lbOverlay = document.getElementById('lb-overlay');
let lightboxOpen = false;
let currentLbId  = null;

function openLightbox(id) {
  const photo = photos.find(p => p.id === id);
  if (!photo) return;
  currentLbId = id;
  lightboxIndex = filteredPhotos().findIndex(p => p.id === id);

  document.getElementById('lb-img').src       = photo.src;
  document.getElementById('lb-title').textContent = photo.title;
  document.getElementById('lb-desc').textContent  = photo.desc;
  updateLightboxButtons(id);

  lightbox.classList.add('active');
  lbOverlay.classList.add('active');
  lightboxOpen = true;
}

function closeLightbox() {
  lightbox.classList.remove('active');
  lbOverlay.classList.remove('active');
  lightboxOpen = false;
  currentLbId  = null;
}

function updateLightboxButtons(id) {
  const liked      = getLiked(id);
  const bookmarked = getBookmarked(id);
  const likeBtn    = document.getElementById('lb-like');
  const bmBtn      = document.getElementById('lb-bookmark');

  document.getElementById('lb-like-count').textContent = getLikeCount(id);
  likeBtn.className = `btn-action ${liked ? 'liked' : ''}`;
  likeBtn.innerHTML = `<i class="fa-heart ${liked ? 'fa-solid' : 'fa-regular'}"></i> <span id="lb-like-count">${getLikeCount(id)}</span>`;
  bmBtn.className   = `btn-action ${bookmarked ? 'bookmarked' : ''}`;
  bmBtn.innerHTML   = `<i class="fa-bookmark ${bookmarked ? 'fa-solid' : 'fa-regular'}"></i> ${bookmarked ? '已收藏' : '收藏'}`;
}

document.getElementById('lb-close').addEventListener('click', closeLightbox);
lbOverlay.addEventListener('click', closeLightbox);

document.getElementById('lb-prev').addEventListener('click', () => {
  const list = filteredPhotos();
  lightboxIndex = (lightboxIndex - 1 + list.length) % list.length;
  openLightbox(list[lightboxIndex].id);
});
document.getElementById('lb-next').addEventListener('click', () => {
  const list = filteredPhotos();
  lightboxIndex = (lightboxIndex + 1) % list.length;
  openLightbox(list[lightboxIndex].id);
});

document.getElementById('lb-like').addEventListener('click', () => { if (currentLbId) toggleLike(currentLbId); });
document.getElementById('lb-bookmark').addEventListener('click', () => { if (currentLbId) toggleBookmark(currentLbId); });

document.addEventListener('keydown', e => {
  if (!lightboxOpen) return;
  if (e.key === 'Escape') closeLightbox();
  if (e.key === 'ArrowLeft')  document.getElementById('lb-prev').click();
  if (e.key === 'ArrowRight') document.getElementById('lb-next').click();
});

// ===== 导航过滤 =====
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    currentFilter = link.dataset.filter;
    renderGallery();
  });
});

// ===== 上传功能 =====
const fab         = document.getElementById('fab-upload');
const uploadModal = document.getElementById('upload-modal');
const fileInput   = document.getElementById('file-input');
const preview     = document.getElementById('upload-preview');
let selectedFiles = [];

fab.addEventListener('click', () => { uploadModal.style.display = 'flex'; });
document.getElementById('upload-cancel').addEventListener('click', closeModal);

function closeModal() {
  uploadModal.style.display = 'none';
  fileInput.value = '';
  preview.innerHTML = '';
  document.getElementById('photo-title').value = '';
  document.getElementById('photo-desc').value  = '';
  selectedFiles = [];
}

fileInput.addEventListener('change', () => {
  selectedFiles = Array.from(fileInput.files);
  preview.innerHTML = '';
  selectedFiles.forEach(f => {
    const img = document.createElement('img');
    img.src = URL.createObjectURL(f);
    preview.appendChild(img);
  });
});

document.getElementById('upload-submit').addEventListener('click', () => {
  if (!selectedFiles.length) { alert('请先选择图片'); return; }
  const title = document.getElementById('photo-title').value || '无标题';
  const desc  = document.getElementById('photo-desc').value  || '';
  const cat   = document.getElementById('photo-cat').value;

  selectedFiles.forEach(f => {
    const id  = Date.now() + Math.random();
    const src = URL.createObjectURL(f);
    photos.unshift({ id, title, desc, category: cat, src, likes: 0 });
  });

  closeModal();
  renderGallery();
});

// ===== 初始化 =====
renderGallery();
