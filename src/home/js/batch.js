// ---------- Batch form toggle ----------
el('addBatchBtn').addEventListener('click', ()=> {
  el('batchFormWrap').style.display='block';
  window.scrollTo({top:document.body.scrollHeight,behavior:'smooth'});
});
el('cancelBatch').addEventListener('click', ()=> el('batchFormWrap').style.display='none');

// ---------- Add batch ----------
el('batchForm').addEventListener('submit',(e)=>{
  e.preventDefault();
  const user = getSessionUser();
  if(!user){alert('Please register first'); return;}

  const batch = {
    id:'b_'+Date.now(),
    userId:user.id,
    cropType:el('cropType').value,
    weight:parseFloat(el('weight').value),
    harvestDate:el('harvestDate').value,
    storageType:el('storageType').value,
    location:el('locationSelect').value,
    status:'active',
    loggedAt:new Date().toISOString()
  };

  const batches = read(DB_KEYS.BATCHES);
  batches.push(batch);
  write(DB_KEYS.BATCHES,batches);

  const q = read(DB_KEYS.SYNCQ);
  q.push({action:'create_batch', payload: batch});
  write(DB_KEYS.SYNCQ,q);

  maybeAward(user.id,'First Harvest Logged');
  el('batchForm').reset();
  el('batchFormWrap').style.display='none';
  renderBatches(user.id);
  alert('Batch saved locally (offline-ready).');
});

// ---------- Render batches ----------
function renderBatches(userId){
  const list = read(DB_KEYS.BATCHES).filter(b=>b.userId===userId && b.status==='active');
  const completed = read(DB_KEYS.BATCHES).filter(b=>b.userId===userId && b.status!=='active');
  const container = el('activeBatches'); container.innerHTML='';
  const container2 = el('completedBatches'); container2.innerHTML='';

  if(list.length===0) container.innerHTML='<div class="small">No active batches</div>';
  list.forEach(b=>{
    const div=document.createElement('div'); div.className='farm-item';
    div.innerHTML=`<div>
      <div style="font-weight:700">${b.cropType} · ${b.weight}kg</div>
      <div class="small">${b.location} · ${b.storageType}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
        <button class="btn-lite" onclick="simulateRisk('${b.id}')">Simulate Risk</button>
        <button class="btn" onclick="completeBatch('${b.id}')">Mark Complete</button>
      </div>`;
    container.appendChild(div);
  });

  if(completed.length===0) container2.innerHTML='<div class="small">No history</div>';
  completed.forEach(b=>{
    const div=document.createElement('div'); div.className='farm-item';
    div.innerHTML=`<div>
      <div style="font-weight:700">${b.cropType} · ${b.weight}kg</div>
      <div class="small">${b.location} · ${b.storageType} · ${b.status}</div>
    </div>
    <div><div class="small">${new Date(b.loggedAt).toLocaleString()}</div></div>`;
    container2.appendChild(div);
  });
}

// ---------- Risk simulation ----------
window.simulateRisk=function(batchId){
  const batches=read(DB_KEYS.BATCHES);
  const b=batches.find(x=>x.id===batchId); if(!b) return;

  b.risk={level:'high', reason:'moisture', noticeAt:new Date().toISOString()};
  write(DB_KEYS.BATCHES,batches);

  const q=read(DB_KEYS.SYNCQ); q.push({action:'warning', payload:{batchId,batchId,type:'moisture'}}); write(DB_KEYS.SYNCQ,q);

  if(confirm('⚠️ Risk detected: Moisture. Take action now?')){
    b.status='mitigated'; write(DB_KEYS.BATCHES,batches); maybeAward(b.userId,'Risk Mitigated Expert'); renderBatches(b.userId);
    alert('Action recorded. Loss avoided (demo).');
  } else {
    b.status='lost'; write(DB_KEYS.BATCHES,batches); renderBatches(b.userId); alert('Batch marked lost (demo).');
  }
};

// ---------- Complete batch ----------
window.completeBatch=function(batchId){
  const batches=read(DB_KEYS.BATCHES);
  const b=batches.find(x=>x.id===batchId); if(!b) return;
  b.status='completed';
  write(DB_KEYS.BATCHES,batches);
  renderBatches(b.userId);
};

// ---------- Export ----------
function exportAll(userId){
  const batches = read(DB_KEYS.BATCHES).filter(b=>b.userId===userId);
  const users = read(DB_KEYS.USERS).filter(u=>u.id===userId);
  const payload = {user: users[0]||null, batches};

  const blob = new Blob([JSON.stringify(payload,null,2)], {type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='harvestguard_export.json'; a.click();
  URL.revokeObjectURL(a.href);

  const csvRows=[['id','cropType','weight','harvestDate','storageType','location','status','loggedAt']];
  batches.forEach(b=> csvRows.push([b.id,b.cropType,b.weight,b.harvestDate,b.storageType,b.location,b.status,b.loggedAt]));
  const csvBlob = new Blob([csvRows.map(r=>r.map(c=>`"${String(c).replace(/"/g,'""')}"`).join(',')).join('\n')], {type:'text/csv'});
  const a2=document.createElement('a'); a2.href=URL.createObjectURL(csvBlob); a2.download='harvestguard_batches.csv'; a2.click();
  URL.revokeObjectURL(a2.href);
}

el('exportBtn').addEventListener('click', ()=>{
  const user=getSessionUser(); if(!user){alert('Please register'); return;}
  exportAll(user.id);
});
el('demoExportBtn').addEventListener('click', ()=>{
  const all={users:read(DB_KEYS.USERS),batches:read(DB_KEYS.BATCHES),syncq:read(DB_KEYS.SYNCQ),ach:read(DB_KEYS.ACH)};
  const blob = new Blob([JSON.stringify(all,null,2)], {type:'application/json'});
  const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='harvestguard_all.json'; a.click();
  alert('Exported demo JSON.');
});
