const STRINGS = {
  en:{ appTitle:"HarvestGuard", appTag:"Data → Warning → Action → Saved Food", heroTitle:"Protect Harvests. Save Food. Secure Income.",
       pitch:"Bangladesh loses millions of tonnes of staple food each year due to poor storage, handling & transit. HarvestGuard helps farmers monitor batches, get early warnings, and take simple actions that reduce loss.",
       quickTitle:"Quick Register", quickSub:"Register in 30 seconds", labelName:"Name", labelPhone:"Phone",
       labelEmail:"Email", labelPass:"Password", dashTitle:"Profile", dashSub:"Welcome back", impactStat:"Est. national grain loss: 4.5M tonnes / year"},
  bn:{ appTitle:"হারভেস্টগার্ড", appTag:"ডেটা → সতর্কতা → কার্যক্রম → সংরক্ষিত খাদ্য",
       heroTitle:"ফসল রক্ষা করুন। খাদ্য সংরক্ষণ করুন। আয় রক্ষা করুন।",
       pitch:"খারাপ ভাণ্ডার, ত্রুটিপূর্ণ হ্যান্ডলিং ও পরিবহনের কারণে বাংলাদেশে প্রতি বছর লক্ষ টন খাদ্য নষ্ট হয়। HarvestGuard কৃষকদের ব্যাচ পর্যবেক্ষণ, ঝুঁকি সতর্কতা এবং সহজ পদক্ষেপে ক্ষতি কমাতে সাহায্য করে।",
       quickTitle:"দ্রুত নিবন্ধন", quickSub:"৩০ সেকেন্ডে নিবন্ধন", labelName:"নাম", labelPhone:"ফোন",
       labelEmail:"ইমেইল", labelPass:"পাসওয়ার্ড", dashTitle:"প্রোফাইল", dashSub:"শুভ প্রত্যাবর্তন", impactStat:"আনুমানিক জাতীয় শস্য ক্ষতি: ৪.৫M টন / বছর"}
};

let LANG = localStorage.getItem('lang')||'en';
const el = (id)=>document.getElementById(id);

function applyLang(){
  const s = STRINGS[LANG];
  el('appTitle').innerText = s.appTitle;
  el('appTag').innerText = s.appTag;
  el('heroTitle').innerText = s.heroTitle;
  el('pitch').innerText = s.pitch;
  el('quickTitle').innerText = s.quickTitle;
  el('quickSub').innerText = s.quickSub;
  el('labelName').innerText = s.labelName;
  el('labelPhone').innerText = s.labelPhone;
  el('labelEmail').innerText = s.labelEmail;
  el('labelPass').innerText = s.labelPass;
  el('dashTitle').innerText = s.dashTitle;
  el('dashSub').innerText = s.dashSub;
  el('impactStat').innerText = s.impactStat;
  el('langBadge').innerText = LANG.toUpperCase();
  el('toggleLang').innerText = LANG==='en'?'বাংলা':'EN';
}

el('toggleLang').addEventListener('click', ()=>{
  LANG = LANG==='en'?'bn':'en';
  localStorage.setItem('lang', LANG);
  applyLang();
});

function init(){
  applyLang();
  if(getSessionUser()){ showDashboard(); }
}
init();
