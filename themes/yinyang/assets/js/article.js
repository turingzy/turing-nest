// 文章目录
document.addEventListener('DOMContentLoaded', function() {
  var toc = document.querySelector('.toc');
  var toggle = document.querySelector('.toc-toggle');
  
  if (toc && toggle) {
    toggle.addEventListener('click', function(e) {
      e.preventDefault();
      toc.classList.toggle('expanded');
    });
  }

  var tocLinks = document.querySelectorAll('.toc a');
  if (tocLinks.length > 0) {
    var items = [];
    tocLinks.forEach(function(link) {
      var id = decodeURIComponent((link.getAttribute('href') || '').slice(1));
      var el = document.getElementById(id);
      if (el) items.push({ link: link, el: el });
    });

    if (items.length > 0) {
      var current = null;
      function updateSpy() {
        var active = items[0];
        for (var i = 0; i < items.length; i++) {
          if (items[i].el.getBoundingClientRect().top <= 100) {
            active = items[i];
          } else {
            break;
          }
        }
        if (active !== current) {
          if (current) current.link.classList.remove('active');
          current = active;
          if (current) current.link.classList.add('active');
        }
      }
      window.addEventListener('scroll', updateSpy, { passive: true });
      updateSpy();
    }
  }
});

// 评论会话恢复
// 当 giscus 服务端 session 过期或报错（如 Unable to fetch token from Valkey）时，自动清除本地失效凭证并重载
  window.addEventListener('message', function (event) {
    if (event.origin === 'https://giscus.app' && event.data && event.data.giscus && event.data.giscus.error) {
      var err = String(event.data.giscus.error);
      if (err.indexOf('Valkey') !== -1 || err.indexOf('token') !== -1) {
        localStorage.removeItem('giscus-session');
        var iframe = document.querySelector('iframe.giscus-frame');
        if (iframe) {
          var url = new URL(iframe.src);
          url.searchParams.delete('session');
          iframe.src = url.toString();
        }
      }
    }
  });
