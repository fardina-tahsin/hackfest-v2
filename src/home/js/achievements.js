// Achievements module
import { el, DB_KEYS, read, write } from './utils.js';

export function maybeAward(userId, badgeName) {
  const ach = read(DB_KEYS.ACH) || [];
  let userAch = ach.find(a => a.userId === userId);
  if (!userAch) {
    userAch = { userId, badges: [] };
    ach.push(userAch);
  }
  if (!userAch.badges.includes(badgeName)) {
    userAch.badges.push(badgeName);
    write(DB_KEYS.ACH, ach);
  }
  renderAchievements(userId);
}

export function renderAchievements(userId) {
  const area = el('achievementArea');
  if (!area) return;

  area.innerHTML = '';
  const ach = read(DB_KEYS.ACH).find(a => a.userId === userId);
  if (!ach || ach.badges.length === 0) {
    area.innerHTML = '<div class="small">No badges yet</div>';
    return;
  }

  const wrap = document.createElement('div');
  wrap.style.display = 'flex';
  wrap.style.gap = '8px';
  ach.badges.forEach(b => {
    const tag = document.createElement('div');
    tag.className = 'badge';
    tag.innerText = b;
    wrap.appendChild(tag);
  });
  area.appendChild(wrap);
}
