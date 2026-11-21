// 站点运行时间
(function () {
function updateRunningTime() {
    const startDate = new Date(document.getElementById('site-running-time').dataset.startDate);
    const now = new Date();
    let diffMs = now - startDate; // 毫秒差

    const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    diffMs %= (1000 * 60 * 60 * 24);
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    diffMs %= (1000 * 60 * 60);
    const minutes = Math.floor(diffMs / (1000 * 60));
    diffMs %= (1000 * 60);
    const seconds = Math.floor(diffMs / 1000);

    document.getElementById("site-running-time").textContent =
      `站点运行时间：${days} 天 ${hours} 时 ${minutes} 分 ${seconds} 秒`;
  }

  // 初始加载时更新并设置前台定时器（切到后台标签页时暂停以节省能耗）
  updateRunningTime();
  let runningTimer = setInterval(updateRunningTime, 1000);
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      clearInterval(runningTimer);
    } else {
      updateRunningTime();
      runningTimer = setInterval(updateRunningTime, 1000);
    }
  });

})();

// 主题切换
(function () {
  // 主题切换（View Transitions API + circle-blur-top-left）
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    let switching = false;

    function updateGiscusTheme(theme) {
      const iframe = document.querySelector('iframe.giscus-frame');
      if (!iframe) return;
      const giscusTheme = theme === 'dark' ? 'transparent_dark' : 'light';
      iframe.contentWindow.postMessage(
        { giscus: { setConfig: { theme: giscusTheme } } },
        'https://giscus.app'
      );
    }

    function setTheme(theme) {
      document.documentElement.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
      updateGiscusTheme(theme);
    }

    function initTheme() {
      const currentTheme = document.documentElement.getAttribute('data-theme') || localStorage.getItem('theme') || 'light';
      setTheme(currentTheme);
    }

    themeToggle.addEventListener('click', (e) => {
      e.preventDefault();
      if (switching) return;
      switching = true;

      const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      const root = document.documentElement;

      if (!document.startViewTransition) {
        setTheme(newTheme);
        switching = false;
        return;
      }

      const transition = document.startViewTransition(() => {
        root.classList.toggle('dark', newTheme === 'dark');
        setTheme(newTheme);
      });
      transition.finished.then(() => { switching = false; });
    });

    initTheme();
  }


})();

// 代码复制
// 复制代码按钮
  (function () {
    var lineNumberRegex = /^\s*\d+\s*/;
    var preList = document.querySelectorAll('.markdown-body pre');
    preList.forEach(function (pre) {
      var btn = document.createElement('button');
      btn.className = 'copy-btn';
      btn.textContent = 'Copy';
      btn.addEventListener('click', function () {
        var codeBlock = pre.querySelector('code');
        var text = codeBlock ? codeBlock.textContent : pre.textContent;
        var cleaned = text.split('\n').map(function (line) {
          return line.replace(lineNumberRegex, '');
        }).join('\n');
        navigator.clipboard.writeText(cleaned).then(function () {
          btn.textContent = 'Copied!';
          setTimeout(function () { btn.textContent = 'Copy'; }, 2000);
        });
      });
      pre.appendChild(btn);
    });
  })();

// 文章搜索
(function() {
  let searchIndex = null;
  let isLoading = false;

  const modal = document.getElementById('search-modal');
  const input = document.getElementById('search-input');
  const closeBtn = document.getElementById('search-close');
  const resultsContainer = document.getElementById('search-results');
  const searchToggle = document.getElementById('search-toggle');

  if (!modal || !input) return;

  function loadIndex(callback) {
    if (searchIndex) {
      if (callback) callback();
      return;
    }
    if (isLoading) return;
    isLoading = true;
    fetch(modal.dataset.indexUrl)
      .then(res => res.json())
      .then(data => {
        searchIndex = data;
        isLoading = false;
        if (callback) callback();
      })
      .catch(err => {
        isLoading = false;
        resultsContainer.innerHTML = '<div class="search-hint">加载索引失败，请稍后重试</div>';
        console.error('Search index load error:', err);
      });
  }

  function openSearch() {
    if (typeof modal.showModal === 'function') {
      if (!modal.open) modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }
    loadIndex(function() {
      input.focus();
      if (input.value.trim()) {
        executeSearch(input.value.trim());
      } else {
        resultsContainer.innerHTML = '';
      }
    });
    setTimeout(() => input.focus(), 50);
  }

  function closeSearch() {
    if (typeof modal.close === 'function') {
      if (modal.open) modal.close();
    } else {
      modal.removeAttribute('open');
    }
    input.value = '';
    resultsContainer.innerHTML = '';
  }

  function toggleSearch() {
    if (modal.open) {
      closeSearch();
    } else {
      openSearch();
    }
  }

  if (searchToggle) {
    searchToggle.addEventListener('click', function(e) {
      e.preventDefault();
      toggleSearch();
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', closeSearch);

  // Click on dialog backdrop to close (light-dismiss)
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeSearch();
    }
  });

  // Native cancel/close cleanup
  modal.addEventListener('close', function() {
    input.value = '';
    resultsContainer.innerHTML = '';
  });

  // Close search modal when clicking any search result link
  if (resultsContainer) {
    resultsContainer.addEventListener('click', function(e) {
      const link = e.target.closest('.search-result-link');
      if (link) {
        closeSearch();
      }
    });
  }

  function escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function highlightMatches(text, keywords) {
    let escaped = escapeHtml(text);
    if (!keywords || keywords.length === 0) return escaped;
    keywords.forEach(kw => {
      if (!kw) return;
      const regex = new RegExp('(' + kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      escaped = escaped.replace(regex, '<mark class="search-highlight">$1</mark>');
    });
    return escaped;
  }

  function executeSearch(query) {
    if (!searchIndex) return;
    const keywords = query.toLowerCase().split(/\s+/).filter(k => k.length > 0);
    if (keywords.length === 0) {
      resultsContainer.innerHTML = '';
      return;
    }

    const matched = [];
    searchIndex.forEach(item => {
      const title = (item.title || '').toLowerCase();
      const category = (item.category || '').toLowerCase();
      const summary = (item.summary || '').toLowerCase();

      let score = 0;
      let allMatch = true;

      keywords.forEach(kw => {
        let kwMatched = false;
        if (title.includes(kw)) {
          score += 15;
          kwMatched = true;
        }
        if (category.includes(kw)) {
          score += 8;
          kwMatched = true;
        }
        if (summary.includes(kw)) {
          score += 2;
          kwMatched = true;
        }
        if (!kwMatched) allMatch = false;
      });

      if (allMatch && score > 0) {
        matched.push({ item, score });
      }
    });

    matched.sort((a, b) => b.score - a.score);

    if (matched.length === 0) {
      resultsContainer.innerHTML = '<div class="search-hint">未找到与 “' + escapeHtml(query) + '” 相关的文章</div>';
      return;
    }

    const maxResults = 10;
    const limited = matched.slice(0, maxResults);
    let html = '<ul class="search-results-list" id="search-results-list">';
    limited.forEach((res, index) => {
      const item = res.item;
      const highlightedTitle = highlightMatches(item.title, keywords);
      const highlightedSummary = highlightMatches(item.summary, keywords);
      const categoryBadge = item.category ? '<span class="search-result-category">#' + escapeHtml(item.category) + '</span>' : '';
      html += '<li class="search-result-item">';
      html += '  <a href="' + item.permalink + '" class="search-result-link">';
      html += '    <div class="search-result-title">' + highlightedTitle + '</div>';
      html += '    <div class="search-result-meta">';
      html += '      <span class="search-result-date">' + item.date + '</span>';
      if (categoryBadge) html += ' · ' + categoryBadge;
      html += '    </div>';
      if (item.summary) {
        html += '    <div class="search-result-snippet">' + highlightedSummary + '</div>';
      }
      html += '  </a>';
      html += '</li>';
    });
    html += '</ul>';
    resultsContainer.innerHTML = html;
  }

  input.addEventListener('input', function() {
    executeSearch(input.value.trim());
  });
})();

// 外链确认
// External link confirmation modal
(function() {
  var siteDomain = 'turingzy.cn';

  function isExternalLink(link) {
    var rawHref = link.getAttribute('href') || '';
    // Skip anchors, javascript: links, empty hrefs
    if (!rawHref || rawHref.charAt(0) === '#' || rawHref.indexOf('javascript:') === 0) return false;
    var hostname = link.hostname;
    if (!hostname) return false;
    // Allow current hostname (localhost, preview domain, etc.)
    if (hostname === window.location.hostname) return false;
    // Allow same-site links (blog.turingzy.cn, turingzy.cn, etc.)
    if (hostname === siteDomain || hostname.slice(-('.' + siteDomain).length) === '.' + siteDomain) return false;
    return true;
  }

  function showConfirm(url) {
    var modal = document.getElementById('ext-link-modal');
    var urlEl = document.getElementById('ext-link-modal-url');
    if (!modal || !urlEl) return;
    urlEl.textContent = url;
    modal._targetUrl = url;
    if (typeof modal.showModal === 'function') {
      if (!modal.open) modal.showModal();
    } else {
      modal.setAttribute('open', '');
    }
  }

  function hideConfirm() {
    var modal = document.getElementById('ext-link-modal');
    if (modal) {
      if (typeof modal.close === 'function') {
        if (modal.open) modal.close();
      } else {
        modal.removeAttribute('open');
      }
      modal._targetUrl = '';
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    // Create modal DOM using native <dialog>
    var modal = document.createElement('dialog');
    modal.id = 'ext-link-modal';
    modal.className = 'ext-link-modal';
    modal.setAttribute('aria-label', '即将离开本站');
    modal.innerHTML =
      '<form method="dialog" class="ext-link-modal-box">' +
        '<h3 class="ext-link-modal-title">即将离开本站</h3>' +
        '<div class="ext-link-modal-url" id="ext-link-modal-url"></div>' +
        '<div class="ext-link-modal-actions">' +
          '<button type="button" class="ext-link-modal-btn" id="ext-link-cancel">取消</button>' +
          '<button type="button" class="ext-link-modal-btn primary" id="ext-link-confirm">继续访问</button>' +
        '</div>' +
      '</form>';
    document.body.appendChild(modal);

    // Button events
    document.getElementById('ext-link-cancel').addEventListener('click', hideConfirm);
    document.getElementById('ext-link-confirm').addEventListener('click', function() {
      var url = modal._targetUrl;
      hideConfirm();
      if (url) window.open(url, '_blank', 'noopener');
    });

    // Click backdrop to close (light-dismiss)
    modal.addEventListener('click', function(e) {
      if (e.target === modal) hideConfirm();
    });

    modal.addEventListener('close', function() {
      modal._targetUrl = '';
    });

    // Intercept external link clicks
    document.addEventListener('click', function(e) {
      var link = e.target.closest('a');
      if (!link || !link.href) return;
      if (isExternalLink(link)) {
        e.preventDefault();
        showConfirm(link.href);
      }
    });
  });
})();

// 图片灯箱
// ============================================================
// 统一图片沉浸式灯箱（Unified Lightbox System）
// 1. 普通正文图片：同文内图片自动编组翻页，显示 alt，单图隐藏翻页键
// 2. 摄影专页照片：展示拍摄标题、时间与地点元数据
// 3. 游戏卡片及链接内图片：closest('a') 拦截放行，保持正常链接与外链弹窗
// ============================================================
(function() {
  var modal, imgEl, titleEl, metaEl, counterEl;
  var items = [], currentIndex = 0, isOpen = false, token = 0;
  var zoom = 1, zoomFrame = 0;

  function initModal() {
    if (modal) return;
    modal = document.createElement('div');
    modal.className = 'pv-modal';
    modal.innerHTML =
      '<div class="pv-backdrop"></div>' +
      '<div class="pv-topbar">' +
        '<div class="pv-counter"></div>' +
        '<button class="pv-btn pv-close" title="关闭 (Esc)"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg></button>' +
      '</div>' +
      '<div class="pv-stage">' +
        '<button class="pv-nav pv-prev" title="上一张 (←)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 18 9 12 15 6"/></svg></button>' +
        '<div class="pv-frame"><img class="pv-img" src="" alt="" /></div>' +
        '<button class="pv-nav pv-next" title="下一张 (→)"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg></button>' +
      '</div>' +
      '<div class="pv-bottombar"><div class="pv-title"></div><div class="pv-meta"></div></div>';
    document.body.appendChild(modal);

    imgEl = modal.querySelector('.pv-img');
    titleEl = modal.querySelector('.pv-title');
    metaEl = modal.querySelector('.pv-meta');
    counterEl = modal.querySelector('.pv-counter');

    modal.querySelector('.pv-frame').addEventListener('wheel', function(e) {
      if (!isOpen || !e.deltaY) return;
      e.preventDefault();
      var delta = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? window.innerHeight : 1);
      zoom = Math.min(4, Math.max(0.5, zoom * Math.exp(-delta * 0.002)));
      imgEl.classList.add('pv-zooming');
      if (!zoomFrame) zoomFrame = requestAnimationFrame(function() {
        imgEl.style.setProperty('--pv-zoom', zoom);
        zoomFrame = 0;
      });
    }, { passive: false });

    modal.querySelector('.pv-close').onclick = closeLightbox;
    modal.querySelector('.pv-prev').onclick = function(e) { e.stopPropagation(); step(-1); };
    modal.querySelector('.pv-next').onclick = function(e) { e.stopPropagation(); step(1); };
    modal.querySelector('.pv-backdrop').onclick = closeLightbox;
    modal.querySelector('.pv-stage').onclick = function(e) {
      if (e.target === this || e.target.classList.contains('pv-frame')) closeLightbox();
    };

    var touchX = 0, touchY = 0;
    modal.addEventListener('touchstart', function(e) {
      touchX = e.touches[0].clientX;
      touchY = e.touches[0].clientY;
    }, { passive: true });
    modal.addEventListener('touchend', function(e) {
      var dx = e.changedTouches[0].clientX - touchX;
      var dy = e.changedTouches[0].clientY - touchY;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) step(dx > 0 ? -1 : 1);
      else if (dy > 60 && dy > Math.abs(dx)) closeLightbox();
    }, { passive: true });
  }

  function step(delta) {
    if (items.length > 1) renderPhoto(currentIndex + delta, true);
  }

  function renderPhoto(index, animate) {
    cancelAnimationFrame(zoomFrame);
    zoomFrame = 0;
    zoom = 1;
    imgEl.style.removeProperty('--pv-zoom');
    imgEl.classList.remove('pv-zooming');
    currentIndex = (index + items.length) % items.length;
    var item = items[currentIndex];
    counterEl.textContent = (currentIndex + 1) + ' / ' + items.length;
    titleEl.textContent = item.title || '';
    metaEl.textContent = item.meta || '';
    modal.classList.toggle('has-caption', Boolean(item.title || item.meta));
    if (animate) imgEl.classList.add('pv-switching');

    var cur = ++token;
    var temp = new Image();
    function show() {
      if (cur !== token) return;
      imgEl.src = item.src;
      imgEl.alt = item.title || '';
      if (animate) requestAnimationFrame(function() { imgEl.classList.remove('pv-switching'); });
    }
    temp.onload = show;
    temp.src = item.src;
    if (temp.complete && temp.naturalWidth) show();

    if (items.length > 1) {
      new Image().src = items[(currentIndex + 1) % items.length].src;
      new Image().src = items[(currentIndex - 1 + items.length) % items.length].src;
    }
  }

  function openLightbox(newItems, startIndex) {
    if (!newItems || !newItems.length) return;
    initModal();
    items = newItems;
    isOpen = true;
    modal.classList.toggle('is-single', items.length <= 1);
    document.body.style.overflow = 'hidden';
    renderPhoto(startIndex || 0, false);
    requestAnimationFrame(function() { modal.classList.add('active'); });
  }

  function closeLightbox() {
    if (!isOpen || !modal) return;
    cancelAnimationFrame(zoomFrame);
    zoomFrame = 0;
    imgEl.classList.remove('pv-zooming');
    isOpen = false;
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  document.addEventListener('keydown', function(e) {
    if (!isOpen) {
      if ((e.key === 'Enter' || e.key === ' ') && document.activeElement && document.activeElement.classList.contains('photo-figure')) {
        e.preventDefault();
        document.activeElement.click();
      }
      return;
    }
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });

  document.addEventListener('click', function(e) {
    if (e.target.closest('a')) return; // 游戏封面卡片等超链接图片直接放行
    var fig = e.target.closest('.photo-figure');
    var img = e.target.closest('.post-content img');
    if (!fig && !img) return;
    e.preventDefault();

    if (fig) {
      var figures = Array.from(document.querySelectorAll('.photo-figure'));
      openLightbox(figures.map(function(f) {
        var m = f.querySelector('img');
        return {
          src: f.dataset.src || (m && m.src) || '',
          title: f.dataset.title || '',
          meta: [f.dataset.date, f.dataset.remark ? '(' + f.dataset.remark + ')' : ''].filter(Boolean).join('\u00A0\u00A0')
        };
      }), figures.indexOf(fig));
    } else {
      var container = img.closest('.post-content') || document.body;
      var imgs = Array.from(container.querySelectorAll('img')).filter(function(i) {
        return !i.closest('a') && !i.closest('.photo-figure') && i.src;
      });
      openLightbox(imgs.map(function(i) {
        return {
          src: i.dataset.original || i.dataset.src || i.src,
          title: i.alt || i.title || '',
          meta: ''
        };
      }), imgs.indexOf(img));
    }
  });
})();

// 仅在页面已加载 KaTeX 时渲染公式
if (typeof renderMathInElement === 'function') {
  renderMathInElement(document.body, {
      delimiters: [
        {left: '$$', right: '$$', display: true},
        {left: '$', right: '$', display: false},
        {left: '\\(', right: '\\)', display: false},
        {left: '\\[', right: '\\]', display: true}
      ],
      throwOnError: false
    });
}

// 游戏封面
// 封面图 404 时退化为占位图标
    document.querySelectorAll('.game-cover img').forEach(function (img) {
      img.addEventListener('error', function () {
        img.closest('.game-cover').classList.add('no-art');
        img.remove();
      });
    });
