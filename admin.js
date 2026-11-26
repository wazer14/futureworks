import {STATUSES,listRequests,updateRequest,resetDemo} from './api.js';
const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const fmtDate=iso=>new Date(iso).toLocaleDateString('ar-SA-u-ca-gregory',{day:'numeric',month:'short',year:'numeric'});
const fmtTime=iso=>new Date(iso).toLocaleTimeString('ar-SA',{hour:'2-digit',minute:'2-digit'});
const rel=iso=>{const m=(Date.now()-new Date(iso))/60000;if(m<60)return 'قبل '+Math.max(1,Math.round(m))+' دقيقة';if(m<1440)return 'قبل '+Math.round(m/60)+' ساعة';const d=Math.round(m/1440);return d===1?'أمس':'قبل '+d+' أيام'};
const phoneFmt=p=>{p=String(p).replace(/\D/g,'');return p.startsWith('966')?'+966 '+p.slice(3,5)+' '+p.slice(5,8)+' '+p.slice(8):'+'+p};
const initials=n=>n.trim().split(/\s+/).slice(0,2).map(w=>w[0]).join('');
const badge=s=>`<span class="badge" style="--c:${STATUSES[s].color}">${STATUSES[s].ar}</span>`;

let ALL=[],view='requests',filter='all',query='',openId=null;

const TEMPLATES=[
 {k:'hello',t:'ترحيب',f:r=>`السلام عليكم ${r.name}، حياك الله. معك فريق أعمال المستقبل للاستقدام. وصلنا طلبك رقم ${r.id} (${r.role}) ونحب نتأكد من بعض التفاصيل عشان نخدمك بأفضل شكل. متى يناسبك نتواصل؟`},
 {k:'details',t:'طلب تفاصيل',f:r=>`السلام عليكم ${r.name}، بخصوص طلبك رقم ${r.id} (${r.role}): ممكن توضح لنا الجنسية المفضلة، العمر والخبرة المطلوبة، وهل في لغة معينة تبيها؟`},
 {k:'cv',t:'إرسال السير الذاتية',f:r=>`السلام عليكم ${r.name}، جهزنا لك عدة سير ذاتية مناسبة لطلبك رقم ${r.id}. نرسلها لك الحين؟ وإذا في أي ملاحظة على المواصفات عطنا خبر.`},
 {k:'contract',t:'توقيع العقد',f:r=>`السلام عليكم ${r.name}، العقد لطلبك رقم ${r.id} جاهز على منصة مساند. نبغى منك توثيقه عشان نكمل الإجراءات. أي استفسار نحن بالخدمة.`},
 {k:'done',t:'اكتمال الطلب',f:r=>`السلام عليكم ${r.name}، تم إنجاز طلبك رقم ${r.id} بحمد الله. نشكر ثقتك، ولو احتجت أي شيء بعد الاستلام نحن معك.`}
];

async function refresh(){ALL=await listRequests();render();}
function filtered(){
  const q=query.trim().toLowerCase();
  return ALL.filter(r=>(filter==='all'||r.status===filter)&&(!q||[r.name,r.phone,r.id,r.role,r.city,r.nationality].join(' ').toLowerCase().includes(q)));
}
function clientsOf(list){
  const m=new Map();list.forEach(r=>{const k=r.phone;if(!m.has(k))m.set(k,{phone:k,name:r.name,city:r.city,orders:[]});m.get(k).orders.push(r)});
  return [...m.values()].sort((a,b)=>new Date(b.orders[0].createdAt)-new Date(a.orders[0].createdAt));
}
function renderKpis(){
  const c=s=>ALL.filter(r=>r.status===s).length;
  const active=ALL.filter(r=>!['done','cancelled'].includes(r.status)).length;
  const k=[['إجمالي الطلبات',ALL.length,'#0c1f3a'],['طلبات جديدة',c('new'),STATUSES.new.color],['قيد المتابعة',active-c('new'),'#b8860b'],['مكتملة',c('done'),STATUSES.done.color],['عملاء',clientsOf(ALL).length,'#7c3aed']];
  $('#kpis').innerHTML=k.map(([l,n,col])=>`<div class="kpi" style="--c:${col}"><b>${n}</b><span>${l}</span></div>`).join('');
  $('#cnt-new').textContent=c('new')||'';
}
function renderChips(){
  const items=[['all','الكل',ALL.length],...Object.entries(STATUSES).map(([k,v])=>[k,v.ar,ALL.filter(r=>r.status===k).length])];
  $('#chips').innerHTML=view!=='requests'?'':items.map(([k,l,n])=>`<button class="chip ${filter===k?'on':''}" data-f="${k}">${l}<em>${n}</em></button>`).join('');
}
function reqRow(r){return `<button class="row" data-id="${r.id}">
  <span class="av">${esc(initials(r.name))}</span>
  <span class="who"><b>${esc(r.name)}</b><small>${esc(r.id)} · ${esc(r.city)}</small></span>
  <span class="what"><b>${esc(r.role)}</b><small>${esc(r.nationality)}</small></span>
  <span class="when">${rel(r.createdAt)}</span>
  ${badge(r.status)}</button>`}
function renderRequests(){
  const l=filtered();
  $('#view').innerHTML=l.length?`<div class="list">${l.map(reqRow).join('')}</div>`:`<div class="empty">لا توجد طلبات مطابقة</div>`;
}
function renderClients(){
  const q=query.trim().toLowerCase();
  const l=clientsOf(ALL).filter(c=>!q||(c.name+c.phone).toLowerCase().includes(q));
  $('#view').innerHTML=l.length?`<div class="list">${l.map(c=>`<button class="row" data-client="${c.phone}">
   <span class="av">${esc(initials(c.name))}</span>
   <span class="who"><b>${esc(c.name)}</b><small dir="ltr" style="text-align:right">${phoneFmt(c.phone)} · ${esc(c.city)}</small></span>
   <span class="what"><b>${c.orders.length} ${c.orders.length>2?'طلبات':c.orders.length===2?'طلبان':'طلب'}</b><small>${c.orders.filter(o=>o.status==='done').length} مكتمل</small></span>
   <span class="when">آخر طلب ${rel(c.orders[0].createdAt)}</span>${badge(c.orders[0].status)}</button>`).join('')}</div>`:`<div class="empty">لا يوجد عملاء</div>`;
}
function renderBoard(){
  const cols=Object.keys(STATUSES);
  $('#view').innerHTML=`<div class="board">${cols.map(s=>{const l=ALL.filter(r=>r.status===s);return `<div class="col"><h4 style="--c:${STATUSES[s].color}">${STATUSES[s].ar}<em>${l.length}</em></h4>${l.map(r=>`<button class="card-k" data-id="${r.id}"><b>${esc(r.name)}</b><small>${esc(r.role)} · ${esc(r.nationality)}</small><small>${rel(r.createdAt)}</small></button>`).join('')||'<p class="none">-</p>'}</div>`}).join('')}</div>`;
}
function render(){
  renderKpis();renderChips();
  $('#title').textContent={requests:'الطلبات',clients:'العملاء',board:'لوحة الحالات'}[view];
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===view));
  ({requests:renderRequests,clients:renderClients,board:renderBoard})[view]();
  if(openId&&$('#drawer').classList.contains('open')&&openId.startsWith?.('FW'))openRequest(openId,true);
}

/* ---------- drawer ---------- */
function openDrawer(html){$('#drawer-in').innerHTML=html;$('#drawer').classList.add('open');$('#scrim').classList.add('on');$('#drawer').setAttribute('aria-hidden','false');$('#drawer-in').scrollTop=0}
function closeDrawer(){$('#drawer').classList.remove('open');$('#scrim').classList.remove('on');$('#drawer').setAttribute('aria-hidden','true');openId=null}
function openRequest(id,keep){
  const r=ALL.find(x=>x.id===id);if(!r)return;openId=id;
  const others=ALL.filter(x=>x.phone===r.phone&&x.id!==r.id);
  const wa=(txt)=>'https://wa.me/'+r.phone+'?text='+encodeURIComponent(txt);
  const first=TEMPLATES[0].f(r);
  const html=`<div class="d-head"><button class="x" data-close>✕</button>
   <div class="d-id"><span class="av lg">${esc(initials(r.name))}</span><div><h2>${esc(r.name)}</h2><small>${r.id} · ${fmtDate(r.createdAt)} ${fmtTime(r.createdAt)}</small></div></div></div>
   <div class="d-sec"><label>الحالة</label>
     <div class="status-pick">${Object.entries(STATUSES).map(([k,v])=>`<button class="sp ${r.status===k?'on':''}" style="--c:${v.color}" data-set="${k}">${v.ar}</button>`).join('')}</div></div>
   <div class="d-sec grid2">
     <div><label>الجوال</label><a dir="ltr" class="val" href="tel:+${r.phone}">${phoneFmt(r.phone)}</a></div>
     <div><label>المدينة</label><div class="val">${esc(r.city)}</div></div>
     <div><label>المهنة المطلوبة</label><div class="val">${esc(r.role)}</div></div>
     <div><label>الجنسية</label><div class="val">${esc(r.nationality)}</div></div></div>
   <div class="d-sec"><label>ملاحظات العميل والفريق</label><textarea id="notes" rows="3">${esc(r.notes)}</textarea><button class="btn sm ghost" data-savenotes>حفظ الملاحظات</button></div>
   <div class="d-sec"><label>رد عبر واتساب</label>
     <div class="tpl">${TEMPLATES.map((t,i)=>`<button class="chip ${i===0?'on':''}" data-tpl="${i}">${t.t}</button>`).join('')}</div>
     <textarea id="msg" rows="5">${esc(first)}</textarea>
     <label class="chk"><input type="checkbox" id="bump" ${r.status==='new'||r.status==='review'?'checked':''}> حدّث الحالة إلى "تم التواصل" بعد الإرسال</label>
     <a class="btn wa-btn" id="send" target="_blank" rel="noopener" href="${wa(first)}">فتح واتساب وإرسال</a></div>
   <div class="d-sec"><label>سجل الحالات</label><ol class="tl">${[...r.history].reverse().map(h=>`<li><span class="dot" style="--c:${STATUSES[h.status].color}"></span><b>${STATUSES[h.status].ar}</b><small>${fmtDate(h.at)} ${fmtTime(h.at)} · ${esc(h.by||'')}</small></li>`).join('')}</ol>
     ${(r.messages||[]).length?`<label style="margin-top:14px">رسائل أُرسلت</label>${r.messages.map(m=>`<div class="sent"><small>${fmtDate(m.at)} ${fmtTime(m.at)}</small>${esc(m.text)}</div>`).join('')}`:''}</div>
   <div class="d-sec"><label>كل طلبات هذا العميل (${others.length+1})</label>
     <div class="mini-list">${[r,...others].map(o=>`<button class="mini ${o.id===r.id?'cur':''}" data-id="${o.id}"><b>${esc(o.id)}</b> ${esc(o.role)}<span>${fmtDate(o.createdAt)}</span>${badge(o.status)}</button>`).join('')}</div></div>`;
  if(keep){const y=$('#drawer-in').scrollTop;$('#drawer-in').innerHTML=html;$('#drawer-in').scrollTop=y}else openDrawer(html);
  const msg=$('#msg'),send=$('#send');
  const sync=()=>{send.href=wa(msg.value)};msg.oninput=sync;
  document.querySelectorAll('[data-tpl]').forEach(b=>b.onclick=()=>{document.querySelectorAll('[data-tpl]').forEach(x=>x.classList.remove('on'));b.classList.add('on');msg.value=TEMPLATES[b.dataset.tpl].f(r);sync()});
  send.onclick=async()=>{const patch={message:msg.value};if($('#bump').checked&&['new','review'].includes(r.status))patch.status='contacted';await updateRequest(r.id,patch,r);toast('تم تسجيل الرسالة');await refresh();};
}
function openClient(phone){
  const c=clientsOf(ALL).find(x=>x.phone===phone);if(!c)return;
  openDrawer(`<div class="d-head"><button class="x" data-close>✕</button><div class="d-id"><span class="av lg">${esc(initials(c.name))}</span><div><h2>${esc(c.name)}</h2><small dir="ltr" style="text-align:right">${phoneFmt(c.phone)} · ${esc(c.city)}</small></div></div></div>
   <div class="d-sec"><label>كل الطلبات (${c.orders.length})</label><div class="mini-list">${c.orders.map(o=>`<button class="mini" data-id="${o.id}"><b>${esc(o.id)}</b> ${esc(o.role)}<span>${fmtDate(o.createdAt)}</span>${badge(o.status)}</button>`).join('')}</div></div>
   <div class="d-sec"><a class="btn wa-btn" target="_blank" rel="noopener" href="https://wa.me/${c.phone}">فتح محادثة واتساب</a></div>`);
}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');setTimeout(()=>e.classList.remove('on'),2200)}
function exportCsv(){
  const rows=[['id','name','phone','city','role','nationality','status','createdAt','notes'],...filtered().map(r=>[r.id,r.name,r.phone,r.city,r.role,r.nationality,STATUSES[r.status].ar,r.createdAt,r.notes])];
  const csv='\ufeff'+rows.map(r=>r.map(v=>'"'+String(v??'').replace(/"/g,'""')+'"').join(',')).join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download='requests.csv';a.click();
}

document.addEventListener('click',async e=>{
  const t=e.target.closest('button,a');if(!t)return;
  if(t.dataset.view){view=t.dataset.view;filter='all';closeDrawer();$('#side').classList.remove('open');render();return}
  if(t.dataset.f){filter=t.dataset.f;render();return}
  if(t.dataset.id){openRequest(t.dataset.id);return}
  if(t.dataset.client){openClient(t.dataset.client);return}
  if('close' in t.dataset){closeDrawer();return}
  if(t.dataset.set&&openId){const r=ALL.find(x=>x.id===openId);await updateRequest(openId,{status:t.dataset.set},r);toast('تم تحديث الحالة');await refresh();return}
  if('savenotes' in t.dataset&&openId){const r=ALL.find(x=>x.id===openId);await updateRequest(openId,{notes:$('#notes').value},r);toast('تم حفظ الملاحظات');await refresh();return}
});
$('#scrim').onclick=closeDrawer;
$('#q').oninput=e=>{query=e.target.value;render()};
$('#export').onclick=exportCsv;
$('#burger').onclick=()=>$('#side').classList.toggle('open');
$('#reset').onclick=()=>{if(confirm('إعادة ضبط البيانات التجريبية؟')){resetDemo();refresh();closeDrawer()}};
addEventListener('keydown',e=>{if(e.key==='Escape')closeDrawer()});
refresh().then(()=>{const h=decodeURIComponent(location.hash.slice(1));
  if(['clients','board'].includes(h)){view=h;render()}
  else if(h.startsWith('FW-'))openRequest(h);
  else if(h.startsWith('c')&&/^c\d+$/.test(h))openClient(h.slice(1));});
