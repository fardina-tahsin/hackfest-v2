// Batch management module
import { el, DB_KEYS, read, write } from './utils.js';
import { getSessionUser } from './user.js';
import { maybeAward } from './achievements.js';

export function renderBatches(userId) {
  const list = read(DB_KEYS.BATCHES).filter(b => b.userId === userId && b.status === 'active');
  const completed = read(DB_KEYS.BATCHES).filter(b => b.userId === userId && b.status !== 'active');
  const container = el('activeBatches');
  const container2 = el('completedBatches');

  if (container) {
    container.innerHTML = '';
    if (list.length === 0) {
      container.innerHTML = '<div class="small">No active batches</div>';
    }
    list.forEach(b => {
      const div = document.createElement('div');
      div.className = 'farm-item';
      div.innerHTML = `<div>
        <div style="font-weight:700">${b.cropType} · ${b.weight}kg</div>
        <div class="small">${b.location} · ${b.storageType}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
        <button class="btn-lite" data-action="risk" data-id="${b.id}">Simulate Risk</button>
        <button class="btn" data-action="complete" data-id="${b.id}">Mark Complete</button>
      </div>`;
      container.appendChild(div);
    });
  }

  if (container2) {
    container2.innerHTML = '';
    if (completed.length === 0) {
      container2.innerHTML = '<div class="small">No history</div>';
    }
    completed.forEach(b => {
      const div = document.createElement('div');
      div.className = 'farm-item';
      div.innerHTML = `<div>
        <div style="font-weight:700">${b.cropType} · ${b.weight}kg</div>
        <div class="small">${b.location} · ${b.storageType} · ${b.status}</div>
      </div>
      <div><div class="small">${new Date(b.loggedAt).toLocaleString()}</div></div>`;
      container2.appendChild(div);
    });
  }
}

function simulateRisk(batchId) {
  const batches = read(DB_KEYS.BATCHES);
  const b = batches.find(x => x.id === batchId);
  if (!b) return;

  b.risk = { level: 'high', reason: 'moisture', noticeAt: new Date().toISOString() };
  write(DB_KEYS.BATCHES, batches);

  const q = read(DB_KEYS.SYNCQ);
  q.push({ action: 'warning', payload: { batchId, type: 'moisture' } });
  write(DB_KEYS.SYNCQ, q);

  if (confirm('⚠️ Risk detected: Moisture. Take action now?')) {
    b.status = 'mitigated';
    write(DB_KEYS.BATCHES, batches);
    maybeAward(b.userId, 'Risk Mitigated Expert');
    renderBatches(b.userId);
    alert('Action recorded. Loss avoided (demo).');
  } else {
    b.status = 'lost';
    write(DB_KEYS.BATCHES, batches);
    renderBatches(b.userId);
    alert('Batch marked lost (demo).');
  }
}

function completeBatch(batchId) {
  const batches = read(DB_KEYS.BATCHES);
  const b = batches.find(x => x.id === batchId);
  if (!b) return;
  b.status = 'completed';
  write(DB_KEYS.BATCHES, batches);
  renderBatches(b.userId);
}

function exportAll(userId) {
  const batches = read(DB_KEYS.BATCHES).filter(b => b.userId === userId);
  const users = read(DB_KEYS.USERS).filter(u => u.id === userId);
  const payload = { user: users[0] || null, batches };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'harvestguard_export.json';
  a.click();
  URL.revokeObjectURL(a.href);

  const csvRows = [['id', 'cropType', 'weight', 'harvestDate', 'storageType', 'location', 'status', 'loggedAt']];
  batches.forEach(b => csvRows.push([b.id, b.cropType, b.weight, b.harvestDate, b.storageType, b.location, b.status, b.loggedAt]));
  const csvBlob = new Blob([csvRows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')], { type: 'text/csv' });
  const a2 = document.createElement('a');
  a2.href = URL.createObjectURL(csvBlob);
  a2.download = 'harvestguard_batches.csv';
  a2.click();
  URL.revokeObjectURL(a2.href);
}

export function initBatchHandlers() {
  const addBatchBtn = el('addBatchBtn');
  const cancelBatch = el('cancelBatch');
  const batchForm = el('batchForm');
  const exportBtn = el('exportBtn');
  const demoExportBtn = el('demoExportBtn');

  if (addBatchBtn) {
    addBatchBtn.addEventListener('click', () => {
      const formWrap = el('batchFormWrap');
      if (formWrap) {
        formWrap.style.display = 'block';
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
      }
    });
  }

  if (cancelBatch) {
    cancelBatch.addEventListener('click', () => {
      const formWrap = el('batchFormWrap');
      if (formWrap) formWrap.style.display = 'none';
    });
  }

  if (batchForm) {
    batchForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const user = getSessionUser();
      if (!user) {
        alert('Please register first');
        return;
      }

      const batch = {
        id: 'b_' + Date.now(),
        userId: user.id,
        cropType: el('cropType')?.value,
        weight: parseFloat(el('weight')?.value || '0'),
        harvestDate: el('harvestDate')?.value,
        storageType: el('storageType')?.value,
        location: el('locationSelect')?.value,
        status: 'active',
        loggedAt: new Date().toISOString()
      };

      const batches = read(DB_KEYS.BATCHES);
      batches.push(batch);
      write(DB_KEYS.BATCHES, batches);

      const q = read(DB_KEYS.SYNCQ);
      q.push({ action: 'create_batch', payload: batch });
      write(DB_KEYS.SYNCQ, q);

      maybeAward(user.id, 'First Harvest Logged');
      batchForm.reset();
      const formWrap = el('batchFormWrap');
      if (formWrap) formWrap.style.display = 'none';
      renderBatches(user.id);
      alert('Batch saved locally (offline-ready).');
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const user = getSessionUser();
      if (!user) {
        alert('Please register');
        return;
      }
      exportAll(user.id);
    });
  }

  if (demoExportBtn) {
    demoExportBtn.addEventListener('click', () => {
      const all = {
        users: read(DB_KEYS.USERS),
        batches: read(DB_KEYS.BATCHES),
        syncq: read(DB_KEYS.SYNCQ),
        ach: read(DB_KEYS.ACH)
      };
      const blob = new Blob([JSON.stringify(all, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'harvestguard_all.json';
      a.click();
      alert('Exported demo JSON.');
    });
  }

  document.addEventListener('click', (e) => {
    const target = e.target;
    if (target.dataset?.action === 'risk') {
      simulateRisk(target.dataset.id);
    } else if (target.dataset?.action === 'complete') {
      completeBatch(target.dataset.id);
    }
  });
}
