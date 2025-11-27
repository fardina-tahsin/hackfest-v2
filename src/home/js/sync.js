// Offline sync module
import { DB_KEYS, read } from './utils.js';

async function trySync() {
  const q = read(DB_KEYS.SYNCQ);
  if (!q || q.length === 0) return;

  console.log('Syncing queue (demo)...', q);

  // Demo: simulate sync delay then clear queue
  setTimeout(() => {
    localStorage.setItem(DB_KEYS.SYNCQ, JSON.stringify([]));
    console.log('Sync finished (demo).');
  }, 800);
}

window.addEventListener('load', trySync);
window.addEventListener('online', trySync);
