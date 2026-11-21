// 第三方与小部件服务管理 (Widgets & Third-party Services)

// 1. 打赏面板 (Ko-fi & 微信/支付宝)
(function () {
  const popover = document.getElementById('sponsor-popover');
  const openBtn = document.getElementById('sponsor-btn');
  const closeBtn = document.getElementById('sponsor-close');
  if (!popover || !openBtn || !closeBtn) return;

  const panels = popover.querySelectorAll('.sponsor-tab-panel');
  const qrImg = document.getElementById('sponsor-qr-img');
  const kofiFrame = document.getElementById('kofiframe');

  function loadKofi() {
    if (kofiFrame && !kofiFrame.hasAttribute('src')) {
      kofiFrame.src = kofiFrame.dataset.src;
    }
  }

  if (kofiFrame) {
    kofiFrame.addEventListener('load', function () {
      if (!kofiFrame.hasAttribute('src')) return;
      kofiFrame.parentElement.setAttribute('aria-busy', 'false');
    });
  }

  function setOpen(open) {
    popover.hidden = !open;
    openBtn.setAttribute('aria-expanded', String(open));
    if (open) {
      selectRegion(popover.querySelector('[data-tab="world"]'));
      const worldPanel = document.getElementById('sponsor-panel-world');
      if (worldPanel) worldPanel.scrollTop = 0;
      closeBtn.focus();
    } else if (popover.contains(document.activeElement)) {
      openBtn.focus();
    }
  }

  openBtn.addEventListener('click', function () {
    setOpen(popover.hidden);
  });
  closeBtn.addEventListener('click', function () {
    setOpen(false);
  });
  document.addEventListener('click', function (e) {
    if (!popover.hidden && !popover.contains(e.target) && !openBtn.contains(e.target)) {
      setOpen(false);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && !popover.hidden) setOpen(false);
  });

  function bindChoices(selector, onSelect) {
    const buttons = popover.querySelectorAll(selector);
    function select(button) {
      buttons.forEach(function (item) {
        item.setAttribute('aria-pressed', String(item === button));
      });
      onSelect(button);
    }
    buttons.forEach(function (button) {
      button.addEventListener('click', function () {
        select(button);
      });
    });
    return select;
  }

  const selectRegion = bindChoices('.sponsor-tab', function (button) {
    panels.forEach(function (panel) {
      panel.hidden = panel.id !== 'sponsor-panel-' + button.dataset.tab;
    });
    if (button.dataset.tab === 'world') loadKofi();
  });
  bindChoices('.sponsor-sub-tab', function (button) {
    if (qrImg) {
      qrImg.src = button.dataset.src;
      qrImg.alt = button.dataset.alt;
    }
  });
})();

// 2. Mailbike 反馈组件
(function () {
  function initMailbike() {
    if (document.querySelector('script[data-app="mb_live_431a0d95741e7fc8"]')) return;
    const script = document.createElement('script');
    script.src = 'https://mailbike.dev/widget.js';
    script.setAttribute('data-app', 'mb_live_431a0d95741e7fc8');
    script.defer = true;
    (document.body || document.head || document.documentElement).appendChild(script);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMailbike);
  } else {
    initMailbike();
  }
})();
