/* Data layer for the admin dashboard.
   Today: demo data (data.js) + localStorage for edits + requests sent from the website form (same browser only).
   Later: set API_BASE to a Cloudflare Worker / D1 / Odoo endpoint that implements the same 4 calls:
     GET    {API_BASE}/requests                -> [Request]
     PATCH  {API_BASE}/requests/:id            -> body {status, note?}  -> Request
     POST   {API_BASE}/requests/:id/messages   -> body {text}           (log a sent reply)
     POST   {API_BASE}/requests                -> body {name, phone, role, ...} -> Request
   Request shape: {id,name,phone,city,role,nationality,status,createdAt,notes,history:[{status,at,by}],messages?:[{text,at,by}]} */
const API_BASE=''; // e.g. 'https://api.example.com'
export const STATUSES={
  new:{ar:'جديد',color:'#2563eb'},
  review:{ar:'تحت المراجعة',color:'#b8860b'},
  contacted:{ar:'تم التواصل',color:'#7c3aed'},
  contract:{ar:'توقيع العقد',color:'#0891b2'},
  done:{ar:'مكتمل',color:'#16803c'},
  cancelled:{ar:'ملغي',color:'#8b95a5'}
};
const LS='fw.admin.v1';
const load=()=>{try{return JSON.parse(localStorage.getItem(LS)||'{}')}catch(_){return{}}};
const save=o=>localStorage.setItem(LS,JSON.stringify(o));
export async function listRequests(){
  if(API_BASE){const r=await fetch(API_BASE+'/requests');return r.json()}
  const st=load(),base=(window.FW_DEMO?.requests||[]).map(r=>({...r}));
  let inbox=[];try{inbox=JSON.parse(localStorage.getItem('fw.inbox')||'[]')}catch(_){}
  inbox.forEach((q,i)=>base.unshift({id:'FW-W'+(i+1),name:q.name||'-',phone:String(q.phone||'').replace(/\D/g,''),city:'-',role:q.role||'-',nationality:'-',status:'new',createdAt:q.createdAt,notes:q.notes||'(من نموذج الموقع)',history:[{status:'new',at:q.createdAt,by:'الموقع'}]}));
  return base.map(r=>{const o=st[r.id];return o?{...r,...o}:r}).sort((a,b)=>new Date(b.createdAt)-new Date(a.createdAt));
}
export async function updateRequest(id,patch,req){
  if(API_BASE){const r=await fetch(API_BASE+'/requests/'+id,{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify(patch)});return r.json()}
  const st=load();const cur={...(st[id]||{})};
  const hist=[...(cur.history||req.history||[])];
  if(patch.status&&patch.status!==req.status)hist.push({status:patch.status,at:new Date().toISOString(),by:'أنت'});
  const msgs=[...(cur.messages||req.messages||[])];
  if(patch.message)msgs.push({text:patch.message,at:new Date().toISOString(),by:'أنت'});
  const next={...cur,status:patch.status||req.status,history:hist,messages:msgs,notes:patch.notes??req.notes};
  st[id]=next;save(st);return{...req,...next};
}
export function resetDemo(){localStorage.removeItem(LS);localStorage.removeItem('fw.inbox')}

/* Sensitive reference data (client national ID/address, worker passport). Demo only: fake values from data.js.
   In production these come from the authenticated API (GET /clients, GET /workers), never from static files. */
export async function listClients(){
  if(API_BASE){const r=await fetch(API_BASE+'/clients');return r.json()}
  return window.FW_DEMO?.clients||{};
}
export async function listWorkers(){
  if(API_BASE){const r=await fetch(API_BASE+'/workers');return r.json()}
  return window.FW_DEMO?.workers||[];
}
export const STAGES={ready:{ar:'جاهز للترشيح',color:'#2563eb'},selected:{ar:'تم اختياره',color:'#b8860b'},visa:{ar:'إجراءات التأشيرة',color:'#0891b2'},travel:{ar:'في الطريق',color:'#7c3aed'},arrived:{ar:'وصل وتم التسليم',color:'#16803c'}};
