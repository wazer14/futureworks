// Set your WhatsApp number: international format, digits only (e.g. 9665XXXXXXXX)
const WA_NUMBER='966XXXXXXXXX';
const btn=document.getElementById('lang');
function setLang(l){
  const h=document.documentElement;h.lang=l;h.dir=l==='ar'?'rtl':'ltr';
  document.querySelectorAll('[data-ar]').forEach(e=>e.textContent=e.dataset[l]);
  document.querySelectorAll('[data-ph-ar]').forEach(e=>e.placeholder=e.dataset[l==='ar'?'phAr':'phEn']);
  btn.textContent=l==='ar'?'English':'العربية';
  document.title=l==='ar'?'أعمال المستقبل للاستقدام | Future Works Recruitment':'Future Works Recruitment | أعمال المستقبل';
  localStorage.setItem('lang',l);
}
btn.onclick=()=>setLang(document.documentElement.lang==='ar'?'en':'ar');
setLang(localStorage.getItem('lang')||'ar');


document.querySelectorAll('a[href^="https://wa.me/"]').forEach(x=>x.href='https://wa.me/'+WA_NUMBER);
document.getElementById('reqform').addEventListener('submit',e=>{
  e.preventDefault();
  const v=[...e.target.querySelectorAll('input,select,textarea')].map(x=>x.value.trim());
  const ar=document.documentElement.lang==='ar';
  const t=(ar?'السلام عليكم، أبي أقدم طلب استقدام\nالاسم: ':'Hello, I would like to request a worker\nName: ')+v[0]+(ar?'\nالجوال: ':'\nMobile: ')+v[1]+(ar?'\nالمهنة: ':'\nRole: ')+v[2]+(v[3]?(ar?'\nملاحظات: ':'\nNotes: ')+v[3]:'');
  try{const q=JSON.parse(localStorage.getItem('fw.inbox')||'[]');q.push({name:v[0],phone:v[1],role:v[2],notes:v[3],createdAt:new Date().toISOString()});localStorage.setItem('fw.inbox',JSON.stringify(q));}catch(_){}
  window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(t),'_blank');
});

/* ---------- motion ---------- */
(function(){
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nav=document.querySelector('.nav');
  const onScroll=()=>nav.classList.toggle('scrolled',scrollY>12);
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  const targets=document.querySelectorAll('section h2, .sub, .pcard, .card, .timeline li, .chips span, .why, details, .stat, .stat-note, .contact > *');
  const fmt=n=>n.toLocaleString('en-US');
  function count(el){
    const end=+el.dataset.count;if(reduce){el.textContent=fmt(end);return}
    const t0=performance.now(),d=1600;
    (function step(t){const p=Math.min(1,(t-t0)/d),e=1-Math.pow(1-p,3);el.textContent=fmt(Math.round(end*e));if(p<1)requestAnimationFrame(step)})(t0);
  }
  if(reduce||!('IntersectionObserver' in window)){document.querySelectorAll('.num').forEach(n=>n.textContent=fmt(+n.dataset.count));return}
  document.documentElement.classList.add('js-anim');
  targets.forEach(el=>{el.classList.add('reveal');
    const sibs=[...el.parentElement.children].filter(c=>c.classList.contains('reveal'));
    el.style.setProperty('--d',Math.min(sibs.indexOf(el),8)*80+'ms');});
  const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');
      e.target.querySelectorAll&&e.target.querySelectorAll('.num').forEach(count);
      if(e.target.classList.contains('num'))count(e.target);io.unobserve(e.target)}}),{threshold:.15,rootMargin:'0px 0px -40px 0px'});
  targets.forEach(t=>io.observe(t));
  document.querySelectorAll('.num').forEach(n=>{n.textContent='0'});
})();
