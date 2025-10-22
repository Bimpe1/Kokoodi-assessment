
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
