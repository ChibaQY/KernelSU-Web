const St = {
  tab: 0, uiMode: 1, tm: 0, kc: 0,
  _tt: null, suIdx: 0, vn: null, vc: null,
  sets: { cu: 1, cmu: 0, sc: 0, ku: 0, sh: 0, sl: 1, ar: 0, du: 0, wd: 0, aj: 0 }
};

const D = (function(){
  const ua = navigator.userAgent;
  const cores = navigator.hardwareConcurrency || '?';
  const mem = navigator.deviceMemory ? navigator.deviceMemory + 'GB' : '?';
  const base = { selinux: 'Enforcing', seccomp: 'Filter', cores, mem, ver: 'v3.2.4 (32457)' };

  const androidVer = ua.match(/Android\s+([\d.]+)/);
  if (androidVer) {
    const av = androidVer[1];
    let model = 'Xiaomi 14 Pro';
    const braceMatch = ua.match(/\(.*?;\s*(.*?)\s*\)/);
    if (braceMatch) {
      const p = braceMatch[1].split(';').map(s => s.trim()).find(x => x && !x.startsWith('Android') && !x.startsWith('Linux'));
      if (p) model = p;
    }
    return { ...base, model, kernel: `5.10.${Math.floor(Math.random()*200)+100}-android${av}`, fp: `${model.replace(/\s/g,'')}:${av}/${cores}/${mem}`, os: 'Android '+av };
  }

  if (/iPhone|iPad/.test(ua)) {
    const iosV = (ua.match(/iPhone OS ([\d_]+)/)?.[1]||'').replace(/_/g,'.');
    const cand = ua.match(/\(.*?;(.*?)\)/)?.[1]?.split(';')||[];
    return { ...base, model: cand.find(x=>/iPhone|iPad/.test(x))||'Apple Device', kernel: `XNU-${Math.floor(Math.random()*10000)+8000}`, fp: `apple/${cores}/${mem}`, os: iosV?'iOS '+iosV:'iOS' };
  }

  if (/Macintosh/.test(ua)) {
    const mv = (ua.match(/Mac OS X ([\d_]+)/)?.[1]||'').replace(/_/g,'.');
    return { ...base, model:'Mac', kernel: mv?'Darwin '+mv:'Darwin', fp: `apple/${cores}/${mem}`, os:'macOS' };
  }

  if (/Windows/.test(ua)) {
    const nt = ua.match(/Windows NT ([\d.]+)/)?.[1]||'';
    return { ...base, model:'PC', kernel:'NT '+nt, fp: `windows/${cores}/${mem}`, os:'Windows '+nt };
  }

  const FAKES = [
    {m:'iPhone 91 Pro Max',o:'iOS 99',k:'XNU-29999'},{m:'Huawei Mate 78',o:'HarmonyOS 99',k:'6.6.99-hos'},
    {m:'OPPO Vivo X',o:'ColorOS 99',k:'5.15.199-color'},{m:'Samsung Galaxy S99',o:'OneUI 99',k:'6.1.99-oneui'},
    {m:'Xiaomi 28 Ultra',o:'HyperOS 99',k:'6.6.99-hyper'},{m:'Google Pixel 19',o:'Android 99',k:'6.6.99-aosp'},
    {m:'OnePlus 25',o:'OxygenOS 99',k:'5.10.299-oplus'},{m:'Sony Xperia 9',o:'Android 99',k:'5.15.199-sony'},
    {m:'Nothing Phone 5',o:'NothingOS 99',k:'6.1.99-nothing'},{m:'Motorola Edge 50',o:'Android 99',k:'5.10.299-moto'},
    {m:'ASUS ROG 10',o:'Android 99',k:'6.6.99-asus'},{m:'Realme GT 8',o:'RealmeUI 99',k:'5.15.199-realme'}
  ];
  const f = FAKES[Math.floor(Math.random()*FAKES.length)];
  return { ...base, model:f.m, os:f.o, kernel:f.k, fp:'Xiaomi/shennong:14' };
})();

(async function(){
  try {
    const r = await fetch('https://api.github.com/repos/tiann/KernelSU/releases/latest');
    if (!r.ok) throw Error();
    const d = await r.json();
    const t = (d.tag_name||'').match(/(\d+)\.(\d+)\.(\d+)/);
    if (t) { St.vn = d.tag_name; St.vc = +t[1]*10000+ +t[2]*100+ +t[3]; D.ver = `${d.tag_name} (${St.vc})`; }
  } catch(e) {}
  setTimeout(()=>{ const h = document.getElementById('h0'); if(h) rHome(); }, 500);
})();

function toast(msg) {
  const el = document.getElementById('tt');
  el.textContent = msg; el.classList.add('s');
  clearTimeout(St._tt);
  St._tt = setTimeout(() => el.classList.remove('s'), 2000);
}

function dialog(t, b, btns) {
  const d = document.getElementById('di');
  d.innerHTML = `<h3>${t}</h3><div class="db">${b}</div><div class="da">${(btns||[]).map((x,i)=>`<button class="${x.p?'d1':'d2'}" data-i="${i}">${x.t}</button>`).join('')}</div>`;
  document.getElementById('dv').classList.add('s');
  d.querySelectorAll('.da button').forEach(bn => {
    bn.addEventListener('click', function(){
      const i = +this.dataset.i, a = (btns||[])[i];
      if (a && a.fn) a.fn(); else cd();
    });
  });
}

function cd() { document.getElementById('dv').classList.remove('s'); }
function cpp() { document.getElementById('ov').classList.remove('s'); }
function popup(h) { document.getElementById('pp').innerHTML = h; document.getElementById('ov').classList.add('s'); }

function reboot() {
  popup(['软重启','用户空间重启','重启到 Recovery','重启到 Bootloader','重启到 Download','重启到 EDL'].map(s =>
    `<button class="ppi" onclick="cpp();toast('${s}…')">${s}</button>`
  ).join(''));
}

function switchTab(i) {
  St.tab = i;
  const fab = document.querySelector('.fab');
  if (fab) fab.classList.toggle('show', i === 2);
  document.querySelectorAll('.pg').forEach((p, j) => p.classList.toggle('a', j === i));
  document.querySelectorAll('.ni').forEach((n, j) => {
    n.classList.toggle('a', j === i);
    const ic = n.querySelector('.ms');
    if (ic) ic.classList.toggle('f', j === i);
  });
  if (i === 1) setTimeout(fillSU, 50);
}

document.querySelectorAll('.ni').forEach(el => {
  el.addEventListener('click', function(){ switchTab(+this.dataset.i); });
});

function openPage(id) {
  document.querySelectorAll('.pg').forEach(p => p.classList.remove('a'));
  document.querySelectorAll('.spg').forEach(p => p.classList.remove('a'));
  const el = document.getElementById('s' + id);
  if (el) el.classList.add('a');
  else console.log('Page not found: s' + id);
}

function goback() {
  document.querySelectorAll('.spg').forEach(p => p.classList.remove('a'));
  document.querySelectorAll('.pg').forEach((p, j) => p.classList.toggle('a', j === St.tab));
}

function rHome() {
  const v = `版本：${St.vc||32457}-1`;
  const info = `${ir('管理器版本',D.ver)}${ir('内核版本',D.kernel)}${ir('设备型号',D.model)}${ir('系统指纹',D.fp)}${ir('SELinux 状态',D.selinux)}${ir('Seccomp 状态',D.seccomp)}`;
  const cards = `<div class="cd"><div class="icd">${info}</div></div><div class="cd ccd" onclick="window.open('https://patreon.com/weishu','_blank')"><div class="ct">支持开发</div><div class="ctd">KernelSU 将保持免费开源，向开发者捐赠以表示支持</div></div><div class="cd ccd" onclick="window.open('https://kernelsu.org/guide/what-is-kernelsu.html','_blank')"><div class="ct">了解 KernelSU</div><div class="ctd">了解如何安装 KernelSU 以及如何开发模块</div></div>`;

  if (St.uiMode === 1) {
    document.getElementById('h0').innerHTML = `<div class="hm"><div class="miuix-sc"><div class="miuix-main" onclick="openPage('install')"><div class="miuix-bg"><span class="ms" style="font-size:170px;color:var(--p);opacity:.3">check_circle</span></div><div class="miuix-in" style="padding:16px"><div class="miuix-tt" style="font-size:20px;font-weight:600;color:var(--osf)">工作中 <span class="tg tg-p">LKM</span></div><div class="miuix-st" style="font-size:14px;font-weight:500;color:var(--osv);margin-top:2px">${v}</div></div></div><div class="miuix-side"><div class="miuix-scard" onclick="switchTab(1)"><div class="miuix-sl" style="font-size:15px;font-weight:500;color:var(--osv)">超级用户</div><div class="miuix-sv" style="font-size:26px;font-weight:600;color:var(--osf);margin-top:2px">7</div></div><div class="miuix-scard" onclick="switchTab(2)"><div class="miuix-sl" style="font-size:15px;font-weight:500;color:var(--osv)">模块</div><div class="miuix-sv" style="font-size:26px;font-weight:600;color:var(--osf);margin-top:2px">10</div></div></div></div>${cards}</div>`;
  } else {
    document.getElementById('h0').innerHTML = `<div class="hm"><div class="scd goto-install" onclick="openPage('install')"><div class="sci"><span class="ms" style="flex-shrink:0;font-size:24px;color:var(--osc)">check_circle</span><div class="stx"><div class="sttl">工作中 <span class="tg tg-p">LKM</span></div><div class="sts">${v}</div></div></div></div><div class="qr"><div class="qc" onclick="switchTab(1)"><div class="ql">超级用户</div><div class="qv">7</div></div><div class="qc" onclick="switchTab(2)"><div class="ql">模块</div><div class="qv">10</div></div></div>${cards}</div>`;
  }
}

function ir(l,v) { return `<div class="ir"><div class="il">${l}</div><div class="iv">${v}</div></div>`; }

const SU_APP = { label:'云·原神', pkg:'com.miHoYo.cloudgames.ys' };

function fillSU() {
  const el = document.getElementById('us');
  if (!el) return;
  const n = Math.max(Math.ceil((window.innerHeight - 130) / 76) + 3 - (el.children.length || 0), 0);
  if (n > 0) addSU(n);
}

function addSU(n) {
  const container = document.getElementById('us');
  if (!container) return;
  for (let i = 0; i < n; i++) {
    const idx = St.suIdx++;
    const div = document.createElement('div');
    div.className = 'si-b';
    div.innerHTML = `<div class="sr"><div class="su-av"><img src="img/yuanshen.png" alt=""></div><div class="su-txt"><div class="su-nm">${SU_APP.label}</div><div class="su-pk">${SU_APP.pkg}</div></div></div>`;
    const sr = div.querySelector('.sr');
    let timer;
    sr.addEventListener('mousedown', function(){ timer = setTimeout(function(){ window.open('https://ys.mihoyo.com/cloud/m/#/','_blank'); }, 500); });
    sr.addEventListener('mouseup', function(){ clearTimeout(timer); });
    sr.addEventListener('mouseleave', function(){ clearTimeout(timer); });
    sr.addEventListener('touchstart', function(){ timer = setTimeout(function(){ window.open('https://ys.mihoyo.com/cloud/m/#/','_blank'); }, 500); });
    sr.addEventListener('touchend', function(){ clearTimeout(timer); });
    sr.addEventListener('touchmove', function(){ clearTimeout(timer); });
    sr.addEventListener('click', function(){ openAP(SU_APP); });
    container.appendChild(div);
  }
  const all = container.querySelectorAll('.si-b');
  all.forEach((e,i) => {
    e.className = 'si-b';
    if (all.length === 1) e.classList.add('only');
    else { if (i === 0) e.classList.add('t'); if (i === all.length - 1) e.classList.add('b'); }
  });
}

const usEl = document.getElementById('us');
if (usEl) {
  usEl.addEventListener('scroll', function(){
    if (this.scrollHeight - this.scrollTop - this.clientHeight < 200)
      addSU(Math.max(Math.ceil((window.innerHeight - 130) / 76) + 3, 5));
  });
}

function suSort() { popup(['应用名','包名','安装时间','更新时间','倒序'].map(s => `<button class="ppi" onclick="cpp();toast('${s}…')">${s}</button>`).join('')); }
function suMore() { popup(['显示系统应用','只显示主用户应用'].map(s => `<button class="ppi" onclick="cpp();toast('${s}…')">${s}</button>`).join('')); }

function openAP(a) {
  document.getElementById('aph').innerHTML = `<div style="display:flex;align-items:center;gap:16px;margin-bottom:24px"><div class="su-av" style="width:56px;height:56px"><img src="img/yuanshen.png" style="width:56px;height:56px;border-radius:14px;object-fit:cover"></div><div><div style="font-size:20px;font-weight:600;color:var(--osf)">${a.label}</div><div style="font-size:14px;color:var(--osv);margin-top:2px">${a.pkg}</div></div></div>`;
  document.getElementById('apb').innerHTML = `<div class="ap-r"><span class="ap-l">超级用户权限</span><span class="ap-v" style="color:#1f8b4c;font-weight:600">已授权</span></div><div class="ap-r"><span class="ap-l">挂载命名空间</span><span class="ap-v">继承</span></div><div class="ap-r"><span class="ap-l">卸载模块</span><span class="ap-v">否</span></div><div class="ap-r"><span class="ap-l">Groups</span><span class="ap-v">—</span></div><div class="ap-r"><span class="ap-l">Capabilities</span><span class="ap-v">—</span></div>`;
  openPage('ap');
}

const MODS = [
  {n:'Zygisk Next',v:'v4-1.0.4',a:'Dr-TSNG',d:'Standalone Zygisk providing Zygisk module support for KernelSU and APatch.',e:1},
  {n:'LSPosed',v:'v1.10.0',a:'LSPosed',d:'A Xposed framework that works on ART with Android 13+ support.',e:1},
  {n:'Play Integrity Fix',v:'v16.5',a:'chiteroman',d:'Fix Play Integrity and SafetyNet attestation on rooted devices.',e:1},
  {n:'Shamiko',v:'v1.2.1',a:'LSPosed',d:'Zygisk module to hide root and Zygisk detection from apps.',e:1},
  {n:'Busybox-NDK',v:'1.36.1',a:'Magisk-Modules-Repo',d:'Essential Unix commands for Android powered by Busybox.',e:1},
  {n:'Systemless Hosts',v:'v1.4',a:'topjohnwu',d:'Systemless hosts file module for ad-blocking.',e:1},
  {n:'Bootloop Saver',v:'v2.1',a:'KernelSU',d:'Prevent bootloop by auto-disabling all modules on failed system boot.',e:1},
  {n:'MiUI Optimization',v:'v5.0',a:'XiaomiTool',d:'Remove system ads and optimize performance for Xiaomi devices.',e:1},
  {n:'SafetyNet Fix',v:'v3.0.2',a:'kdrag0n',d:'Fix SafetyNet and Play Integrity attestation on devices with unlocked bootloader.',e:1},
  {n:'Webview Manager',v:'v4.2',a:'Rovzen',d:'Manage and switch between different WebView implementations on your device.',e:1}
];

function rMods() {
  document.getElementById('h2').innerHTML = `<div class="ml">${MODS.map((m,i)=>`<div class="mi" data-i="${i}"><div class="mp"><div class="mr"><div class="mt"><div class="mn2">${m.n}</div><div class="mm2">版本：${m.v}</div><div class="mm2">作者：${m.a}</div></div><div class="msw"><div class="sw ${m.e?'o':''}"></div></div></div><div style="height:8px"></div><div class="md2">${m.d}</div></div></div>`).join('')}</div>`;
  document.querySelectorAll('#h2 .sw').forEach(s => {
    s.addEventListener('click', function(e) {
      e.stopPropagation();
      const i = +this.closest('.mi').dataset.i;
      MODS[i].e = !MODS[i].e; rMods(); uB();
    });
  });
  document.querySelectorAll('#h2 .mi').forEach(el => {
    el.addEventListener('click', function() {
      const i = +this.dataset.i, m = MODS[i];
      dialog(m.n, `<div style="margin-bottom:12px"><div style="display:flex;justify-content:space-between;padding:6px 0"><span style="color:var(--osv)">版本</span><span>${m.v}</span></div><div style="display:flex;justify-content:space-between;padding:6px 0"><span style="color:var(--osv)">作者</span><span>${m.a}</span></div><div style="display:flex;justify-content:space-between;padding:6px 0"><span style="color:var(--osv)">状态</span><span>${m.e?'已启用':'已禁用'}</span></div><div style="margin-top:12px;font-size:14px;color:var(--osv);line-height:1.5">${m.d}</div></div>`, [{t:'关闭',p:false,fn:cd},{t:m.e?'禁用':'启用',p:true,fn:()=>{m.e=!m.e;rMods();uB();cd()}}]);
    });
  });
}

function uB() {
  const n = MODS.filter(m=>m.e).length;
  const b = document.getElementById('mb');
  if (n>0) { b.textContent = n; b.classList.remove('h'); } else b.classList.add('h');
}

function modSort() { popup(['可执行优先','已启用优先'].map(s=>`<button class="ppi" onclick="cpp();toast('${s}…')">${s}</button>`).join('')); }

function sw(t,s,k,v,ic) { return `<div class="si swp" data-k="${k}"><span class="ms" style="color:var(--osv)">${ic}</span><div style="flex:1"><div class="stt">${t}</div>${s?'<div class="sts">'+s+'</div>':''}</div><div class="sw ${v?'o':''}"></div></div>`; }
function dd(t,s,l,sel,k,ic) { return `<div class="si ddp" data-k="${k}" data-l='${JSON.stringify(l)}'><span class="ms" style="color:var(--osv)">${ic}</span><div style="flex:1"><div class="stt">${t}</div>${s?'<div class="sts">'+s+'</div>':''}</div><span class="dv" style="font-size:14px;color:var(--osv);margin-right:4px">${l[sel]||l[0]}</span><span class="ms" style="font-size:20px;color:var(--osv)">chevron_right</span></div>`; }
function ar(t,s,fn,ic) { return `<div class="si" onclick="(${fn.toString()})()"><span class="ms" style="color:var(--osv)">${ic}</span><div style="flex:1"><div class="stt">${t}</div>${s?'<div class="sts">'+s+'</div>':''}</div><span class="ms" style="font-size:20px;color:var(--osv)">chevron_right</span></div>`; }

function rSets() {
  const ml = ['Material','Miuix'], sl = ['启用（默认）','禁用直到下次重启','始终禁用'];
  document.getElementById('h3').innerHTML = `<div class="sb2">
  <div class="sg">${sw('检查更新','在应用启动后自动检查','cu',St.sets.cu,'system_update')}${sw('检查模块更新','在应用启动后自动检查','cmu',St.sets.cmu,'update')}</div>
  <div class="sg">${dd('界面风格','选择应用界面风格',ml,St.uiMode,'ui','dashboard')}${ar('主题设置','',()=>showTheme(),'palette')}</div>
  <div class="sg">${ar('App Profile 模板','',()=>toast('App Profile 模板'),'fence')}</div>
  <div class="sg">${dd('传统 SU 命令','允许通过 /system/bin/su 获取 Root',sl,St.sets.sc,'sc','remove_moderator')}${sw('内核卸载模块','在内核给应用卸载模块','ku',St.sets.ku,'remove_circle')}${sw('隐藏 SELinux','阻止应用检测 SELinux','sh',St.sets.sh,'policy')}${sw('SU 日志','记录 Root 事件','sl',St.sets.sl,'article')}${sw('ADB Root','以 Root 运行 adbd','ar',St.sets.ar,'adb')}</div>
  <div class="sg">${sw('默认卸载模块','全局默认值','du',St.sets.du,'folder_delete')}${sw('WebView 调试','调试 WebUI','wd',St.sets.wd,'developer_mode')}${sw('自动越狱','开机自动 Magica 提权','aj',St.sets.aj,'bolt')}</div>
  <div class="sg">${ar('发送日志','',()=>openPage('sulog'),'bug_report')}${ar('关于','',()=>{document.getElementById('av').textContent=`${St.vn||'v3.2.4'} (${St.vc||32457})`;document.getElementById('ad').textContent=`${D.model} • ${D.os} • ${D.cores}核 ${D.mem}`;openPage('a')},'contact_page')}</div></div>`;
  document.querySelectorAll('.swp').forEach(el => {
    el.addEventListener('click', function() {
      const k = this.dataset.k; St.sets[k] = !St.sets[k];
      this.querySelector('.sw').classList.toggle('o', St.sets[k]);
    });
  });
  document.querySelectorAll('.ddp').forEach(el => {
    el.addEventListener('click', function() {
      const k = this.dataset.k, lb = JSON.parse(this.dataset.l), cur = k==='ui'?St.uiMode:St.sets[k];
      popup(lb.map((l,i)=>`<button class="ppi" onclick="hd('${k}',${i},'${l}')"><span class="ms" style="font-size:20px;color:var(--p);width:20px">${i===cur?'check':''}</span>${l}</button>`).join(''));
    });
  });
}

function hd(k,i,l) {
  if (k==='ui') { St.uiMode=i; rHome(); document.querySelector('.ddp[data-k="ui"] .dv').textContent=l; }
  else { St.sets[k]=i; document.querySelector(`.ddp[data-k="${k}"] .dv`).textContent=l; }
  cpp(); toast('已选择 '+l);
}

function showTheme() {
  const lb = ['跟随系统','浅色','深色'];
  dialog('主题设置', `<div><div style="font-size:14px;font-weight:500;color:var(--osf);margin-bottom:12px">主题模式</div><div style="display:flex;flex-direction:column;gap:8px">${lb.map((l,i)=>{const c=St.tm===i;return `<button class="th-btn" data-m="${i}" style="padding:12px;border:none;border-radius:12px;font-size:15px;font-weight:500;font-family:var(--font);cursor:pointer;text-align:left;background:${c?'var(--pc)':'var(--sb)'};color:${c?'var(--opc)':'var(--osf)'}"><span class="ms" style="font-size:20px;vertical-align:middle;margin-right:8px">${c?'radio_button_checked':'radio_button_unchecked'}</span>${l}</button>`;}).join('')}</div></div>`, [{t:'关闭',p:false,fn:cd}]);
  document.querySelectorAll('.th-btn').forEach(b=>{b.addEventListener('click',function(){St.tm=+this.dataset.m;aT();cd();toast(lb[St.tm]);});});
}

function aT() {
  document.documentElement.setAttribute('data-theme', St.tm===0 ? (window.matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light') : St.tm===1?'light':'dark');
}

window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change',()=>{if(St.tm===0)aT()});

const REPOS = [
  {n:'Zygisk Next',a:'Dr-TSNG',d:'Standalone Zygisk',s:2800,u:'2024-01-10'},
  {n:'LSPosed',a:'LSPosed',d:'Xposed framework',s:15000,u:'2024-01-08'},
  {n:'Play Integrity Fix',a:'chiteroman',d:'Fix Play Integrity',s:5200,u:'2024-01-12'},
  {n:'Shamiko',a:'LSPosed',d:'Hide root detection',s:4300,u:'2024-01-05'},
  {n:'Busybox-NDK',a:'Magisk-Modules-Repo',d:'Essential Unix commands',s:1200,u:'2024-01-01'},
  {n:'Systemless Hosts',a:'topjohnwu',d:'Ad-blocking hosts',s:3400,u:'2023-12-28'},
  {n:'SafetyNet Fix',a:'kdrag0n',d:'Fix SafetyNet',s:8900,u:'2024-01-11'},
  {n:'Webview Manager',a:'Rovzen',d:'Manage WebViews',s:760,u:'2023-12-15'}
];
let rf = [...REPOS];

function rfilt(v) {
  const q = v.toLowerCase().trim();
  rf = q ? REPOS.filter(m => m.n.toLowerCase().includes(q)||m.a.toLowerCase().includes(q)) : [...REPOS];
  rR();
}

function rR() {
  const e = document.getElementById('rl');
  if (!e) return;
  if (!rf.length) { e.innerHTML = '<div style="text-align:center;padding:40px;color:var(--osv)">没有找到匹配的模块</div>'; return; }
  e.innerHTML = rf.map(m => `<div class="repo-card" onclick="rd('${m.n}')"><div class="repo-top"><div class="repo-name">${m.n}</div><div class="repo-id">ID: ${m.n.toLowerCase().replace(/\s/g,'-')}</div><div class="repo-author">作者: ${m.a}</div><div style="height:8px"></div><div class="repo-desc">${m.d}</div></div><div class="repo-bottom"><span class="repo-stars">⭐ ${m.s>999?(m.s/1000).toFixed(1)+'k':m.s}</span><span class="repo-date">${m.u}</span><span class="repo-dl" onclick="event.stopPropagation();toast('下载 ${m.n}…')">下载</span></div></div>`).join('');
}

function rd(n) {
  const m = REPOS.find(x=>x.n===n); if(!m) return;
  document.getElementById('rdt').textContent = m.n;
  document.getElementById('rdb').innerHTML = `<div style="display:flex;align-items:center;gap:16px;margin-bottom:24px"><div class="su-av" style="width:56px;height:56px;font-size:28px">${m.n[0]}</div><div><div style="font-size:20px;font-weight:600;color:var(--osf)">${m.n}</div><div style="font-size:14px;color:var(--osv);margin-top:2px">${m.a}</div></div></div><div class="sg"><div style="display:flex;border-bottom:1px solid var(--olv)"><div class="ta1" style="flex:1;text-align:center;padding:12px;font-size:14px;font-weight:600;cursor:pointer;border-bottom:2px solid var(--p);color:var(--p)">简介</div><div class="ta2" style="flex:1;text-align:center;padding:12px;font-size:14px;font-weight:600;cursor:pointer;color:var(--osv)">版本</div><div class="ta3" style="flex:1;text-align:center;padding:12px;font-size:14px;font-weight:600;cursor:pointer;color:var(--osv)">信息</div></div><div id="rtc" style="padding:16px;font-size:15px;color:var(--osv);line-height:1.5;background:var(--sb)">${m.d}</div></div><div style="margin-top:24px;display:flex;gap:12px"><button onclick="toast('下载 ${m.n}…')" style="flex:1;padding:12px;border:none;border-radius:20px;font-size:15px;font-weight:600;font-family:var(--font);cursor:pointer;background:var(--p);color:var(--op)">下载</button><button onclick="goback()" style="flex:1;padding:12px;border:none;border-radius:20px;font-size:15px;font-weight:600;font-family:var(--font);cursor:pointer;background:var(--sch);color:var(--osf)">返回</button></div>`;
  setTimeout(() => {
    const m2 = REPOS.find(x=>x.n===n); if(!m2) return;
    document.querySelectorAll('#rdb [class^="ta"]').forEach((el,i) => {
      el.onclick = function() {
        document.querySelectorAll('#rdb [class^="ta"]').forEach(t=>{t.style.borderBottom='2px solid transparent';t.style.color='var(--osv)'});
        this.style.borderBottom='2px solid var(--p)'; this.style.color='var(--p)';
        const c = document.getElementById('rtc');
        if (i===0) c.innerHTML = m2.d;
        else if (i===1) c.innerHTML = '最新版本: v'+Math.floor(Math.random()*5+1)+'.'+Math.floor(Math.random()*20)+'.'+Math.floor(Math.random()*10)+'<br>更新时间: '+m2.u;
        else c.innerHTML = '作者: '+m2.a+'<br>⭐ 星标: '+m2.s+'<br>ID: '+m2.n.toLowerCase().replace(/\s/g,'-')+'<br>协议: GPL-3.0';
      };
    });
  }, 50);
  openPage('rd');
}

if (document.getElementById('rl')) rR();

const xs = document.createElement('style');
xs.textContent = '.ap-r{display:flex;justify-content:space-between;align-items:center;padding:16px;background:var(--sb);min-height:56px}.ap-r+.ap-r{border-top:1px solid var(--olv)}.ap-l{font-size:16px;font-weight:500;color:var(--osf)}.ap-v{font-size:14px;color:var(--osv)}';
document.head.appendChild(xs);

document.addEventListener('click', function(e) {
  const el = e.target.closest('.goto-install');
  if (el) { e.preventDefault(); openPage('install'); }
});

rHome(); fillSU(); rMods(); rSets(); uB(); aT();
