const $get = url => fetch(url).then(r => r.json());

/* ──────────────── Load available devices ──────────────── */
async function loadAvailableTable() {
  const list  = await $get('/api/available-devices');
  const tbl   = document.getElementById('availTable');
  const body  = document.getElementById('availBody');
  if (!tbl) return; // not on allocate page

  if (!list.length) {
    tbl.style.display = 'none';
    return;
  }

  tbl.style.display = 'table';
  body.innerHTML = list.map(d => `
    <tr>
      <td>${d.device_id}</td>
      <td>${d.brand}</td>
      <td>${d.model}</td>
    </tr>`).join('');
}

/* ──────────────── Allocate device ──────────────── */
async function allocateDevice() {
  const employee_id = document.getElementById('empId').value.trim();
  const device_id   = document.getElementById('devId').value.trim();
  if (!employee_id || !device_id) return alert('Enter both IDs.');

  const res = await fetch('/api/allocate', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ employee_id, device_id })
  });

  alert((await res.json()).message);
  loadAvailableTable(); // refresh availability
}

/* ──────────────── Deallocate device ──────────────── */
async function deallocateDevice() {
  const device_id = document.getElementById('deallocId').value.trim();
  if (!device_id) return alert('Enter device ID.');

  const res = await fetch('/api/deallocate', {
    method : 'POST',
    headers: { 'Content-Type': 'application/json' },
    body   : JSON.stringify({ device_id })
  });

  alert((await res.json()).message);
  loadAvailableTable(); // refresh availability
}

/* ──────────────── Show all allocations ──────────────── */
async function showAllocations() {
  const data = await $get('/api/allocations');
  const tbl  = document.getElementById('allocTable');
  const body = document.getElementById('tableBody');
  if (!tbl) return;

  if (!data.length) {
    tbl.style.display = 'none';
    return alert('No active allocations.');
  }

  tbl.style.display = 'table';
  body.innerHTML = data.map(a => `
    <tr>
      <td>${a.employee}</td>
      <td>${a.brand} ${a.model}</td>
      <td>${a.allocated_date}</td>
    </tr>`).join('');
}

/* ──────────────── Event bindings ──────────────── */
document.getElementById('allocateBtn')?.addEventListener('click', allocateDevice);
document.getElementById('deallocateBtn')?.addEventListener('click', deallocateDevice);
document.getElementById('viewBtn')?.addEventListener('click', showAllocations);
window.addEventListener('DOMContentLoaded', loadAvailableTable);
