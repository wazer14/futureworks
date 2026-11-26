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
