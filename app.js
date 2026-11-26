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
  window.open('https://wa.me/'+WA_NUMBER+'?text='+encodeURIComponent(t),'_blank');
});
