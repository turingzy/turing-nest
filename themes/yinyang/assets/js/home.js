// 首次访问加载动画
(function () {
    var loader = document.getElementById("site-loader");
    if (!loader) return;

    var hasVisited = sessionStorage.getItem("has_seen_intro");
    if (hasVisited) {
      loader.style.display = "none";
      return;
    }
    sessionStorage.setItem("has_seen_intro", "true");

    function dismiss() {
      if (loader._dismissed) return;
      loader._dismissed = true;
      loader.classList.add("fade-out");
      setTimeout(function () {
        loader.style.display = "none";
      }, 400);
    }

    // 优雅跳动约 600ms 后平滑淡出，仪式感充足且绝不拖泥带水
    setTimeout(dismiss, 300);
  })();

// 水墨背景
(function(){
'use strict';
var cv=document.getElementById('ink-plum-canvas'),C=null;
if(!cv)return;
var W=0,H=0,LB=0,dpr=1,seed=0,prog=0,t0=0,scene=null,raf=0,startTimer=0;
var desktop=matchMedia('(min-width:961px)'),motion=matchMedia('(prefers-reduced-motion:reduce)');

function rng(){seed=(seed*9301+49297)%233280;return seed/233280;}
function rr(a,b){return a+rng()*(b-a);}
function ease(t){return 1-Math.pow(1-t,3);}
function easeB(t){return 1+2.35*Math.pow(t-1,3)+1.35*Math.pow(t-1,2);}
function lp(a,b,t){return a+(b-a)*t;}

function split(a,b,c,d,u){
  if(u<=0)return[a,a,a,a];if(u>=1)return[a,b,c,d];
  var ab={x:lp(a.x,b.x,u),y:lp(a.y,b.y,u)},bc={x:lp(b.x,c.x,u),y:lp(b.y,c.y,u)},
      cd={x:lp(c.x,d.x,u),y:lp(c.y,d.y,u)},abc={x:lp(ab.x,bc.x,u),y:lp(ab.y,bc.y,u)},
      bcd={x:lp(bc.x,cd.x,u),y:lp(bc.y,cd.y,u)};
  return[a,ab,abc,{x:lp(abc.x,bcd.x,u),y:lp(abc.y,bcd.y,u)}];
}

function pal(){
  var dk=document.documentElement.getAttribute('data-theme')==='dark';
  return dk?{ink:'#e8edf5',soft:'#9aaabe',bg:'#1a1a1a',stroke:'#dde3f0',accent:'#ca8582',wash:'rgba(185,202,221,.12)'}
           :{ink:'#1c1917',soft:'#44403c',bg:'#fff',stroke:'#292524',accent:'#a54842',wash:'rgba(106,82,71,.09)'};
}

// ── 通用：画贝塞尔枝段 ──
function drawBranch(p0,p1,p2,p3,w0,w1,p,ts,te,col,marks,paper){
  if(p<ts)return;
  var u=p>=te?1:(p-ts)/(te-ts),eu=ease(u),sub=split(p0,p1,p2,p3,eu);
  C.beginPath();C.moveTo(sub[0].x,sub[0].y);
  C.bezierCurveTo(sub[1].x,sub[1].y,sub[2].x,sub[2].y,sub[3].x,sub[3].y);
  C.lineWidth=Math.max(.6,w0+(w1-w0)*eu*.5);C.strokeStyle=col;C.lineCap='round';C.stroke();
  // 固定的细碎飞白随枝条显露；不在动画帧内生成随机纹理。
  C.save();C.globalAlpha*=.48;C.strokeStyle=paper;C.lineWidth=.55;
  for(var m of marks){if(m.u>eu)continue;C.beginPath();C.moveTo(m.x,m.y);C.lineTo(m.x+m.dx,m.y+m.dy);C.stroke();}
  C.restore();
}

// ═══════════════════════════════════════════
// 梅花 · 左下角 ↗ 自底向上苍劲舒展
// ═══════════════════════════════════════════
function buildPlum(mn,mx){
  seed=55667;
  var br=[],fl=[],dots=[],sp=mx-mn;
  var px=mn+sp*.35,py=H+5,pw=Math.min(5.8,Math.max(4.2,sp*.028)),pa=-Math.PI/2+.14;
  var topY=H*.14,segs=8;

  for(var i=0;i<segs;i++){
    var sl=((H-topY)/segs)*rr(.92,1.12),ew=Math.max(1.6,pw*rr(.83,.89));
    var bend=(i%2?1:-1)*rr(.2,.34);pa+=bend;
    if(px>mx-28)pa-=.42;if(px<mn+28)pa+=.42;
    var c1={x:px+Math.cos(pa-bend*.5)*sl*.5,y:py+Math.sin(pa-bend*.5)*sl*.5},
        c2={x:px+Math.cos(pa)*sl*.82,y:py+Math.sin(pa)*sl*.82},
        ep={x:Math.min(mx-8,Math.max(mn+8,px+Math.cos(pa)*sl)),y:py+Math.sin(pa)*sl};
    var t0_=i/segs*.56,t1_=(i+1)/segs*.56;
    br.push({p0:{x:px,y:py},p1:c1,p2:c2,p3:ep,w0:pw,w1:ew,d:0,ts:t0_,te:t1_});
    if(i>=1){for(var d=0;d<3;d++)dots.push({x:c1.x+rr(-3,3),y:c1.y+rr(-4,4),r:rr(.8,1.5),t:t0_+.04});}
    if(i>=1){
      var la=pa+(i%2?1:-1)*rr(.7,1.2),lr=rr(.35,.85),ls=split({x:px,y:py},c1,c2,ep,lr)[3];
      plumTwig(ls.x,ls.y,la,pw*.6,1,t0_+(t1_-t0_)*lr,br,fl,mn,mx);
    }
    px=ep.x;py=ep.y;pw=ew;
  }
  plumTwig(px,py,pa-.3,pw,1,.56,br,fl,mn,mx);
  plumTwig(px,py,pa+.28,pw,1,.60,br,fl,mn,mx);
  for(var b of br){
    b.marks=[];
    if(b.w0<1.3)continue;
    for(var j=0;j<9;j++){
      var u=rr(.06,.94),pt=split(b.p0,b.p1,b.p2,b.p3,u)[3],next=split(b.p0,b.p1,b.p2,b.p3,Math.min(1,u+.025))[3];
      b.marks.push({u:u,x:pt.x+rr(-b.w0*.18,b.w0*.18),y:pt.y,dx:(next.x-pt.x)*.75,dy:(next.y-pt.y)*.75});
    }
  }
  return{br:br,fl:fl,dots:dots};
}

function plumTwig(x,y,a,w,d,ts,br,fl,mn,mx){
  if(d>3||w<.6)return;
  var len=rr(32,65)*Math.pow(.82,d),ew=Math.max(.55,w*rr(.55,.72)),ba=a+rr(-.3,.3),
      te=Math.min(.96,ts+rr(.16,.24));
  var c1={x:x+Math.cos(a)*len*.4,y:y+Math.sin(a)*len*.4},
      c2={x:x+Math.cos(ba)*len*.8,y:y+Math.sin(ba)*len*.8},
      ep={x:Math.min(mx-6,Math.max(mn+6,x+Math.cos(ba)*len)),y:y+Math.sin(ba)*len};
  br.push({p0:{x:x,y:y},p1:c1,p2:c2,p3:ep,w0:w,w1:ew,d:d,ts:ts,te:te});

  var fc=d>=1?Math.floor(rr(1,3)):1;
  for(var i=0;i<fc;i++){
    var fr=rr(.25,.9),fp=split({x:x,y:y},c1,c2,ep,fr)[3];
    if(fp.x<mn+5||fp.x>mx-5)continue;
    var sd=(i%2?1:-1),pa2=ba+sd*(Math.PI/2+rr(-.2,.2)),pl=rr(5,9);
    var fx=fp.x+Math.cos(pa2)*pl,fy=fp.y+Math.sin(pa2)*pl;
    var ft=Math.min(.97,ts+(te-ts)*fr+rr(.04,.12));
    var roll=rng(),tp=roll<.27?'bud':roll<.56?'semi':'full',sz=tp==='bud'?rr(4.5,7):tp==='semi'?rr(8.5,12):rr(11,16);
    fl.push({sx:fp.x,sy:fp.y,x:fx,y:fy,pa:pa2,a:pa2+rr(-.3,.3),r:sz,tp:tp,bt:ft,sd:rng()});
  }
  if(d<3){
    var ns=ts+(te-ts)*.65;
    plumTwig(ep.x,ep.y,ba+rr(.42,.76),ew,d+1,ns,br,fl,mn,mx);
    if(rng()<.65)plumTwig(ep.x,ep.y,ba-rr(.42,.76),ew,d+1,ns+.03,br,fl,mn,mx);
  }
}

function renderPlum(s,p,pl){
  for(var b of s.br){
    C.save();C.globalAlpha=b.d===0?1:b.d===1?.78:.5;
    drawBranch(b.p0,b.p1,b.p2,b.p3,b.w0,b.w1,p,b.ts,b.te,b.d===0?pl.ink:pl.soft,b.marks,pl.bg);
    C.restore();
  }
  for(var d of s.dots) if(p>=d.t){C.fillStyle=pl.ink;C.beginPath();C.arc(d.x,d.y,d.r,0,Math.PI*2);C.fill();}
  for(var f of s.fl){
    if(p<f.bt)continue;var bp=Math.min(1,(p-f.bt)/.12),sc=easeB(bp);if(sc<=0)continue;
    // 花梗
    C.save();C.beginPath();C.moveTo(f.sx,f.sy);
    C.quadraticCurveTo((f.sx+f.x)/2+Math.cos(f.pa+.5)*2,(f.sy+f.y)/2+Math.sin(f.pa+.5)*2,f.x,f.y);
    C.strokeStyle=pl.ink;C.lineWidth=.85;C.stroke();C.restore();
    // 花
    C.save();C.translate(f.x,f.y);C.rotate(f.a);C.scale(sc,sc);
    var r=f.r,accent=f.sd>.72?pl.accent:pl.ink;
    C.globalAlpha=f.tp==='bud'?.85:1;
    if(f.tp==='bud'){
      C.fillStyle=pl.ink;
      for(var b=-1;b<=1;b++){C.save();C.rotate(b*.55);C.beginPath();C.ellipse(0,r*.35,r*.2,r*.37,0,0,Math.PI*2);C.fill();C.restore();}
      C.fillStyle=pl.bg;C.beginPath();C.arc(0,-r*.14,r*.52,0,Math.PI*2);C.fill();C.strokeStyle=pl.stroke;C.lineWidth=.8;C.stroke();
    }else if(f.tp==='semi'){
      C.fillStyle=pl.ink;C.beginPath();C.arc(-r*.28,r*.28,r*.18,0,Math.PI*2);C.arc(r*.28,r*.28,r*.18,0,Math.PI*2);C.fill();
      for(var i=-1;i<=1;i++){C.save();C.rotate(i*.42);petal(0,-r*.4,r*(.46+.07*Math.sin(f.sd*9+i)),r*.7,pl,f.sd);C.restore();}
      for(var i=-2;i<=2;i++){var sa=i*.18,sl=r*.46;C.strokeStyle=pl.ink;C.lineWidth=.72;C.beginPath();C.moveTo(0,0);C.lineTo(Math.sin(sa)*sl,-Math.cos(sa)*sl);C.stroke();C.fillStyle=pl.ink;C.beginPath();C.arc(Math.sin(sa)*sl,-Math.cos(sa)*sl,1.1,0,Math.PI*2);C.fill();}
    }else{
      C.fillStyle=pl.ink;for(var e=0;e<5;e++){var ea=e*Math.PI*2/5+Math.PI/5;C.beginPath();C.arc(Math.cos(ea)*r*.4,Math.sin(ea)*r*.4,r*.15,0,Math.PI*2);C.fill();}
      for(var i=0;i<5;i++){C.save();C.rotate(i*Math.PI*2/5);petal(0,-r*.46,r*(.46+.07*Math.sin(f.sd*9+i)),r*(.61+.06*Math.cos(i+f.sd*7)),pl,f.sd);C.restore();}
      for(var i=0;i<13;i++){var sa=i*Math.PI*2/13+f.sd*3.2,sl=r*(.28+(i%3)*.08);C.strokeStyle=pl.ink;C.lineWidth=.72;C.beginPath();C.moveTo(0,0);C.lineTo(Math.cos(sa)*sl,Math.sin(sa)*sl);C.stroke();C.fillStyle=pl.ink;C.beginPath();C.arc(Math.cos(sa)*sl,Math.sin(sa)*sl,1.1,0,Math.PI*2);C.fill();}
      C.fillStyle=accent;C.beginPath();C.arc(0,0,r*.14,0,Math.PI*2);C.fill();
    }
    C.restore();
  }
}

function renderPoem(pl,p){
  var size=Math.max(16,Math.min(23,LB*.095)),lineH=size*1.35;
  var col1='宝剑锋从磨砺出',col2='梅花香自苦寒来';
  var totalH=(col1.length-1+col2.length)*lineH;
  var topY=Math.max(20,Math.min(H*.23,H-totalH-30));
  var columns=[
    {text:col1,x:LB*.13,y:topY},
    {text:col2,x:LB*.87,y:topY+(col1.length-1)*lineH}
  ];
  C.save();C.fillStyle=pl.ink;C.textAlign='center';C.textBaseline='middle';
  C.font='600 '+size+'px "KaiTi","STKaiti","Kaiti SC",serif';
  var startP=0.05,charInterval=0.06,pauseP=0.08,fade=0.04;
  for(var c=0;c<columns.length;c++){
    var col=columns[c];
    for(var i=0;i<col.text.length;i++){
      var k=(c===0?0:columns[0].text.length)+i;
      var tk=startP+k*charInterval+(c>0?pauseP:0);
      if(p<tk)continue;
      var a=Math.min(1,(p-tk)/fade);
      C.save();
      C.globalAlpha=.9*a;
      C.translate(col.x+(i%2?1:-1)*size*.025,col.y+i*lineH);
      C.rotate((i%3-1)*.025);
      C.fillText(col.text[i],0,0);
      C.restore();
    }
  }
  C.restore();
}

function petal(cx,cy,rx,ry,pl,sd){
  C.save();C.fillStyle=pl.bg;C.beginPath();C.moveTo(cx,cy+ry*.58);
  C.bezierCurveTo(cx-rx*1.1,cy+ry*.22,cx-rx*1.1,cy-ry*.65,cx-rx*.2,cy-ry*.88);
  C.bezierCurveTo(cx-rx*.08,cy-ry*.82,cx+rx*.08,cy-ry*.82,cx+rx*.2,cy-ry*.88);
  C.bezierCurveTo(cx+rx*1.1,cy-ry*.65,cx+rx*1.1,cy+ry*.22,cx,cy+ry*.58);
  C.fill();C.strokeStyle=pl.stroke;C.lineWidth=.82;C.stroke();
  // 薄墨叠染代替模糊滤镜，每瓣只增加一个局部色块。
  C.clip();C.fillStyle=sd>.72?pl.accent:pl.wash;C.globalAlpha*=sd>.72?.12:1;
  C.beginPath();C.ellipse(cx+rx*.18,cy+ry*.4,rx*.86,ry*.58,-.22,0,Math.PI*2);C.fill();C.restore();
}

// ═══════════════════════════════════════════
// 主渲染 & 动画
// ═══════════════════════════════════════════
function measure(){
  var el=document.querySelector('article.posts')||document.querySelector('article');
  if(el){var r=el.getBoundingClientRect();LB=Math.max(0,r.left-20);}
  else{LB=Math.max(0,(W-800)/2-20);}
}

function build(){
  scene={};
  if(LB>=70)scene.plum=buildPlum(15,LB);
}

function draw(p){
  if(!C||!scene)return;C.clearRect(0,0,LB,H);var pl=pal();
  C.save();C.beginPath();
  if(LB>0)C.rect(0,0,LB,H);C.clip();
  if(scene.plum)renderPlum(scene.plum,p,pl);
  renderPoem(pl,p);
  C.restore();
}

// 完整绽放需到 1.09；保留余量让最后一朵花也自然收住。
function step(ts){
  if(!t0)t0=ts;
  prog=Math.min(1.12,(ts-t0)/3200*1.12);draw(prog);
  raf=prog<1.12?requestAnimationFrame(step):0;
}
function stop(){cancelAnimationFrame(raf);raf=0;clearTimeout(startTimer);}
function resize(){
  stop();W=innerWidth;H=innerHeight;measure();
  if(!desktop.matches||LB<70){
    scene=null;cv.width=1;cv.height=1;cv.style.width='0px';return;
  }
  C=C||cv.getContext('2d');if(!C)return;
  dpr=Math.min(devicePixelRatio||1,2);
  cv.width=Math.ceil(LB*dpr);cv.height=Math.ceil(H*dpr);
  cv.style.width=LB+'px';cv.style.height=H+'px';
  C.setTransform(dpr,0,0,dpr,0,0);build();prog=1.12;draw(prog);
}
function start(){
  stop();if(!desktop.matches||!C||!scene)return;
  if(motion.matches||document.hidden){prog=1.12;draw(prog);return;}
  t0=0;prog=0;draw(0);raf=requestAnimationFrame(step);
}
new MutationObserver(function(){draw(prog);}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});
var rt;addEventListener('resize',function(){clearTimeout(rt);rt=setTimeout(resize,120);});
document.addEventListener('visibilitychange',function(){if(document.hidden){stop();prog=1.12;draw(prog);}});
motion.addEventListener('change',function(){if(motion.matches){stop();prog=1.12;draw(prog);}});
window.restartGentlemen=start;
document.addEventListener('DOMContentLoaded',function(){
  resize();if(!scene)return;
  var ld=document.getElementById('site-loader');
  if(motion.matches||document.hidden)return;
  prog=0;draw(0);
  startTimer=setTimeout(start,ld&&getComputedStyle(ld).display!=='none'?650:150);
});
})();

// 文章热力图
(function() {
    var blogPages = JSON.parse(document.getElementById('heatmap-data').textContent);

    // 按日期索引，避免每个格子都 filter 整个列表
    var pagesByDate = {};
    for (var i = 0; i < blogPages.length; i++) {
        var p = blogPages[i];
        if (!pagesByDate[p.date]) pagesByDate[p.date] = [];
        pagesByDate[p.date].push(p);
    }

    var numMonths = window.innerWidth < 768 ? 6 : 12;
    var monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    var today = new Date();

    // 生成月份标签
    var monthDiv = document.getElementById('heatmap-months');
    var startMonthIndex = (today.getMonth() - (numMonths - 1) + 12) % 12;
    for (var m = 0; m < numMonths; m++) {
        var span = document.createElement('span');
        span.textContent = monthNames[(startMonthIndex + m) % 12];
        monthDiv.appendChild(span);
    }

    // 计算起始日期（numMonths 个月前的月初，对齐到周一）
    function getStartDate() {
        var d = new Date(today.getFullYear(), today.getMonth() - numMonths + 1, 1);
        while (d.getDay() !== 1) d.setDate(d.getDate() + 1);
        return d;
    }

    function pad(n) { return n < 10 ? '0' + n : '' + n; }

    function toDateKey(d) {
        return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
    }

    function formatDateDisplay(d) {
        return monthNames[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
    }

    // 按篇数决定颜色等级
    function getLevel(postCount) {
        if (postCount === 0) return 0;
        if (postCount === 1) return 1;
        if (postCount === 2) return 2;
        if (postCount === 3) return 3;
        return 4;
    }

    // 单例 tooltip
    var tooltip = document.getElementById('heatmap-tooltip');

    function showTooltip(ev, dateStr, articles) {
        var html = '<span class="heatmap_tooltip_date">' + dateStr + '</span>';
        if (articles && articles.length > 0) {
            var titles = [];
            for (var i = 0; i < articles.length; i++) {
                titles.push(articles[i].title);
            }
            html += '<span class="heatmap_tooltip_title">' + titles.join(', ') + '</span>';
        }
        tooltip.innerHTML = html;
        tooltip.classList.add('is-visible');
        positionTooltip(ev);
    }

    var supportsAnchor = (window.CSS && CSS.supports && CSS.supports('anchor-name', '--test'));
    function positionTooltip(ev) {
        if (supportsAnchor) {
            tooltip.style.left = '';
            tooltip.style.top = '';
            return;
        }
        var rect = ev.target.getBoundingClientRect();
        var tw = tooltip.offsetWidth;
        var th = tooltip.offsetHeight;
        var left = rect.left + rect.width / 2 - tw / 2;
        var top = rect.top - th - 6;
        // 防止超出左右边界
        if (left < 4) left = 4;
        if (left + tw > window.innerWidth - 4) left = window.innerWidth - 4 - tw;
        // 如果上方放不下，放到下方
        if (top < 4) top = rect.bottom + 6;
        tooltip.style.left = left + 'px';
        tooltip.style.top = top + 'px';
    }

    function hideTooltip() {
        tooltip.classList.remove('is-visible');
    }

    // 构建热力图
    var container = document.getElementById('heatmap');
    var startDate = getStartDate();
    var endDate = new Date();
    var cur = new Date(startDate);
    var dayIndex = 0;
    var week = null;

    while (cur <= endDate) {
        if (dayIndex % 7 === 0) {
            week = document.createElement('div');
            week.className = 'heatmap_week';
            container.appendChild(week);
        }

        var key = toDateKey(cur);
        var articles = pagesByDate[key] || null;
        var postCount = articles ? articles.length : 0;
        var level = getLevel(postCount);

        var day = document.createElement('div');
        day.className = 'heatmap_day heatmap_day_level_' + level;

        // 用闭包保存数据供事件使用
        (function(dateDisplay, arts) {
            day.addEventListener('mouseenter', function(e) { showTooltip(e, dateDisplay, arts); });
            day.addEventListener('mouseleave', hideTooltip);
        })(formatDateDisplay(cur), articles);

        week.appendChild(day);

        dayIndex++;
        cur.setDate(cur.getDate() + 1);
    }
})();
