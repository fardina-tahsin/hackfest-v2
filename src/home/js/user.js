// ---------- LocalStorage helpers ----------
const DB_KEYS = {
  USERS: 'hg_users_v1',
  SESS: 'hg_session_v1',
  BATCHES: 'hg_batches_v1',
  SYNCQ: 'hg_syncq_v1',
  ACH: 'hg_ach_v1'
};

function read(key){ return JSON.parse(localStorage.getItem(key)||'[]'); }
function write(key,data){ localStorage.setItem(key, JSON.stringify(data)); }

// ---------- User registration ----------
const registerForm = el('registerForm');
registerForm.addEventListener('submit', async (e)=>{
  e.preventDefault();
  const name = el('rname').value.trim();
  const phone = el('rphone').value.trim();
  const email = el('remail').value.trim();
  const pass = el('rpass').value;
  const pref = el('prefLang').value||'en';

  if(!name || !phone || !pass){ el('registerMsg').innerText = 'Please fill required fields'; return; }

  const users = read(DB_KEYS.USERS);
  if(users.find(u=>u.phone===phone || (email && u.email===email))){
    el('registerMsg').innerText='User exists (phone/email)';
    return;
  }

  const salt = bcrypt.genSaltSync(10);
  const hash = bcrypt.hashSync(pass, salt);

  const user = {id:'u_'+Date.now(), name, phone, email, passHash:hash, pref, createdAt:new Date().toISOString()};
  users.push(user);
  write(DB_KEYS.USERS, users);

  localStorage.setItem(DB_KEYS.SESS, JSON.stringify({userId:user.id}));
  el('registerMsg').innerText='Registered ✔';
  setTimeout(()=>showDashboard(),600);
});

// ---------- Session ----------
function getSessionUser(){
  const s = JSON.parse(localStorage.getItem(DB_KEYS.SESS)||'null');
  if(!s) return null;
  const users = read(DB_KEYS.USERS);
  return users.find(u=>u.id===s.userId)||null;
}

// ---------- Dashboard ----------
function showDashboard(){
  const user = getSessionUser();
  if(!user) return;
  el('dashboard').style.display='block';
  el('dashSub').innerText = (user.pref==='bn'?'স্বাগতম':'Welcome back')+' · '+user.name;
  renderBatches(user.id);
  renderAchievements(user.id);
}

