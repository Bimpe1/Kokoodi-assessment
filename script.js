/* 
  Author: Adebimpe Adetoba 
  Kokoodi Assessment
*/

const ENDPOINT = ""; 

(function initYears(){
  const y = new Date().getFullYear();
  const sel = document.getElementById('reportYear');
  for(let i=0;i<10;i++){
    const yr = (y - i).toString();
    const opt = document.createElement('option');
    opt.value = yr; opt.textContent = yr;
    sel.appendChild(opt);
  }
})();

// Elements
const chipGroup   = document.getElementById('reportType');
const chips       = Array.from(chipGroup.querySelectorAll('.chip'));
const yearSel     = document.getElementById('reportYear');
const clientInput = document.getElementById('clientId');
const remember    = document.getElementById('remember');
const statusEl    = document.getElementById('status');
const preview     = document.getElementById('preview');
const previewJson = document.getElementById('previewJson');

const err = {
  type: document.getElementById('rt-error'),
  year: document.getElementById('year-error'),
  client: document.getElementById('client-error')
};

let selectedType = null;


function setActiveChip(idx){
  chips.forEach((c,i)=>{
    const isActive = i===idx;
    c.classList.toggle('active', isActive);
    c.setAttribute('aria-checked', String(isActive));
    c.tabIndex = isActive ? 0 : -1;
  });
  chipGroup.dataset.activeIndex = String(idx);
  selectedType = idx>=0 ? chips[idx].dataset.value : null;
  renderPreview(); 
}

chipGroup.addEventListener('click', (e)=>{
  const b = e.target.closest('.chip');
  if(!b) return;
  const idx = chips.indexOf(b);
  setActiveChip(idx);
  chips[idx].focus();
});

chipGroup.addEventListener('keydown', (e)=>{
  const idx = parseInt(chipGroup.dataset.activeIndex, 10);
  const key = e.key;
  if(['ArrowRight','ArrowLeft','Home','End'].includes(key)){
    e.preventDefault();
    let next = idx;
    if(key==='ArrowRight') next = Math.min(idx+1, chips.length-1);
    if(key==='ArrowLeft')  next = Math.max(idx-1, 0);
    if(key==='Home')       next = 0;
    if(key==='End')        next = chips.length-1;
    setActiveChip(next);
    chips[next].focus();
  } else if(key===' ' || key==='Enter'){
    e.preventDefault();
    if(idx>=0){ setActiveChip(idx); }
  }
});

function saveState(){
  if(!remember.checked) return;
  localStorage.setItem('kokoodi.report.state', JSON.stringify({
    reportType: selectedType,
    reportYear: yearSel.value,
    clientId: clientInput.value
  }));
  statusEl.textContent = "Saved";
  statusEl.className = "status ok";
  setTimeout(()=> statusEl.textContent = "", 1200);
}
function loadState(){
  const raw = localStorage.getItem('kokoodi.report.state');
  if(!raw) return;
  try{
    const data = JSON.parse(raw);
    if(data.reportType){
      const idx = chips.findIndex(c=>c.dataset.value===data.reportType);
      if(idx>=0) setActiveChip(idx);
    }
    if(data.reportYear && [...yearSel.options].some(o=>o.value===data.reportYear)){
      yearSel.value = data.reportYear;
    }
    if(data.clientId){ clientInput.value = data.clientId; }
    remember.checked = true;
  }catch{}
}
loadState();

function validate(){
  let ok = true;
  Object.values(err).forEach(e=>{ e.textContent = ''; });

  if(!selectedType){
    err.type.textContent = "Select a report type.";
    ok = false;
  }
  if(!yearSel.value){
    err.year.textContent = "Choose a reporting year.";
    ok = false;
  }
  const c = clientInput.value.trim();
  if(!c || c.length < 2){
    err.client.textContent = "Enter a client name or ID (min 2 chars).";
    ok = false;
  }
  clientInput.setAttribute('aria-invalid', (!c || c.length<2) ? 'true' : 'false');
  return ok;
}

function currentPayload(){
  const y = yearSel.value ? Number(yearSel.value) : null;
  return {
    reportType: selectedType || null,
    reportYear: y,
    clientId: clientInput.value.trim() || null,
    requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  };
}

function renderPreview(){
  const payload = currentPayload();
  previewJson.textContent = JSON.stringify(payload, null, 2);
}
renderPreview();

// Bind live updates
['change','input','keyup'].forEach(evt=>{
  yearSel.addEventListener(evt, ()=>{ validate(); renderPreview(); });
  clientInput.addEventListener(evt, ()=>{ validate(); renderPreview(); });
});
chips.forEach(c=>c.addEventListener('click', ()=>{ validate(); renderPreview(); }));

function prepareAgentRequest(){
  const ok = validate();
  if(!ok){
    statusEl.textContent = "Please fix the highlighted fields.";
    statusEl.className = "status err";
    return null;
  }
  const payload = currentPayload();
  if(remember.checked) saveState();
  return payload;
}

document.getElementById('generate').addEventListener('click', async ()=>{
  const payload = prepareAgentRequest();
  if(!payload) return;

  statusEl.textContent = "Preparing…";
  statusEl.className = "status";

  if(ENDPOINT){
    try{
      const res = await fetch(ENDPOINT, {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GeneratedReport_${payload.clientId || 'Client'}.docx`;
      document.body.appendChild(a); a.click(); a.remove();
      statusEl.textContent = "Report downloaded ✓";
      statusEl.className = "status ok";
    }catch(errAny){
      statusEl.textContent = "Could not reach backend; showing preview only.";
      statusEl.className = "status warn";
    }
  } else {
    statusEl.textContent = "Backend URL not set — preview only.";
    statusEl.className = "status warn";
  }
  setTimeout(()=> statusEl.textContent = "", 2000);
});

window.prepareAgentRequest = prepareAgentRequest;
