/* Demo data for the admin dashboard. Replace with real API (see api.js). */
(function(){
  const day=86400000, now=Date.now();
  const ago=(d,h=0)=>new Date(now-d*day-h*3600000).toISOString();
  const R=(id,name,phone,city,role,nat,status,d,notes,hist,extra={})=>({id,name,phone,city,role,nationality:nat,status,createdAt:ago(d,extra.h||0),notes,history:hist,...extra});
  const H=(...a)=>a.map(([s,d,by])=>({status:s,at:ago(d),by:by||'النظام'}));
  window.FW_DEMO={
    requests:[
      R('FW-1048','عبدالله القحطاني','966550000101','الرياض','عاملة منزلية','الفلبين','new',0,'يحتاج عاملة خبرة في رعاية كبار السن.',H(['new',0]),{h:2}),
      R('FW-1047','نورة العتيبي','966550000102','جدة','مربية أطفال','إندونيسيا','new',0,'لديها طفلان (3 و6 سنوات). تفضل من تتحدث العربية.',H(['new',0]),{h:5}),
      R('FW-1046','فهد الشمري','966550000103','الدمام','سائق خاص','الهند','review',1,'سائق لعائلة، خبرة قيادة في السعودية.',H(['new',1],['review',1,'سارة'])),
      R('FW-1045','منى الدوسري','966550000104','الرياض','طباخة','إثيوبيا','contacted',2,'مطبخ عربي وشرقي، أسرة من 6 أفراد.',H(['new',2],['review',2,'سارة'],['contacted',1,'سارة'])),
      R('FW-1044','سلطان الحربي','966550000105','المدينة المنورة','عاملة منزلية','بنجلاديش','contract',4,'العقد جاهز للتوقيع على مساند.',H(['new',4],['review',4,'خالد'],['contacted',3,'خالد'],['contract',1,'خالد'])),
      R('FW-1043','ريم الغامدي','966550000106','جدة','عاملة منزلية','سريلانكا','contract',5,'تنتظر توثيق العقد.',H(['new',5],['contacted',4,'سارة'],['contract',2,'سارة'])),
      R('FW-1042','عبدالله القحطاني','966550000101','الرياض','سائق خاص','الهند','done',16,'تم الاستقدام وتسليم السائق.',H(['new',16],['review',15,'خالد'],['contacted',14,'خالد'],['contract',11,'خالد'],['done',2,'خالد'])),
      R('FW-1041','هند المطيري','966550000107','الخبر','مربية أطفال','كينيا','done',21,'وصلت العاملة وتم الاستلام.',H(['new',21],['contacted',20,'سارة'],['contract',16,'سارة'],['done',4,'سارة'])),
      R('FW-1040','ماجد الزهراني','966550000108','أبها','عاملة منزلية','أوغندا','cancelled',9,'ألغى الطلب لتغير الخطة.',H(['new',9],['contacted',8,'خالد'],['cancelled',6,'خالد'])),
      R('FW-1039','لمى السبيعي','966550000109','الرياض','عاملة منزلية','تايلاند','review',2,'تسأل عن مدة الوصول والتكلفة.',H(['new',2],['review',1,'سارة'])),
      R('FW-1038','نورة العتيبي','966550000102','جدة','عاملة منزلية','الفلبين','done',32,'استقدام سابق مكتمل.',H(['new',32],['contacted',31,'خالد'],['contract',26,'خالد'],['done',8,'خالد'])),
      R('FW-1037','يوسف البقمي','966550000110','تبوك','طباخة','سيراليون','contacted',3,'ينتظر رد العميل على السير الذاتية.',H(['new',3],['review',3,'خالد'],['contacted',2,'خالد'])),
      R('FW-1036','سارة الشهري','966550000111','الطائف','مربية أطفال','الفلبين','new',1,'مولود جديد، تحتاج مربية متمرسة.',H(['new',1]),{h:6}),
      R('FW-1035','ريم الغامدي','966550000106','جدة','طباخة','إثيوبيا','done',40,'استقدام سابق مكتمل.',H(['new',40],['contacted',39,'سارة'],['contract',33,'سارة'],['done',12,'سارة']))
    ]
  };
  /* ---- Extended demo fields (ALL FAKE: IDs, passports, addresses, contract numbers). ----
     Real national IDs / passports / addresses must never live in static files or the repo.
     They belong in the server database behind auth (see api.js). */
  const D=window.FW_DEMO;
  D.clients={
   '966550000101':{nationalId:'1000000101',nationality:'سعودي',dob:'1984-03-12',district:'حي الملقا',street:'طريق أنس بن مالك',building:'4521',postal:'13521',city:'الرياض',household:5,children:3,elderly:1,pref:'واتساب'},
   '966550000102':{nationalId:'1000000102',nationality:'سعودية',dob:'1990-07-21',district:'حي الروضة',street:'شارع الأمير سلطان',building:'1180',postal:'23434',city:'جدة',household:4,children:2,elderly:0,pref:'اتصال'},
   '966550000103':{nationalId:'1000000103',nationality:'سعودي',dob:'1979-11-02',district:'حي الشاطئ',street:'طريق الخليج',building:'732',postal:'32413',city:'الدمام',household:6,children:4,elderly:0,pref:'واتساب'},
   '966550000104':{nationalId:'1000000104',nationality:'سعودية',dob:'1988-01-30',district:'حي النرجس',street:'طريق عثمان بن عفان',building:'2260',postal:'13327',city:'الرياض',household:6,children:4,elderly:0,pref:'واتساب'},
   '966550000105':{nationalId:'1000000105',nationality:'سعودي',dob:'1975-05-09',district:'حي العزيزية',street:'طريق سلطانة',building:'315',postal:'42311',city:'المدينة المنورة',household:3,children:0,elderly:2,pref:'اتصال'},
   '966550000106':{nationalId:'1000000106',nationality:'سعودية',dob:'1993-09-17',district:'حي السلامة',street:'شارع فلسطين',building:'905',postal:'23525',city:'جدة',household:3,children:1,elderly:0,pref:'واتساب'},
   '966550000107':{nationalId:'1000000107',nationality:'سعودية',dob:'1991-12-25',district:'حي الراكة',street:'طريق الأمير تركي',building:'1407',postal:'34224',city:'الخبر',household:5,children:3,elderly:0,pref:'واتساب'},
   '966550000108':{nationalId:'1000000108',nationality:'سعودي',dob:'1982-04-14',district:'حي المنهل',street:'شارع الملك فيصل',building:'88',postal:'62521',city:'أبها',household:4,children:2,elderly:0,pref:'اتصال'},
   '966550000109':{nationalId:'1000000109',nationality:'سعودية',dob:'1995-02-06',district:'حي الياسمين',street:'طريق الأمير محمد بن سلمان',building:'3012',postal:'13326',city:'الرياض',household:2,children:0,elderly:0,pref:'واتساب'},
   '966550000110':{nationalId:'1000000110',nationality:'سعودي',dob:'1986-08-19',district:'حي الروضة',street:'شارع الأمير فهد',building:'271',postal:'71491',city:'تبوك',household:5,children:3,elderly:0,pref:'اتصال'},
   '966550000111':{nationalId:'1000000111',nationality:'سعودية',dob:'1994-06-03',district:'حي شهار',street:'شارع الستين',building:'640',postal:'26521',city:'الطائف',household:3,children:1,elderly:0,pref:'واتساب'}
  };
  D.workers=[
   {id:'W-201',name:'Maria Santos',nat:'الفلبين',age:31,gender:'أنثى',marital:'متزوجة',religion:'مسيحية',passport:'P0000201A',passportExp:'2029-05-14',role:'عاملة منزلية',exp:6,gulfExp:true,langs:['الإنجليزية','التاغالوغية','العربية (أساسي)'],skills:['تنظيف','رعاية كبار السن','طبخ بسيط'],salary:1500,agency:'مكتب مانيلا الشريك (تجريبي)',stage:'ready',cv:'cv-maria-santos.pdf'},
   {id:'W-202',name:'Dewi Lestari',nat:'إندونيسيا',age:28,gender:'أنثى',marital:'عزباء',religion:'مسلمة',passport:'P0000202B',passportExp:'2030-02-20',role:'مربية أطفال',exp:4,gulfExp:false,langs:['الإندونيسية','الإنجليزية (أساسي)'],skills:['رعاية أطفال','إسعافات أولية','تنظيم'],salary:1400,agency:'مكتب جاكرتا الشريك (تجريبي)',stage:'ready',cv:'cv-dewi-lestari.pdf'},
   {id:'W-203',name:'Rajesh Kumar',nat:'الهند',age:38,gender:'ذكر',marital:'متزوج',religion:'-',passport:'P0000203C',passportExp:'2028-09-01',role:'سائق خاص',exp:11,gulfExp:true,langs:['الهندية','الإنجليزية','العربية (جيد)'],skills:['رخصة قيادة دولية','صيانة بسيطة'],salary:1800,agency:'مكتب دلهي الشريك (تجريبي)',stage:'selected',cv:'cv-rajesh-kumar.pdf'},
   {id:'W-204',name:'Hanna Tesfaye',nat:'إثيوبيا',age:29,gender:'أنثى',marital:'عزباء',religion:'-',passport:'P0000204D',passportExp:'2029-11-30',role:'طباخة',exp:5,gulfExp:true,langs:['الأمهرية','العربية (جيد)'],skills:['مطبخ عربي','مطبخ شرقي','حلويات'],salary:1500,agency:'مكتب أديس أبابا الشريك (تجريبي)',stage:'visa',cv:'cv-hanna-tesfaye.pdf'},
   {id:'W-205',name:'Shirin Akter',nat:'بنجلاديش',age:30,gender:'أنثى',marital:'متزوجة',religion:'مسلمة',passport:'P0000205E',passportExp:'2029-07-08',role:'عاملة منزلية',exp:3,gulfExp:false,langs:['البنغالية','الإنجليزية (أساسي)'],skills:['تنظيف','كي وغسيل'],salary:1300,agency:'مكتب داكا الشريك (تجريبي)',stage:'travel',cv:'cv-shirin-akter.pdf'},
   {id:'W-206',name:'Nilmini Perera',nat:'سريلانكا',age:34,gender:'أنثى',marital:'متزوجة',religion:'-',passport:'P0000206F',passportExp:'2028-12-12',role:'عاملة منزلية',exp:8,gulfExp:true,langs:['السنهالية','الإنجليزية','العربية (أساسي)'],skills:['تنظيف','طبخ','رعاية كبار السن'],salary:1450,agency:'مكتب كولومبو الشريك (تجريبي)',stage:'visa',cv:'cv-nilmini-perera.pdf'},
   {id:'W-207',name:'Suresh Nair',nat:'الهند',age:41,gender:'ذكر',marital:'متزوج',religion:'-',passport:'P0000207G',passportExp:'2027-10-19',role:'سائق خاص',exp:14,gulfExp:true,langs:['الهندية','العربية (جيد)'],skills:['رخصة سعودية','قيادة طويلة'],salary:1900,agency:'مكتب دلهي الشريك (تجريبي)',stage:'arrived',cv:'cv-suresh-nair.pdf'},
   {id:'W-208',name:'Grace Wanjiru',nat:'كينيا',age:27,gender:'أنثى',marital:'عزباء',religion:'مسيحية',passport:'P0000208H',passportExp:'2030-04-03',role:'مربية أطفال',exp:5,gulfExp:true,langs:['السواحيلية','الإنجليزية'],skills:['رعاية أطفال','مساعدة دراسية'],salary:1350,agency:'مكتب نيروبي الشريك (تجريبي)',stage:'arrived',cv:'cv-grace-wanjiru.pdf'},
   {id:'W-209',name:'Joy Nakato',nat:'أوغندا',age:26,gender:'أنثى',marital:'عزباء',religion:'مسيحية',passport:'P0000209J',passportExp:'2030-08-15',role:'عاملة منزلية',exp:2,gulfExp:false,langs:['الإنجليزية','اللوغندية'],skills:['تنظيف','طبخ بسيط'],salary:1250,agency:'مكتب كمبالا الشريك (تجريبي)',stage:'ready',cv:'cv-joy-nakato.pdf'},
   {id:'W-210',name:'Siti Rahma',nat:'تايلاند',age:33,gender:'أنثى',marital:'متزوجة',religion:'مسلمة',passport:'P0000210K',passportExp:'2029-01-27',role:'عاملة منزلية',exp:7,gulfExp:true,langs:['التايلاندية','الإنجليزية'],skills:['تنظيف','طبخ آسيوي'],salary:1550,agency:'مكتب بانكوك الشريك (تجريبي)',stage:'ready',cv:'cv-siti-rahma.pdf'},
   {id:'W-211',name:'Aminata Kamara',nat:'سيراليون',age:29,gender:'أنثى',marital:'عزباء',religion:'مسلمة',passport:'P0000211L',passportExp:'2030-03-09',role:'طباخة',exp:4,gulfExp:false,langs:['الإنجليزية','الكريو'],skills:['طبخ','تنظيم مطبخ'],salary:1300,agency:'مكتب فريتاون الشريك (تجريبي)',stage:'selected',cv:'cv-aminata-kamara.pdf'}
  ];
  /* request -> assigned worker + request details */
  const X={
   'FW-1048':{w:null,ct:'استقدام جديد',sal:1500,dur:24,age:'25-40',exp:'3+ سنوات',lang:'إنجليزي أو عربي',start:14,off:true,fee:null,paid:'لم يُدفع',staff:'سارة'},
   'FW-1047':{w:null,ct:'استقدام جديد',sal:1400,dur:24,age:'25-35',exp:'خبرة أطفال',lang:'عربي مفضل',start:21,off:true,fee:null,paid:'لم يُدفع',staff:'سارة'},
   'FW-1046':{w:'W-203',ct:'استقدام جديد',sal:1800,dur:24,age:'30-45',exp:'قيادة في السعودية',lang:'عربي',start:30,off:false,fee:16900,paid:'لم يُدفع',staff:'سارة'},
   'FW-1045':{w:'W-204',ct:'استقدام جديد',sal:1500,dur:24,age:'25-40',exp:'مطبخ عربي',lang:'عربي',start:25,off:true,fee:15400,paid:'دفعة أولى',staff:'سارة'},
   'FW-1044':{w:'W-205',ct:'استقدام جديد',sal:1300,dur:24,age:'25-38',exp:'أي',lang:'أي',start:20,off:true,fee:14200,paid:'دفعة أولى',staff:'خالد',musaned:'MSN-DEMO-44001',visa:'VISA-DEMO-8841',flight:6},
   'FW-1043':{w:'W-206',ct:'استقدام جديد',sal:1450,dur:24,age:'28-40',exp:'3+ سنوات',lang:'إنجليزي',start:18,off:true,fee:14900,paid:'دفعة أولى',staff:'سارة',musaned:'MSN-DEMO-43002',visa:'VISA-DEMO-8790',flight:9},
   'FW-1042':{w:'W-207',ct:'استقدام جديد',sal:1900,dur:24,age:'35-45',exp:'10+ سنوات',lang:'عربي',start:-2,off:false,fee:17500,paid:'مدفوع بالكامل',staff:'خالد',musaned:'MSN-DEMO-42003',visa:'VISA-DEMO-8602',flight:-2},
   'FW-1041':{w:'W-208',ct:'استقدام جديد',sal:1350,dur:24,age:'25-35',exp:'رعاية أطفال',lang:'إنجليزي',start:-4,off:true,fee:15200,paid:'مدفوع بالكامل',staff:'سارة',musaned:'MSN-DEMO-41004',visa:'VISA-DEMO-8555',flight:-4},
   'FW-1040':{w:null,ct:'استقدام جديد',sal:1250,dur:24,age:'25-40',exp:'أي',lang:'أي',start:30,off:true,fee:null,paid:'لا شيء',staff:'خالد'},
   'FW-1039':{w:null,ct:'استقدام جديد',sal:1550,dur:24,age:'25-38',exp:'خبرة خليجية',lang:'إنجليزي',start:30,off:true,fee:null,paid:'لم يُدفع',staff:'سارة'},
   'FW-1038':{w:null,ct:'استقدام جديد',sal:1500,dur:24,age:'25-40',exp:'3+ سنوات',lang:'إنجليزي',start:-8,off:true,fee:14800,paid:'مدفوع بالكامل',staff:'خالد',musaned:'MSN-DEMO-38005'},
   'FW-1037':{w:'W-211',ct:'استقدام جديد',sal:1300,dur:24,age:'25-38',exp:'مطبخ',lang:'إنجليزي',start:28,off:true,fee:14600,paid:'لم يُدفع',staff:'خالد'},
   'FW-1036':{w:null,ct:'استقدام جديد',sal:1400,dur:24,age:'28-40',exp:'رعاية مولود',lang:'إنجليزي أو عربي',start:14,off:true,fee:null,paid:'لم يُدفع',staff:'سارة'},
   'FW-1035':{w:null,ct:'استقدام جديد',sal:1500,dur:24,age:'25-40',exp:'مطبخ عربي',lang:'عربي',start:-12,off:true,fee:15000,paid:'مدفوع بالكامل',staff:'سارة',musaned:'MSN-DEMO-35006'}
  };
  const dayIso=n=>new Date(now+n*day).toISOString().slice(0,10);
  D.requests.forEach(r=>{
    const x=X[r.id];if(!x)return;
    r.worker=x.w;r.contractType=x.ct;r.salary=x.sal;r.contractMonths=x.dur;r.prefAge=x.age;r.prefExp=x.exp;r.prefLang=x.lang;
    r.startDate=dayIso(x.start);r.accommodation=x.off?'سكن داخل المنزل':'سكن منفصل';r.fee=x.fee;r.payment=x.paid;r.staff=x.staff;
    r.musanedNo=x.musaned||'';r.visaNo=x.visa||'';r.flightDate=x.flight!=null?dayIso(x.flight):'';
  });
})();
