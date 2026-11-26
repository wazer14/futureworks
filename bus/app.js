(()=>{
const D=window.BT_DEMO,$=(s,r=document)=>r.querySelector(s),LS=localStorage;
const H8=8*3600e3;
const jget=(k,d)=>{try{return JSON.parse(LS.getItem(k))??d}catch(_){return d}};
const jset=(k,v)=>LS.setItem(k,JSON.stringify(v));
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const hms=ms=>{ms=Math.max(0,Math.floor(ms/1000));return pad(Math.floor(ms/3600))+':'+pad(Math.floor(ms%3600/60))+':'+pad(ms%60)};
const hm=ms=>{const m=Math.round(ms/60000);return Math.floor(m/60)+':'+pad(m%60)};
const fdate=t=>new Date(t).toLocaleDateString('ar-SA-u-ca-gregory',{weekday:'short',day:'numeric',month:'short'});
const ftime=t=>new Date(t).toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'});
const toast=t=>{const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.h);toast.h=setTimeout(()=>e.classList.remove('on'),2600)};
const toRad=x=>x*Math.PI/180;
const dist=(a,b)=>{const R=6371,dl=toRad(b[0]-a[0]),dn=toRad(b[1]-a[1]);const x=Math.sin(dl/2)**2+Math.cos(toRad(a[0]))*Math.cos(toRad(b[0]))*Math.sin(dn/2)**2;return 2*R*Math.asin(Math.sqrt(x))}; // km
const drv=u=>D.drivers.find(d=>d.u===u);
let session=jget('bt.session',null),timers=[],watchId=null,map=null;
const clearTimers=()=>{timers.forEach(clearInterval);timers=[];if(watchId!=null){navigator.geolocation.clearWatch(watchId);watchId=null}if(map){map.remove();map=null}};
const ICON='<svg class="logo" viewBox="0 0 192 192"><rect width="192" height="192" rx="40" fill="#16315a"/><rect x="38" y="48" width="116" height="86" rx="16" fill="#d9bf86"/><rect x="52" y="63" width="88" height="32" fill="#0c1f3a"/><circle cx="66" cy="126" r="13" fill="#0c1f3a" stroke="#d9bf86" stroke-width="4"/><circle cx="126" cy="126" r="13" fill="#0c1f3a" stroke="#d9bf86" stroke-width="4"/></svg>';

/* ---------- shifts / history ---------- */
const rnd=(seed=>()=>(seed=(seed*1664525+1013904223)%4294967296)/4294967296);
function demoShifts(){
  const out=[],r=rnd(42),now=new Date();
  D.drivers.filter(d=>d.sim!=='off').forEach((d,i)=>{
    for(let k=1;k<=75;k++){
      const day=new Date(now.getFullYear(),now.getMonth(),now.getDate()-k);
      if(day.getDay()===5)continue; // Friday off
      if(r()<.08)continue;
      const start=day.getTime()+(6+r()*2)*3600e3;
      const bias=[.4,.6,.9,1.3,.7][i]||.6;
      const dur=(7.4+r()*1.6+(r()<.35*bias?r()*2.2*bias:0))*3600e3;
      out.push({u:d.u,bus:d.bus,start,end:start+dur,demo:true});
    }
  });
  return out;
}
const DEMO_SHIFTS=demoShifts();
const allShifts=()=>[...DEMO_SHIFTS,...jget('bt.shifts',[])];
const ot=s=>Math.max(0,(s.end-s.start)-H8);

/* ---------- login ---------- */
function loginView(msg=''){
  clearTimers();
  $('#app').innerHTML=`<div class="login">${ICON}<h1>تتبع الباصات</h1><p class="sub">دخول السائقين ولوحة الإدارة</p>
  <form class="card" id="lf"><label class="f">اسم المستخدم</label><input class="t" id="u" autocomplete="username" autocapitalize="off" required>
  <label class="f">كلمة المرور</label><input class="t" id="p" type="password" autocomplete="current-password" required>
  <div class="err" id="er">${esc(msg)}</div><button class="btn gold" type="submit">دخول</button>
  <div class="demo-box"><b>نسخة تجريبية.</b> حسابات تجريبية فقط:<br>
  <button type="button" data-fill="driver1|1234">سائق: driver1 / 1234</button><br>
  <button type="button" data-fill="admin|admin123">مدير: admin / admin123</button><br>
  لا تستخدم كلمات مرور حقيقية. التحقق هنا للعرض فقط وسيُنقل للخادم لاحقًا.</div></form></div>`;
  document.querySelectorAll('[data-fill]').forEach(b=>b.onclick=()=>{const[a,c]=b.dataset.fill.split('|');$('#u').value=a;$('#p').value=c});
  $('#lf').onsubmit=e=>{e.preventDefault();const u=$('#u').value.trim().toLowerCase(),p=$('#p').value;
    if(u===D.admin.u&&p===D.admin.p)session={u,role:'admin'};
    else{const d=drv(u);if(d&&d.p===p)session={u,role:'driver'};else{$('#er').textContent='اسم المستخدم أو كلمة المرور غير صحيحة';return}}
    jset('bt.session',session);route();};
}
const logout=()=>{if(session?.role==='driver'&&jget('bt.shift.'+session.u,null)&&!confirm('عندك دوام شغال. تبي تخرج بدون تسليم الباص؟ الدوام يبقى شغال.'))return;LS.removeItem('bt.session');session=null;route()};

/* ---------- driver ---------- */
function driverView(){
  clearTimers();
  const d=drv(session.u);
  const st={pos:null,acc:null,speed:0,bat:null,perm:'ask',km:0,trips:0,still:0,moving:false,last:null};
  const shift0=jget('bt.shift.'+d.u,null);if(shift0){st.km=shift0.km||0;st.trips=shift0.trips||0}
  $('#app').innerHTML=`<div class="top"><div><b>${esc(d.name)}</b><small>${esc(d.u)}</small></div><span class="sp"></span><button class="out" id="lo">خروج</button></div>
  <div class="pad"><div id="perm"></div>
   <div class="card"><div id="shift"></div></div>
   <div class="stats"><div class="stat"><b id="s-km">0.0</b><span>كم اليوم</span></div><div class="stat"><b id="s-sp">0</b><span>كم/س</span></div><div class="stat"><b id="s-bat">—</b><span>البطارية</span></div></div>
   <div class="card" id="last"></div>
   <div class="note">عند فتح التطبيق يطلب إذن الموقع. التطبيق يرسل موقعك للإدارة طوال الدوام. في هذه النسخة التجريبية البيانات تبقى على هذا الجهاز فقط.</div></div>`;
  $('#lo').onclick=logout;
  const liveKey='bt.live.'+d.u;
  const pushLive=()=>{if(!st.pos)return;const sh=jget('bt.shift.'+d.u,null);jset(liveKey,{lat:st.pos[0],lon:st.pos[1],speed:st.speed,bat:st.bat,ts:Date.now(),onShift:!!sh,km:st.km,trips:st.trips,bus:sh?.bus||d.bus})};
  const permUi=()=>{$('#perm').innerHTML=st.perm==='ok'?`<div class="banner ok">الموقع شغال${st.acc?` (دقة ${Math.round(st.acc)} م)`:''}</div>`:st.perm==='denied'?`<div class="banner bad">إذن الموقع مرفوض. فعّله من إعدادات المتصفح للموقع، ثم <button class="btn sm gold" id="rt">إعادة المحاولة</button></div>`:st.perm==='nosupport'?`<div class="banner bad">هذا الجهاز أو المتصفح لا يدعم تحديد الموقع.</div>`:`<div class="banner warn">بانتظار إذن الموقع. اضغط "سماح" في النافذة اللي ظهرت. <button class="btn sm gold" id="rt">طلب الإذن</button></div>`;$('#rt')&&($('#rt').onclick=startGeo)};
  function startGeo(){
    if(!navigator.geolocation){st.perm='nosupport';permUi();return}
    if(watchId!=null)navigator.geolocation.clearWatch(watchId);
    watchId=navigator.geolocation.watchPosition(p=>{
      const np=[p.coords.latitude,p.coords.longitude];st.perm='ok';st.acc=p.coords.accuracy;
      let sp=p.coords.speed!=null&&!isNaN(p.coords.speed)?p.coords.speed*3.6:null;
      const now=Date.now();
      if(st.last&&sp==null){const dt=(now-st.last.t)/3600e3;sp=dt>0?dist(st.last.p,np)/dt:0}
      sp=sp||0;
      const onShift=!!jget('bt.shift.'+d.u,null);
      if(st.last&&onShift&&p.coords.accuracy<80){const k=dist(st.last.p,np);if(k<2&&k>0.005)st.km+=k}
      const mv=sp>4;if(mv&&!st.moving&&st.still>60e3&&onShift)st.trips++;
      if(mv){st.still=0}else{st.still=(st.still||0)+(st.last?now-st.last.t:0)}
      st.moving=mv;st.speed=sp;st.pos=np;st.last={p:np,t:now};
      $('#s-km').textContent=st.km.toFixed(1);$('#s-sp').textContent=Math.round(sp);
      if(onShift){const sh=jget('bt.shift.'+d.u,{});sh.km=st.km;sh.trips=st.trips;jset('bt.shift.'+d.u,sh)}
      permUi();pushLive();
    },e=>{st.perm=e.code===1?'denied':'ask';permUi()},{enableHighAccuracy:true,maximumAge:5000,timeout:20000});
  }
  if(navigator.getBattery)navigator.getBattery().then(b=>{const u=()=>{st.bat=Math.round(b.level*100);$('#s-bat').textContent=st.bat+'%';pushLive()};u();b.addEventListener('levelchange',u)});
  permUi();startGeo();
  let wl=null;const keepAwake=async()=>{try{if(navigator.wakeLock&&jget('bt.shift.'+d.u,null))wl=await navigator.wakeLock.request('screen')}catch(_){}};
  const renderShift=()=>{
    const sh=jget('bt.shift.'+d.u,null);
    if(!sh){
      $('#shift').innerHTML=`<div class="ring-wrap"><svg class="ring" viewBox="0 0 240 240"><circle class="bg" cx="120" cy="120" r="104"/></svg><div class="ring-in"><div class="tm">00:00:00</div><small>الدوام 8 ساعات</small></div></div>
      <label class="f">الباص</label><select class="t" id="bus">${D.buses.map(b=>`<option ${b===d.bus?'selected':''}>${b}</option>`).join('')}</select>
      <button class="btn gold" id="in">استلام الباص</button>`;
      $('#in').onclick=()=>{jset('bt.shift.'+d.u,{bus:$('#bus').value,start:Date.now(),km:0,trips:0});st.km=0;st.trips=0;toast('بدأ الدوام. الله يعطيك العافية');keepAwake();renderShift();pushLive()};
    }else{
      const e=Date.now()-sh.start,over=Math.max(0,e-H8),C=2*Math.PI*104,frac=Math.min(1,e/H8);
      $('#shift').innerHTML=`<div class="ring-wrap"><svg class="ring" viewBox="0 0 240 240"><circle class="bg" cx="120" cy="120" r="104"/><circle class="fg ${over?'ot':''}" cx="120" cy="120" r="104" stroke-dasharray="${C}" stroke-dashoffset="${C*(1-frac)}"/></svg>
      <div class="ring-in"><div class="tm" id="tm">${hms(e)}</div><small>${over?'وقت إضافي':'من 8 ساعات'}</small></div></div>
      <div class="ot-box" id="otb">${over?'وقت إضافي: '+hms(over):''}</div>
      <p style="text-align:center;color:#667085;margin:6px 0 0;font-size:14px">الباص ${esc(sh.bus)} · بدأ ${ftime(sh.start)}</p>
      <button class="btn red" id="out">تسليم الباص</button>
      <button class="btn sm ghost" id="sim" style="margin:12px auto 0;display:block">تجربة: تقديم الوقت 7 ساعات (عرض فقط)</button>`;
      $('#out').onclick=()=>{if(!confirm('تأكيد تسليم الباص وإنهاء الدوام؟'))return;const end=Date.now(),s={u:d.u,bus:sh.bus,start:sh.start,end,km:+(sh.km||0).toFixed(1),trips:sh.trips||0};const a=jget('bt.shifts',[]);a.push(s);jset('bt.shifts',a);LS.removeItem('bt.shift.'+d.u);wl?.release?.();st.km=0;st.trips=0;pushLive();
        const o=ot(s);$('#last').innerHTML=lastHtml();renderShift();toast(o?'تم التسليم. وقت إضافي '+hm(o):'تم التسليم. شكرًا لك');};
      $('#sim').onclick=()=>{sh.start-=7*3600e3;jset('bt.shift.'+d.u,sh);renderShift()};
    }
  };
  const lastHtml=()=>{const l=jget('bt.shifts',[]).filter(s=>s.u===d.u).slice(-3).reverse();return `<b>آخر دوام مسجل</b>`+(l.length?l.map(s=>`<div style="display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e6e0d2;font-size:14px"><span>${fdate(s.start)} · ${esc(s.bus)}</span><span>${hm(s.end-s.start)} ${ot(s)?`<b style="color:#dc2626">(+${hm(ot(s))})</b>`:''}</span></div>`).join(''):'<p style="color:#667085;margin:8px 0 0;font-size:14px">لا يوجد بعد.</p>')};
  $('#last').innerHTML=lastHtml();
  renderShift();keepAwake();
  timers.push(setInterval(()=>{const sh=jget('bt.shift.'+d.u,null);if(!sh)return;const e=Date.now()-sh.start;$('#tm').textContent=hms(e);const over=Math.max(0,e-H8);$('#otb').textContent=over?'وقت إضافي: '+hms(over):'';if(over&&!$('.ring .fg.ot'))renderShift()},1000));
  timers.push(setInterval(()=>{if(st.pos)pushLive()},15000));
  document.onvisibilitychange=()=>{if(!document.hidden)keepAwake()};
}

/* ---------- admin ---------- */
const STYLES=[
 {k:'osm',n:'خريطة الشوارع',u:'https://tile.openstreetmap.org/{z}/{x}/{y}.png',a:'© OpenStreetMap',m:19},
 {k:'esri',n:'خريطة Esri',u:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',a:'Tiles © Esri',m:19},
 {k:'sat',n:'قمر صناعي',u:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',a:'Tiles © Esri',m:19},
 {k:'topo',n:'تضاريس',u:'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',a:'Tiles © Esri',m:19},
 {k:'dark',n:'داكن',u:'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',a:'© OpenStreetMap © CARTO',m:19},
 {k:'light',n:'فاتح',u:'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',a:'© OpenStreetMap © CARTO',m:19}
];
const COL={moving:'#16a34a',stopped:'#d97706',offline:'#6b7280',off:'#94a3b8'};
const LBL={moving:'متحرك',stopped:'متوقف',offline:'لا يوجد اتصال',off:'خارج الدوام'};
/* simulation of demo fleet */
const FLEET={};
function initFleet(){
  D.drivers.forEach(d=>{
    const pts=D.routes[d.bus]||[D.depot];const segs=[];let tot=0;
    for(let i=0;i<pts.length;i++){const a=pts[i],b=pts[(i+1)%pts.length],L=pts.length>1?dist(a,b):0;segs.push({a,b,L,c:tot});tot+=L}
    const f={d,pts,segs,tot,s:Math.random()*tot,dwell:0,speed:0,km:d.shiftH*21+Math.random()*3,trips:Math.max(0,Math.floor(d.shiftH*1.6)),state:d.sim==='off'?'off':'moving',pos:pts[0],bat:d.bat,vmax:34+Math.random()*14,lastBeat:Date.now(),hist:[]};
    if(d.sim==='offline'){f.state='offline';f.speed=0}
    FLEET[d.u]=f;place(f);
  });
}
function place(f){
  if(f.tot===0){f.pos=f.pts[0];return}
  const s=((f.s%f.tot)+f.tot)%f.tot;const g=f.segs.find(x=>s>=x.c&&s<x.c+x.L)||f.segs[0];const t=g.L?(s-g.c)/g.L:0;
  f.pos=[g.a[0]+(g.b[0]-g.a[0])*t,g.a[1]+(g.b[1]-g.a[1])*t];
}
function stepFleet(dt){ // dt seconds
  Object.values(FLEET).forEach(f=>{
    if(f.d.sim==='off'||f.d.sim==='offline'){return}
    if(f.dwell>0){f.dwell-=dt;f.state='stopped';f.speed=0;if(f.dwell<=0){f.state='moving'}return}
    const v=f.vmax*(.85+.3*Math.random());f.speed=v;f.state='moving';
    const km=v*dt/3600*6; // x6 so movement is visible in a demo
    const prev=f.s;f.s+=km;f.km+=km;place(f);
    const crossed=f.segs.some(g=>{const e=g.c+g.L;return prev<e&&f.s>=e});
    if(crossed){f.dwell=14+Math.random()*10;f.trips++}
    if(Math.random()<.002)f.bat=Math.max(1,f.bat-1);
  });
}
function adminState(){
  const live=u=>{const l=jget('bt.live.'+u,null);return l&&Date.now()-l.ts<5*60e3?l:null};
  return D.drivers.map(d=>{
    const f=FLEET[d.u],l=live(d.u);
    if(l&&l.onShift!==false){return {d,state:l.speed>4?'moving':'stopped',pos:[l.lat,l.lon],speed:l.speed,km:l.km||0,trips:l.trips||0,bat:l.bat,real:true,bus:l.bus||d.bus}}
    if(l){return {d,state:'off',pos:[l.lat,l.lon],speed:0,km:0,trips:0,bat:l.bat,real:true,bus:d.bus}}
    return {d,state:f.state,pos:f.pos,speed:f.speed,km:f.km,trips:f.trips,bat:f.bat,real:false,bus:d.bus};
  });
}
const batHtml=b=>b==null?'<span class="bat">—</span>':`<span class="bat" style="color:${b<=20?'#dc2626':b<=40?'#d97706':'#16a34a'}">🔋 ${b}%</span>`;
let tab='map',styleK=localStorage.getItem('bt.style')||'osm',tile=null,markers={},focus=null,month=new Date().toISOString().slice(0,7);
function adminView(){
  clearTimers();markers={};
  $('#app').innerHTML=`<div class="top"><div><b>لوحة الإدارة</b><small>${esc(D.admin.name)}</small></div><span class="sp"></span><button class="out" id="lo">خروج</button></div>
  <div class="tabs"><button class="tab ${tab==='map'?'on':''}" data-t="map">الخريطة المباشرة</button><button class="tab ${tab==='rep'?'on':''}" data-t="rep">تقرير الوقت الإضافي</button></div>
  <div class="admin" id="body"></div><div class="drawer" id="dr"><div class="in" id="drin"></div></div>`;
  $('#lo').onclick=logout;$('#dr').onclick=e=>{if(e.target.id==='dr')$('#dr').classList.remove('on')};
  document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{tab=b.dataset.t;adminView()});
  tab==='map'?mapTab():repTab();
}
function mapTab(){
  $('#body').innerHTML=`<div class="mapwrap"><div id="map"></div><div class="styles" id="styles">${STYLES.map(s=>`<button data-s="${s.k}" class="${s.k===styleK?'on':''}">${s.n}</button>`).join('')}</div>
  <div class="sheet" id="sheet"></div></div>`;
  map=L.map('map',{zoomControl:false,attributionControl:true}).setView(D.depot,12);
  L.control.zoom({position:'bottomleft'}).addTo(map);
  const setTile=k=>{styleK=k;LS.setItem('bt.style',k);const s=STYLES.find(x=>x.k===k);if(tile)map.removeLayer(tile);tile=L.tileLayer(s.u,{attribution:s.a,maxZoom:s.m,subdomains:'abcd'}).addTo(map);document.querySelectorAll('#styles button').forEach(b=>b.classList.toggle('on',b.dataset.s===k))};
  setTile(styleK);
  document.querySelectorAll('#styles button').forEach(b=>b.onclick=()=>setTile(b.dataset.s));
  const draw=(fit)=>{
    const S=adminState();const pts=[];
    S.forEach(x=>{
      const col=COL[x.state];const html=`<div class="mk ${x.state==='moving'?'mv':''}" style="--c:${col}">🚌<span class="mk-l">${esc(x.d.name.split(' ')[0])}</span></div>`;
      if(!markers[x.d.u]){const m=L.marker(x.pos,{icon:L.divIcon({html,className:'',iconSize:[34,34],iconAnchor:[17,17]})}).addTo(map);m.on('click',()=>{focus=x.d.u;map.setView(x.pos,15);sheet()});markers[x.d.u]={m,state:x.state}}
      else{const k=markers[x.d.u];k.m.setLatLng(x.pos);if(k.state!==x.state){k.m.setIcon(L.divIcon({html,className:'',iconSize:[34,34],iconAnchor:[17,17]}));k.state=x.state}}
      pts.push(x.pos);
    });
    if(fit&&pts.length)map.fitBounds(pts,{padding:[50,50],maxZoom:14});
    sheet(S);
  };
  const sheet=(S=adminState())=>{
    const c={moving:0,stopped:0,offline:0,off:0};S.forEach(x=>c[x.state]++);
    $('#sheet').innerHTML=`<div class="grab"></div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">${Object.keys(c).map(k=>`<span class="pill" style="--c:${COL[k]}"><i></i>${LBL[k]} ${c[k]}</span>`).join('')}</div>`+
    S.map(x=>`<button class="drow" data-u="${x.d.u}" style="${focus===x.d.u?'background:#faf7f0':''}"><span class="av">${esc(x.d.name[0])}</span>
     <span><b>${esc(x.d.name)} ${x.real?'<span class="pill" style="--c:#2563eb"><i></i>موقع حقيقي</span>':''}</b><small>${esc(x.bus)} · ${x.km.toFixed(1)} كم · ${x.trips} رحلة · ${Math.round(x.speed||0)} كم/س</small></span>
     <span style="text-align:end"><span class="pill" style="--c:${COL[x.state]}"><i></i>${LBL[x.state]}</span><br>${batHtml(x.bat)}</span></button>`).join('');
    document.querySelectorAll('.drow').forEach(b=>b.onclick=()=>{focus=b.dataset.u;const x=adminState().find(y=>y.d.u===focus);map.setView(x.pos,15);sheet()});
  };
  draw(true);
  timers.push(setInterval(()=>{stepFleet(2);draw(false)},2000));
}
function monthRows(m){
  const [y,mo]=m.split('-').map(Number);
  const sh=allShifts().filter(s=>{const d=new Date(s.start);return d.getFullYear()===y&&d.getMonth()+1===mo});
  return D.drivers.map(d=>{const l=sh.filter(s=>s.u===d.u).sort((a,b)=>a.start-b.start);return {d,l,days:l.length,tot:l.reduce((a,s)=>a+(s.end-s.start),0),ot:l.reduce((a,s)=>a+ot(s),0),otDays:l.filter(s=>ot(s)>0).length}});
}
function repTab(){
  const rows=monthRows(month);
  $('#body').innerHTML=`<div class="rep"><div class="bar"><input type="month" id="mo" value="${month}"><button class="btn sm ghost" id="csv">تصدير CSV</button><span style="color:#667085;font-size:13px">الوقت الإضافي = أي وقت بعد 8 ساعات من استلام الباص حتى تسليمه</span></div>
  <table><thead><tr><th>السائق</th><th>أيام</th><th>إجمالي الساعات</th><th>ساعات إضافية</th><th>أيام فيها إضافي</th></tr></thead><tbody>
  ${rows.map(r=>`<tr class="clk" data-u="${r.d.u}"><td><b>${esc(r.d.name)}</b><br><small style="color:#667085">${esc(r.d.u)}</small></td><td>${r.days}</td><td>${hm(r.tot)}</td><td class="${r.ot?'ov':''}">${hm(r.ot)}</td><td>${r.otDays}</td></tr>`).join('')}
  <tr style="background:#faf7f0;font-weight:800"><td>الإجمالي</td><td>${rows.reduce((a,r)=>a+r.days,0)}</td><td>${hm(rows.reduce((a,r)=>a+r.tot,0))}</td><td class="ov">${hm(rows.reduce((a,r)=>a+r.ot,0))}</td><td>${rows.reduce((a,r)=>a+r.otDays,0)}</td></tr></tbody></table>
  <div class="note">بيانات الأشهر السابقة تجريبية. الدوام اللي يسجله سائق على هذا الجهاز يظهر هنا أيضًا. اضغط على اسم السائق لتفاصيل الأيام.</div></div>`;
  $('#mo').onchange=e=>{if(e.target.value){month=e.target.value;repTab()}};
  $('#csv').onclick=()=>{const lines=[['driver','username','date','bus','start','end','hours','overtime_hours']];rows.forEach(r=>r.l.forEach(s=>lines.push([r.d.name,r.d.u,new Date(s.start).toISOString().slice(0,10),s.bus,ftime(s.start),ftime(s.end),((s.end-s.start)/3600e3).toFixed(2),(ot(s)/3600e3).toFixed(2)])));
    const csv='\ufeff'+lines.map(r=>r.map(v=>'"'+String(v).replace(/"/g,'""')+'"').join(',')).join('\n');const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='overtime-'+month+'.csv';a.click()};
  document.querySelectorAll('tr.clk').forEach(t=>t.onclick=()=>{const r=rows.find(x=>x.d.u===t.dataset.u);
    $('#drin').innerHTML=`<h3 style="margin:0 0 10px">${esc(r.d.name)} · ${month}</h3>`+(r.l.length?`<table><thead><tr><th>التاريخ</th><th>من</th><th>إلى</th><th>المدة</th><th>إضافي</th></tr></thead><tbody>${r.l.map(s=>`<tr><td>${fdate(s.start)}</td><td>${ftime(s.start)}</td><td>${ftime(s.end)}</td><td>${hm(s.end-s.start)}</td><td class="${ot(s)?'ov':''}">${ot(s)?hm(ot(s)):'-'}</td></tr>`).join('')}</tbody></table>`:'<p>لا توجد دوامات.</p>')+'<button class="btn ghost" onclick="document.getElementById(\'dr\').classList.remove(\'on\')">إغلاق</button>';
    $('#dr').classList.add('on')});
}

function route(){if(!session)return loginView();session.role==='admin'?adminView():driverView()}
initFleet();route();
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('sw.js').catch(()=>{});
})();
