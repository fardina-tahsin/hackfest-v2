// User management module
import { el, DB_KEYS, read, write } from './utils.js';
import { auth, emailSignup } from '../../auth/auth.js';

// Current Firebase user reference
let currentFirebaseUser = null;

// Forward declarations for functions from other modules (to avoid circular deps)
let renderBatchesFn = null;
let renderAchievementsFn = null;

export function setRenderFunctions(batchFn, achFn) {
  renderBatchesFn = batchFn;
  renderAchievementsFn = achFn;
}

export function initUser(firebaseUser) {
  currentFirebaseUser = firebaseUser;
  if (firebaseUser) {
    const sessionData = {
      odId: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName
    };
    localStorage.setItem(DB_KEYS.SESS, JSON.stringify(sessionData));
  }
}

export function getSessionUser() {
  if (currentFirebaseUser) {
    return {
      id: currentFirebaseUser.uid,
      name: currentFirebaseUser.displayName || currentFirebaseUser.email,
      email: currentFirebaseUser.email,
      pref: localStorage.getItem('lang') || 'en'
    };
  }

  const s = JSON.parse(localStorage.getItem(DB_KEYS.SESS) || 'null');
  if (!s) return null;

  if (s.odId) {
    return {
      id: s.odId,
      name: s.displayName || s.email,
      email: s.email,
      pref: localStorage.getItem('lang') || 'en'
    };
  }

  const users = read(DB_KEYS.USERS);
  return users.find(u => u.id === s.userId) || null;
}


export function showDashboard() {
  const user = getSessionUser();
  if (!user) return;

  const dashboard = el('dashboard');
  const dashSub = el('dashSub');

  if (dashboard) dashboard.style.display = 'block';
  if (dashSub) {
    dashSub.innerText = (user.pref === 'bn' ? 'স্বাগতম' : 'Welcome back') + ' · ' + user.name;
  }

  if (renderBatchesFn) renderBatchesFn(user.id);
  if (renderAchievementsFn) renderAchievementsFn(user.id);
}

function initRegisterForm() {
  const registerForm = el('registerForm');
  if (!registerForm) return;

  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = el('rname')?.value.trim();
    const phone = el('rphone')?.value.trim();
    const email = el('remail')?.value.trim();
    const pass = el('rpass')?.value;
    const pref = el('prefLang')?.value || 'en';
    const msgEl = el('registerMsg');

    if (!name || !phone || !pass) {
      if (msgEl) msgEl.innerText = 'Please fill required fields';
      return;
    }

    if (email) {
      const result = await emailSignup(email, pass);
      if (result.success) {
        if (msgEl) msgEl.innerText = 'Registered ✔';
        localStorage.setItem('lang', pref);
        setTimeout(() => showDashboard(), 600);
        return;
      } else {
        if (msgEl) msgEl.innerText = result.error || 'Registration failed';
        return;
      }
    }

    const users = read(DB_KEYS.USERS);
    if (users.find(u => u.phone === phone)) {
      if (msgEl) msgEl.innerText = 'User exists (phone)';
      return;
    }

    let hash = pass;
    if (typeof bcrypt !== 'undefined') {
      const salt = bcrypt.genSaltSync(10);
      hash = bcrypt.hashSync(pass, salt);
    }

    const user = {
      id: 'u_' + Date.now(),
      name,
      phone,
      email,
      passHash: hash,
      pref,
      createdAt: new Date().toISOString()
    };
    users.push(user);
    write(DB_KEYS.USERS, users);

    localStorage.setItem(DB_KEYS.SESS, JSON.stringify({ userId: user.id }));
    if (msgEl) msgEl.innerText = 'Registered ✔';
    setTimeout(() => showDashboard(), 600);
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRegisterForm);
} else {
  initRegisterForm();
}
