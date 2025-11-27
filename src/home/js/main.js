// Main entry point for home page
import { auth } from '../../auth/auth.js';
import { onAuthStateChanged } from 'firebase/auth';
import { initUser, getSessionUser, showDashboard, setRenderFunctions } from './user.js';
import { renderBatches, initBatchHandlers } from './batch.js';
import { renderAchievements } from './achievements.js';
import { el } from './utils.js';
import './sync.js';

// Wire up render functions to avoid circular dependencies
setRenderFunctions(renderBatches, renderAchievements);

const STRINGS = {
  en: {
    appTitle: "HarvestGuard",
    appTag: "Data → Warning → Action → Saved Food",
    heroTitle: "Protect Harvests. Save Food. Secure Income.",
    pitch: "Bangladesh loses millions of tonnes of staple food each year due to poor storage, handling & transit. HarvestGuard helps farmers monitor batches, get early warnings, and take simple actions that reduce loss.",
    quickTitle: "Quick Register",
    quickSub: "Register in 30 seconds",
    labelName: "Name",
    labelPhone: "Phone",
    labelEmail: "Email",
    labelPass: "Password",
    impactStat: "Est. national grain loss: 4.5M tonnes / year"
  },
  bn: {
    appTitle: "হারভেস্টগার্ড",
    appTag: "ডেটা → সতর্কতা → কার্যক্রম → সংরক্ষিত খাদ্য",
    heroTitle: "ফসল রক্ষা করুন। খাদ্য সংরক্ষণ করুন। আয় রক্ষা করুন।",
    pitch: "খারাপ ভাণ্ডার, ত্রুটিপূর্ণ হ্যান্ডলিং ও পরিবহনের কারণে বাংলাদেশে প্রতি বছর লক্ষ টন খাদ্য নষ্ট হয়। HarvestGuard কৃষকদের ব্যাচ পর্যবেক্ষণ, ঝুঁকি সতর্কতা এবং সহজ পদক্ষেপে ক্ষতি কমাতে সাহায্য করে।",
    quickTitle: "দ্রুত নিবন্ধন",
    quickSub: "৩০ সেকেন্ডে নিবন্ধন",
    labelName: "নাম",
    labelPhone: "ফোন",
    labelEmail: "ইমেইল",
    labelPass: "পাসওয়ার্ড",
    impactStat: "আনুমানিক জাতীয় শস্য ক্ষতি: ৪.৫M টন / বছর"
  }
};

let LANG = localStorage.getItem('lang') || 'en';

function applyLang() {
  const s = STRINGS[LANG];
  const elements = {
    appTitle: s.appTitle,
    appTag: s.appTag,
    heroTitle: s.heroTitle,
    pitch: s.pitch,
    quickTitle: s.quickTitle,
    quickSub: s.quickSub,
    labelName: s.labelName,
    labelPhone: s.labelPhone,
    labelEmail: s.labelEmail,
    labelPass: s.labelPass,
    impactStat: s.impactStat
  };

  for (const [id, text] of Object.entries(elements)) {
    const element = el(id);
    if (element) element.innerText = text;
  }

  const langBadge = el('langBadge');
  const toggleLang = el('toggleLang');
  if (langBadge) langBadge.innerText = LANG.toUpperCase();
  if (toggleLang) toggleLang.innerText = LANG === 'en' ? 'বাংলা' : 'EN';
}

function init() {
  applyLang();
  initBatchHandlers();

  const toggleLangBtn = el('toggleLang');
  if (toggleLangBtn) {
    toggleLangBtn.addEventListener('click', () => {
      LANG = LANG === 'en' ? 'bn' : 'en';
      localStorage.setItem('lang', LANG);
      applyLang();
    });
  }

  // Check Firebase auth state
  onAuthStateChanged(auth, (user) => {
    if (user) {
      initUser(user);
      showDashboard();
    } else {
      const localUser = getSessionUser();
      if (localUser) {
        showDashboard();
      }
    }
  });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
