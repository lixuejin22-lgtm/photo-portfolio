/* ============================================================
   LENS — app.js  (v2: comments, video, download, particles)
   ============================================================ */

// ─── Storage ───────────────────────────────────────────────
const SK = 'lens_v2';
function load()     { try { return JSON.parse(localStorage.getItem(SK)) || {}; } catch { return {}; } }
function save(d)    { localStorage.setItem(SK, JSON.stringify(d)); }

// ─── Demo Data ─────────────────────────────────────────────
const DEMO = [
  { id:1,  type:'photo', title:'晨雾山谷',    desc:'清晨第一缕阳光穿透云层',    cat:'landscape', downloadable:true,  likes:42, src:'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200' },
  { id:2,  type:'photo', title:'街角故事',    desc:'上海南京路的傍晚霓虹',      cat:'street',    downloadable:true,  likes:28, src:'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=1200' },
  { id:3,  type:'photo', title:'光影之间',    desc:'自然光人像，真实情绪',      cat:'portrait',  downloadable:false, likes:67, src:'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=1200' },
  { id:4,  type:'photo', title:'星空旷野',    desc:'内蒙古戈壁银河长曝光',      cat:'landscape', downloadable:true,  likes:95, src:'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=1200' },
  { id:5,  type:'photo', title:'雨中城市',    desc:'霓虹倒映在湿润的路面',      cat:'street',    downloadable:true,  likes:33, src:'https://images.unsplash.com/photo-1428908728789-d2de25dbd4e2?w=1200' },
  { id:6,  type:'photo', title:'素颜',        desc:'简单背景下的真实力量',      cat:'portrait',  downloadable:false, likes:51, src:'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1200' },
  { id:7,  type:'photo', title:'云海之上',    desc:'黄山日出前的片刻宁静',      cat:'landscape', downloadable:true,  likes:82, src:'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200' },
  { id:8,  type:'photo', title:'市集人群',    desc:'成都宽窄巷子的烟火气',      cat:'street',    downloadable:true,  likes:19, src:'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200' },
  { id:9,  type:'photo', title:'湖光山色',    desc:'西湖清晨薄雾',              cat:'landscape', downloadable:true,  likes:76, src:'https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=1200' },
  { id:10, type:'photo', title:'城市剪影',    desc:'深圳 CBD 日落',             cat:'street',    downloadable:true,  likes:44, src:'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1200' },
];

// ─── State ─────────────────────────────────────────────────
let media     = [...DEMO];
let userData  = load();
let filter    = 'all';
let lbId      = null;
let lbList    = [];
let lbIdx     = 0;

// helpers
const getLiked      = id => !!userData[`like_${id}`];
const getBookmarked = id => !!userData[`bm_${id}`];
const getComments   = id => userData[`cmt_${id}`] || [];
const getLikeCount  = id => {
  const base = media.find(m => m.id === id)?.likes || 0;
  return base + (getLiked(id) ? 1 : 0);
};
const catMap = { landscape:'风光', portrait:'人像', street:'街拍', video:'影像', other:'其他' };
const fmtTime = ts => {
  const d = new Date(ts), now = new Date();
  const diff = (now - d) / 1000;
  if (diff < 60)   return '刚刚';
  if (diff < 3600) return Math.floor(diff/60) + '分钟前';
  if (diff < 86400)return Math.floor(diff/3600) + '小时前';
  return Math.floor(diff/86400) + '天前';
};

// ─── Particles ─────────────────────────────────────────────
(function initParticles() {
  const c = document.getElementById('particles');
  if (!c) return;
  const ctx = c.getContext('2d');
  let W, H, pts = [];

  function resize() {
    W = c.width  = window.innerWidth;
    H = c.height = window.innerHeight;
  }
  resize(); window.addEventListener('resize', resize);

  for (let i = 0; i < 80; i++) pts.push({
    x: Math.random()*1920, y: Math.random()*1080,
    r: Math.random()*.8 + .2,
    dx: (Math.random()-.5)*.15,
    dy: (Math.random()-.5)*.15,
    a: Math.random()
  });

  function draw() {
    ctx.clearRect(0,0,W,H);
    pts.forEach(p => {
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(201,168,76,${p.a * .4})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ─── Header scroll ─────────────────────────────────────────
window.addEventListener('scroll', () => {
  document.getElementById('header').classList.toggle('scrolled', window.scrollY > 10);
});

// ─── Render Gallery ────────────────────────────────────────
const gallery    = document.getElementById('gallery');
const emptyState = document.getElementById('empty-state');

function filtered() {
  if (filter === 'bookmarks') return media.filter(m => getBookmarked(m.id));
  if (filter === 'video')     return media.filter(m => m.type === 'video');
  if (filter === 'all')       return media;
  if (filter === 'photo')     return media.filter(m => m.type === 'photo');
  return media.filter(m => m.cat === filter);
}

function renderGallery() {
  const list = filtered();
  gallery.innerHTML = '';
  emptyState.style.display = list.length ? 'none' : 'block';

  list.forEach((item, i) => {
    const liked = getLiked(item.id), bm = getBookmarked(item.id);
    const lc = getLikeCount(item.id);
    const card = document.createElement('div');
    card.className = 'photo-card'; card.dataset.id = item.id;
    card.style.animationDelay = `${i*0.04}s`;

    const mediaTpl = item.type === 'video'
      ? `<video src="${item.src}" muted loop preload="metadata" style="width:100%;display:block;max-height:300px;object-fit:cover"></video>
         <div class="card-video-badge"><i class="fa-solid fa-play"></i> 影像</div>`
      : `<img src="${item.src}" alt="${item.title}" loading="lazy"/>`;

    card.innerHTML = `
      <div class="card-media">
        ${mediaTpl}
        <span class="card-cat-tag">${catMap[item.cat] || item.cat}</span>
      </div>
      <div class="card-overlay">
        <div class="card-title">${item.title}</div>
        <div class="card-desc">${item.desc}</div>
        <div class="card-btns">
          <button class="cbtn like-btn ${liked?'liked':''}" data-id="${item.id}">
            <i class="fa-${liked?'solid':'regular'} fa-heart"></i> ${lc}
          </button>
          <button class="cbtn bm-btn ${bm?'bookmarked':''}" data-id="${item.id}">
            <i class="fa-${bm?'solid':'regular'} fa-bookmark"></i> ${bm?'已收藏':'收藏'}
          </button>
          ${item.downloadable ? `<button class="cbtn dl-btn" data-id="${item.id}"><i class="fa-solid fa-download"></i></button>` : ''}
        </div>
      </div>`;

    card.addEventListener('click', e => {
      if (e.target.closest('.cbtn')) return;
      openLightbox(item.id);
    });
    gallery.appendChild(card);
  });

  bindCardBtns();
  updateStats();
}

function bindCardBtns() {
  document.querySelectorAll('.like-btn').forEach(b =>
    b.addEventListener('click', e => { e.stopPropagation(); toggleLike(+b.dataset.id); }));
  document.querySelectorAll('.bm-btn').forEach(b =>
    b.addEventListener('click', e => { e.stopPropagation(); toggleBookmark(+b.dataset.id); }));
  document.querySelectorAll('.dl-btn').forEach(b =>
    b.addEventListener('click', e => { e.stopPropagation(); downloadMedia(+b.dataset.id); }));
}

// ─── Like / Bookmark ───────────────────────────────────────
function toggleLike(id) {
  userData[`like_${id}`] = !getLiked(id);
  save(userData);
  renderGallery();
  if (lbId === id) refreshLbSidebar(id);
  toast(getLiked(id) ? '❤️ 已点赞' : '取消点赞');
}
function toggleBookmark(id) {
  userData[`bm_${id}`] = !getBookmarked(id);
  save(userData);
  renderGallery();
  if (lbId === id) refreshLbSidebar(id);
  toast(getBookmarked(id) ? '🔖 已收藏' : '取消收藏');
}

// ─── Download ──────────────────────────────────────────────
function downloadMedia(id) {
  const item = media.find(m => m.id === id);
  if (!item) return;
  if (!item.downloadable) { toast('⚠️ 作者不允许下载此作品'); return; }
  const a = document.createElement('a');
  a.href = item.src; a.download = item.title || 'download';
  a.target = '_blank'; a.click();
  toast('⬇️ 开始下载…');
}

// ─── Stats ─────────────────────────────────────────────────
function updateStats() {
  const totalLikes = media.reduce((s,m) => s + (getLiked(m.id)?1:0), 0);
  const totalBm    = media.filter(m => getBookmarked(m.id)).length;
  document.getElementById('total-likes').textContent      = totalLikes;
  document.getElementById('total-bookmarks').textContent  = totalBm;
  document.getElementById('stat-works').textContent       = media.length;
  document.getElementById('stat-likes-hero').textContent  = media.reduce((s,m) => s+getLikeCount(m.id), 0);
}

// ─── Lightbox ──────────────────────────────────────────────
const lightbox = document.getElementById('lightbox');
const lbOverlay = document.getElementById('lb-overlay');

function openLightbox(id) {
  lbList = filtered();
  lbIdx  = lbList.findIndex(m => m.id === id);
  lbId   = id;
  loadLb(id);
  lightbox.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  lightbox.classList.remove('active');
  document.body.style.overflow = '';
  const v = document.getElementById('lb-video');
  v.pause(); v.src = '';
  lbId = null;
}

function loadLb(id) {
  const item = media.find(m => m.id === id);
  if (!item) return;
  lbId = id;

  const img = document.getElementById('lb-img');
  const vid = document.getElementById('lb-video');
  if (item.type === 'video') {
    img.style.display = 'none'; vid.style.display = 'block';
    vid.src = item.src; vid.play().catch(()=>{});
  } else {
    vid.pause(); vid.style.display = 'none';
    img.style.display = 'block'; img.src = item.src;
  }

  document.getElementById('lb-cat').textContent   = catMap[item.cat] || item.cat;
  document.getElementById('lb-title').textContent  = item.title;
  document.getElementById('lb-desc').textContent   = item.desc;
  document.getElementById('lb-meta').innerHTML     =
    `<i class="fa-regular fa-eye"></i> ${(item.likes*7+111).toLocaleString()} 浏览
     &nbsp;·&nbsp; <i class="fa-solid fa-camera"></i> Sony A7M4`;

  refreshLbSidebar(id);
  renderComments(id);
}

function refreshLbSidebar(id) {
  const liked = getLiked(id), bm = getBookmarked(id);
  const lBtn = document.getElementById('lb-like');
  const bBtn = document.getElementById('lb-bookmark');
  const dBtn = document.getElementById('lb-download');
  const item = media.find(m => m.id === id);

  lBtn.className = `lb-action-btn ${liked?'liked':''}`;
  lBtn.innerHTML = `<i class="fa-${liked?'solid':'regular'} fa-heart"></i><span>${getLikeCount(id)}</span>`;

  bBtn.className = `lb-action-btn ${bm?'bookmarked':''}`;
  bBtn.innerHTML = `<i class="fa-${bm?'solid':'regular'} fa-bookmark"></i><span>${bm?'已收藏':'收藏'}</span>`;

  if (item && !item.downloadable) {
    dBtn.style.opacity = '.4'; dBtn.title = '作者不允许下载';
  } else {
    dBtn.style.opacity = '1'; dBtn.title = '下载';
  }
}

// Nav
document.getElementById('lb-prev').addEventListener('click', () => {
  lbIdx = (lbIdx - 1 + lbList.length) % lbList.length;
  loadLb(lbList[lbIdx].id);
});
document.getElementById('lb-next').addEventListener('click', () => {
  lbIdx = (lbIdx + 1) % lbList.length;
  loadLb(lbList[lbIdx].id);
});
document.getElementById('lb-close').addEventListener('click', closeLightbox);
lbOverlay.addEventListener('click', closeLightbox);

document.getElementById('lb-like').addEventListener('click',     () => lbId && toggleLike(lbId));
document.getElementById('lb-bookmark').addEventListener('click', () => lbId && toggleBookmark(lbId));
document.getElementById('lb-download').addEventListener('click', () => lbId && downloadMedia(lbId));
document.getElementById('lb-share').addEventListener('click',    () => {
  navigator.clipboard?.writeText(window.location.href).then(() => toast('🔗 链接已复制'));
});

document.addEventListener('keydown', e => {
  if (!lightbox.classList.contains('active')) return;
  if (e.key === 'Escape')      closeLightbox();
  if (e.key === 'ArrowLeft')   document.getElementById('lb-prev').click();
  if (e.key === 'ArrowRight')  document.getElementById('lb-next').click();
});

// ─── Comments ──────────────────────────────────────────────
function renderComments(id) {
  const list = getComments(id);
  const el   = document.getElementById('comment-list');
  document.getElementById('comment-count').textContent = list.length;

  if (!list.length) {
    el.innerHTML = '<p style="color:var(--text-dim);font-size:.8rem;text-align:center;padding:20px 0">还没有评论，来说第一句吧 👋</p>';
    return;
  }
  el.innerHTML = list.map((c,i) => `
    <div class="comment-item" data-ci="${i}">
      <div class="ci-avatar">${c.name.charAt(0).toUpperCase()}</div>
      <div class="ci-body">
        <div class="ci-header">
          <span class="ci-name-tag">${escHtml(c.name)}</span>
          <span class="ci-time">${fmtTime(c.ts)}</span>
        </div>
        <div class="ci-content">${escHtml(c.text)}</div>
        <button class="ci-like-btn ${c.liked?'liked':''}" data-ci="${i}">
          <i class="fa-${c.liked?'solid':'regular'} fa-heart"></i> ${c.likeCount||0}
        </button>
      </div>
    </div>`).join('');

  el.querySelectorAll('.ci-like-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const ci = +btn.dataset.ci;
      const cmts = getComments(id);
      cmts[ci].liked = !cmts[ci].liked;
      cmts[ci].likeCount = (cmts[ci].likeCount||0) + (cmts[ci].liked ? 1 : -1);
      userData[`cmt_${id}`] = cmts; save(userData);
      renderComments(id);
    });
  });
}

document.getElementById('ci-submit').addEventListener('click', () => {
  if (!lbId) return;
  const name = document.getElementById('comment-name').value.trim();
  const text = document.getElementById('comment-text').value.trim();
  if (!name) { toast('请输入你的名字'); return; }
  if (!text) { toast('请输入评论内容'); return; }

  const cmts = getComments(lbId);
  cmts.push({ name, text, ts: Date.now(), liked: false, likeCount: 0 });
  userData[`cmt_${lbId}`] = cmts; save(userData);
  document.getElementById('comment-text').value = '';
  renderComments(lbId);
  toast('💬 评论成功！');
});

// ─── Filter ────────────────────────────────────────────────
function setFilter(f) {
  filter = f;
  document.querySelectorAll('.ftab, .nav-link').forEach(el => {
    el.classList.toggle('active', el.dataset.filter === f);
  });
  renderGallery();
}
document.querySelectorAll('.ftab').forEach(b =>
  b.addEventListener('click', () => setFilter(b.dataset.filter)));
document.querySelectorAll('.nav-link').forEach(a =>
  a.addEventListener('click', e => { e.preventDefault(); setFilter(a.dataset.filter); }));

// View toggle
const vMasonry = document.getElementById('view-masonry');
const vGrid    = document.getElementById('view-grid');
vMasonry.addEventListener('click', () => {
  gallery.className = 'gallery masonry';
  vMasonry.classList.add('active'); vGrid.classList.remove('active');
});
vGrid.addEventListener('click', () => {
  gallery.className = 'gallery grid';
  vGrid.classList.add('active'); vMasonry.classList.remove('active');
});

// ─── Upload ────────────────────────────────────────────────
const uploadModal = document.getElementById('upload-modal');
const fileInput   = document.getElementById('file-input');
const dropZone    = document.getElementById('drop-zone');
const previewsEl  = document.getElementById('upload-previews');
let selectedFiles = [];

function openUpload()  { uploadModal.style.display = 'flex'; }
function closeUpload() {
  uploadModal.style.display = 'none';
  fileInput.value = ''; previewsEl.innerHTML = '';
  document.getElementById('up-title').value = '';
  document.getElementById('up-desc').value  = '';
  document.getElementById('dz-inner').style.display = 'flex';
  selectedFiles = [];
}

document.getElementById('fab').addEventListener('click', openUpload);
document.getElementById('btn-upload-top').addEventListener('click', openUpload);
document.getElementById('upload-close').addEventListener('click', closeUpload);
document.getElementById('u-cancel').addEventListener('click', closeUpload);

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault(); dropZone.classList.remove('drag-over');
  handleFiles(Array.from(e.dataTransfer.files));
});

fileInput.addEventListener('change', () => handleFiles(Array.from(fileInput.files)));

function handleFiles(files) {
  selectedFiles = files;
  previewsEl.innerHTML = '';
  document.getElementById('dz-inner').style.display = 'none';
  files.forEach(f => {
    const isVid = f.type.startsWith('video/');
    const url = URL.createObjectURL(f);
    const el = document.createElement(isVid ? 'video' : 'img');
    el.src = url;
    if (isVid) { el.muted = true; el.style.cssText = 'width:70px;height:70px;object-fit:cover;border-radius:8px;border:2px solid var(--accent)'; }
    previewsEl.appendChild(el);
  });
}

document.getElementById('u-submit').addEventListener('click', () => {
  if (!selectedFiles.length) { toast('⚠️ 请先选择文件'); return; }
  const title = document.getElementById('up-title').value.trim();
  if (!title) { toast('⚠️ 请填写作品标题'); return; }
  const desc  = document.getElementById('up-desc').value.trim();
  const cat   = document.getElementById('up-cat').value;
  const dl    = document.getElementById('up-downloadable').checked;

  selectedFiles.forEach(f => {
    const isVid = f.type.startsWith('video/');
    media.unshift({
      id: Date.now() + Math.random(),
      type: isVid ? 'video' : 'photo',
      title, desc, cat,
      downloadable: dl,
      likes: 0,
      src: URL.createObjectURL(f)
    });
  });

  closeUpload(); renderGallery();
  toast('🎉 作品发布成功！');
});

// ─── Toast ─────────────────────────────────────────────────
function toast(msg, dur = 2200) {
  const el = document.getElementById('toast');
  el.textContent = msg; el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), dur);
}

// ─── Utils ─────────────────────────────────────────────────
function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ─── Smooth scroll ─────────────────────────────────────────
document.querySelector('.btn-explore')?.addEventListener('click', e => {
  e.preventDefault();
  document.getElementById('gallery-section').scrollIntoView({ behavior:'smooth' });
});

// ─── Init ──────────────────────────────────────────────────
renderGallery();
