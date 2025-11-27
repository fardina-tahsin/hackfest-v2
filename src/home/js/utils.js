// Shared utilities
export const el = (id) => document.getElementById(id);

// LocalStorage keys
export const DB_KEYS = {
  USERS: 'hg_users_v1',
  SESS: 'hg_session_v1',
  BATCHES: 'hg_batches_v1',
  SYNCQ: 'hg_syncq_v1',
  ACH: 'hg_ach_v1'
};

// Storage helpers
export function read(key) {
  return JSON.parse(localStorage.getItem(key) || '[]');
}

export function write(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
