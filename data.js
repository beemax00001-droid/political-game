window.RepublicData=(()=>{"use strict";
const countries=[
{id:"aurora",name:"آرورا",desc:"اقتصاد متعادل و دیپلماسی قوی.",effects:{economy:5,relations:4}},
{id:"veloria",name:"ولوریا",desc:"بازار پرپول و محبوبیت سیاسی.",effects:{money:120,popularity:3}},
{id:"nordica",name:"نوردیکا",desc:"شبکه انرژی پایدار و ثبات بالا.",effects:{energy:8,stability:3}},
{id:"solaria",name:"سولاریا",desc:"انرژی فراوان و بازار رو به رشد.",effects:{energy:10,economy:3}},
{id:"meridia",name:"مریدیا",desc:"تجارت قوی و ذخایر نقدی.",effects:{money:80,economy:4}},
{id:"montara",name:"مونتارا",desc:"کوهستانی، منظم و باثبات.",effects:{stability:7,relations:3}},
{id:"pacifica",name:"پاسیفیکا",desc:"تجاری و محبوب در جهان.",effects:{money:100,relations:5}},
{id:"eastara",name:"ایستارا",desc:"رسانه‌های پرقدرت و جامعه فعال.",effects:{popularity:6,economy:2}},
{id:"novara",name:"نووارا",desc:"شبکه دیپلماتیک گسترده.",effects:{relations:8,popularity:2}},
{id:"federalis",name:"فدرالیس",desc:"صنعت قوی و دولت مرکزی.",effects:{economy:6,stability:2}}
];
const geographies=[
{id:"capital",name:"پایتخت",effects:{stability:4,popularity:2}},
{id:"coast",name:"ساحلی",effects:{money:50,relations:3}},
{id:"mountain",name:"کوهستانی",effects:{stability:5,economy:-2}},
{id:"desert",name:"بیابانی",effects:{energy:-3,economy:2}},
{id:"forest",name:"جنگلی",effects:{stability:2,economy:3}},
{id:"industrial",name:"صنعتی",effects:{economy:7,energy:-4}},
{id:"agriculture",name:"کشاورزی",effects:{economy:3,popularity:3}},
{id:"border",name:"مرزی",effects:{relations:-2,stability:-2}}
];
const templates=[
["بودجه در آستانه بحران","وزارت دارایی می‌گوید منابع کافی برای همه وعده‌ها وجود ندارد.",["کاهش هزینه‌ها","مالیات موقت","استقراض ملی"],[{economy:-2,stability:2},{money:80,popularity:-3},{money:150,sanctions:1}]],
["طوفان رسانه‌ای","یک موج خبری درباره عملکرد دولت شکل گرفته است.",["پاسخ شفاف","سکوت","کمیته حقیقت"],[{popularity:5,mediaNoise:-3},{popularity:-5,tension:2},{stability:2,bureaucracy:2}]],
["اختلال انرژی","شبکه انرژی با کمبود کوتاه‌مدت روبه‌رو شده است.",["سهمیه‌بندی","خرید فوری","سرمایه‌گذاری"],[{energy:5,popularity:-2},{money:-70,energy:10},{money:-50,energy:15,economy:3}]],
["پیشنهاد تجاری","یک شریک خارجی قرارداد اقتصادی جذابی پیشنهاد کرده است.",["قبول سریع","مذاکره سخت","رد قرارداد"],[{economy:5,relations:3},{money:70,economy:3},{reputation:2,relations:-3}]],
["شایعه عجیب","شایعه‌ای غیرعادی درباره دفتر ریاست جمهوری منتشر شده است.",["تکذیب رسمی","بررسی محرمانه","شوخی با شایعه"],[{mediaNoise:-2,reputation:2},{stability:2,mediaNoise:-4},{popularity:6,reputation:-1}]],
["فشار پارلمان","نمایندگان خواهان تغییر در یک برنامه مهم دولت هستند.",["سازش","مقابله سیاسی","رأی‌گیری عمومی"],[{parliament:3,stability:2},{parliament:-4,popularity:3},{popularity:5,tension:2}]],
["تنش مرزی","گزارش‌هایی از افزایش تنش دیپلماتیک منطقه می‌رسد.",["گفت‌وگو","افزایش آمادگی","میانجی‌گری"],[{relations:5,tension:-5},{stability:2,tension:4},{relations:8,reputation:2}]],
["گرانی کالا","قیمت چند کالای مهم افزایش پیدا کرده است.",["یارانه","آزادسازی بازار","کنترل موقت"],[{money:-80,popularity:5,inflation:-3},{economy:4,popularity:-4,inflation:2},{popularity:2,inflation:-2}]],
["اعتصاب اداری","بخشی از کارکنان دولت خواهان اصلاح شرایط کاری هستند.",["مذاکره","افزایش بودجه","تغییر مدیریت"],[{stability:3,bureaucracy:-2},{money:-60,popularity:3},{bureaucracy:-4,stability:-2}]],
["دستاورد علمی","دانشمندان کشور به دستاورد مهمی رسیده‌اند.",["سرمایه‌گذاری","اعلام عمومی","تجاری‌سازی"],[{money:-40,economy:7},{popularity:5,reputation:3},{money:80,economy:5}]],
["بحران اعتماد","اعتماد عمومی به یکی از نهادهای اصلی کاهش یافته است.",["شفافیت","اصلاح نهاد","کمپین رسانه‌ای"],[{reputation:5,stability:2},{bureaucracy:-4,reputation:4},{money:-30,popularity:6,mediaNoise:3}]],
["فشار بازار","شاخص بازار جهانی علیه اقتصاد کشور حرکت کرده است.",["حمایت اضطراری","اصلاحات","صبر"],[{money:-80,economy:3},{economy:7,popularity:-2},{money:20,economy:-2}]],
["فرصت فرهنگی","یک جشنواره جهانی توجه زیادی به کشور شما جلب کرده است.",["سرمایه‌گذاری فرهنگی","تبلیغ گسترده","تمرکز بر اقتصاد"],[{money:-30,reputation:6},{money:-60,popularity:8},{economy:4,reputation:2}]],
["بحران آب","مصرف منابع آب از حد معمول بالاتر رفته است.",["سهمیه","زیرساخت","کمک به شهرها"],[{popularity:-2,stability:3},{money:-90,economy:5},{money:-70,popularity:5}]],
["افشای اسناد","اسنادی درباره یک تصمیم قدیمی منتشر شده است.",["تحقیق مستقل","تکذیب","پذیرش مسئولیت"],[{reputation:4,stability:2},{popularity:-5,mediaNoise:4},{popularity:3,reputation:7}]]
];
const absurd=[
["وزارتخانه گم شد","یکی از ساختمان‌های اداری برای چند ساعت پیدا نمی‌شود.",["جست‌وجو","ساختمان جدید","وانمود کن"],[{bureaucracy:-3,stability:2},{money:-30,bureaucracy:2},{popularity:4,reputation:-2}]],
["جلسه با صندلی خالی","یک صندلی خالی در کابینه به موضوع اصلی جلسه تبدیل شده است.",["جلسه را ادامه بده","صندلی را عوض کن","رأی‌گیری درباره صندلی"],[{stability:2},{mediaNoise:2,popularity:2},{reputation:5,parliament:1}]],
["پیش‌بینی هوا توسط اقتصاددان","یک مقام ادعا می‌کند می‌تواند آب‌وهوا را با نمودار اقتصادی پیش‌بینی کند.",["آزمایش علمی","رد ادعا","پخش زنده"],[{reputation:3},{stability:1},{popularity:6,mediaNoise:3}]],
["پرونده اشتباهی","دستور جلسه به اشتباه به یک مسابقه آشپزی تبدیل شده است.",["اصلاح فوری","ادامه جلسه","تبدیل به رویداد ملی"],[{bureaucracy:-2,stability:2},{popularity:3,bureaucracy:1},{popularity:7,money:-30}]]
];
const special={
10:["ده مرحله گذشت","دولت هنوز پابرجاست؛ کابینه نیازمند یک تصمیم بزرگ است.",["بازسازی کابینه","تمرکز بیشتر","جشن ملی"],[{stability:5,bureaucracy:-4},{parliament:-5,reputation:3},{popularity:8,money:-50}]],
20:["نقطه عطف","اقتصاد و افکار عمومی وارد مرحله تازه‌ای شده‌اند.",["اصلاح اقتصادی","کمک عمومی","ائتلاف سیاسی"],[{economy:8,popularity:-2},{money:-100,popularity:7},{relations:6,parliament:4}]],
30:["بحران جهانی","بازارهای جهان ناآرام شده‌اند و همه منتظر تصمیم شما هستند.",["همکاری جهانی","حفاظت از بازار","بی‌طرفی"],[{relations:10,tension:-8},{economy:6,inflation:3},{reputation:4,relations:2}]],
40:["لحظه تاریخ","رسانه‌ها عملکرد دولت را تاریخ‌ساز می‌دانند.",["شفافیت کامل","کمپین بزرگ","اصلاح ساختاری"],[{reputation:8,mediaNoise:-5},{popularity:10,money:-120},{stability:6,popularity:-3}]],
50:["روز میراث","آخرین تصمیم دوره ریاست جمهوری فرا رسیده است.",["میراث اقتصادی","میراث اجتماعی","میراث دیپلماتیک"],[{economy:10,money:100},{popularity:10,stability:4},{relations:12,reputation:10}]]
};
const news=["خبر فوری: بازارهای جهانی به تصمیم دولت واکنش نشان دادند.","تحلیل‌گران: رئیس‌جمهور با یک تصمیم غیرمنتظره روبه‌روست.","خبر فوری: جلسه کابینه تا اطلاع ثانوی ادامه دارد.","شبکه‌های خبری جهان، تصمیم جدید دولت را بررسی می‌کنند.","گزارش ویژه: جهان منتظر مرحله بعدی است."];
function mk(x,id,rarity="NORMAL"){return{id,title:x[0],description:x[1],rarity,choices:x[2].map((t,i)=>({title:t,text:"این تصمیم روی وضعیت جمهوری و جهان اثر می‌گذارد.",effects:x[3][i]||{}}))}}
function random(){let use=Math.random()<.16?absurd:templates;let x=use[Math.floor(Math.random()*use.length)];return mk(x,Math.random().toString(36).slice(2),"ABSURD"===use[0][0]?"ABSURD":"NORMAL")}
function specialEvent(n){return special[n]?mk(special[n],"special-"+n,"LEGENDARY"):null}
function ending(score){if(score>=230)return["معمار آینده","اقتصاد، اعتبار و ثبات در سطحی کم‌نظیر باقی ماندند."];if(score>=170)return["رئیس‌جمهور تاریخ‌ساز","تصمیم‌های شما اثر عمیقی بر جمهوری گذاشت."];if(score>=110)return["بازمانده بزرگ","با وجود بحران‌های فراوان، جمهوری را تا پایان نگه داشتید."];return["دوره‌ای پرآشوب","این دوره پایان یافت؛ تاریخ درباره تصمیم‌هایتان قضاوت خواهد کرد."]}
return{countries,geographies,random,specialEvent,news,ending};
})();