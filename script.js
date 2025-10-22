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

const chipContainer = document.getElementById('reportType');
let selectedType = null;
chipContainer.addEventListener('click', (e)=>{
  const el = e.target.closest('.chip');
  if(!el) return;
  [...chipContainer.children].forEach(c=>c.classList.remove('active'));
  el.classList.add('active');
  selectedType = el.dataset.value;
});

const remember = document.getElementById('remember');
const statusEl = document.getElementById('status');
const preview = document.getElementById('preview');
const previewJson = document.getElementById('previewJson');

function saveState(){
  if(!remember.checked) return;
  const data = {
    reportType: selectedType,
    reportYear: document.getElementById('reportYear').value,
    clientId: document.getElementById('clientId').value
  };
  localStorage.setItem('kokoodi.report.state', JSON.stringify(data));
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
      const chip = [...chipContainer.children].find(c=>c.dataset.value===data.reportType);
      if(chip){ chip.click(); }
    }
    if(data.reportYear){
      const sel = document.getElementById('reportYear');
      if([...sel.options].some(o=>o.value===data.reportYear)) sel.value = data.reportYear;
    }
    if(data.clientId){ document.getElementById('clientId').value = data.clientId; }
    remember.checked = true;
  }catch{}
}
loadState();

// === Part 2: prepareAgentRequest()
function prepareAgentRequest(){
  const reportType = selectedType;
  const reportYear = document.getElementById('reportYear').value?.trim();
  const clientId   = document.getElementById('clientId').value?.trim();

  const errors = [];
  if(!reportType) errors.push("Select a report type.");
  if(!reportYear) errors.push("Choose a reporting year.");
  if(!clientId)   errors.push("Enter a client name or ID.");
  if(errors.length){
    statusEl.textContent = errors[0];
    statusEl.className = "status err";
    return null;
  }

  const payload = {
    reportType,            
    reportYear: Number(reportYear),
    clientId,
    // Bonus
    requestId: `req_${Date.now()}_${Math.random().toString(36).slice(2,8)}`
  };
  if(remember.checked) saveState();
  return payload;
}

// Click to send and preview
document.getElementById('generate').addEventListener('click', async ()=>{
  const payload = prepareAgentRequest();
  if(!payload) return;
  statusEl.textContent = "Preparing…";
  statusEl.className = "status";

  preview.hidden = false;
  previewJson.textContent = JSON.stringify(payload, null, 2);

  statusEl.textContent = "Ready to send ✓";
  statusEl.className = "status ok";
  setTimeout(()=> statusEl.textContent = "", 1500);
});

// Export if needed
window.prepareAgentRequest = prepareAgentRequest;
