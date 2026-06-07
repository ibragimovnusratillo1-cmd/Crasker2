// shared.js — API client, auth helpers, UI utilities

// ── API ──────────────────────────────────────────────────────
const API = {
  base: '/api',

  _headers() {
    const h = { 'Content-Type': 'application/json' };
    const token = sessionStorage.getItem('mrms_token');
    if (token) h['Authorization'] = 'Bearer ' + token;
    return h;
  },

  async _req(method, path, body) {
    const opts = { method, headers: this._headers() };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(this.base + path, opts);
    if (res.status === 401) { Auth.logout(); return; }
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  },

  get(path)         { return this._req('GET', path); },
  post(path, body)  { return this._req('POST', path, body); },
  put(path, body)   { return this._req('PUT', path, body); },
  delete(path)      { return this._req('DELETE', path); },
};

// ── Auth ─────────────────────────────────────────────────────
const Auth = {
  login(token, user) {
    sessionStorage.setItem('mrms_token', token);
    sessionStorage.setItem('mrms_user',  JSON.stringify(user));
  },
  logout() {
    sessionStorage.clear();
    window.location.href = '/';
  },
  current() {
    const raw = sessionStorage.getItem('mrms_user');
    return raw ? JSON.parse(raw) : null;
  },
  require() {
    const user = this.current();
    if (!user) { window.location.href = '/'; return null; }
    return user;
  },
  isAdmin()     { const u = this.current(); return u && u.role === 'admin'; },
  isClinician() { const u = this.current(); return u && u.role === 'clinician'; },
};

// ── Toast ─────────────────────────────────────────────────────
function showToast(msg, type = 'success') {
  let c = document.getElementById('toast-container');
  if (!c) { c = document.createElement('div'); c.id = 'toast-container'; document.body.appendChild(c); }
  const icons = { success: '✅', danger: '❌', info: 'ℹ️' };
  const t = document.createElement('div');
  t.className = `toast toast-${type}`;
  t.innerHTML = `<span>${icons[type] || ''}</span> ${msg}`;
  c.appendChild(t);
  setTimeout(() => { t.style.opacity = '0'; t.style.transform = 'translateX(20px)'; t.style.transition = '.3s'; setTimeout(() => t.remove(), 300); }, 2800);
}

// ── Modal ─────────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id).classList.remove('hidden'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); }

document.addEventListener('click', e => {
  if (e.target.classList.contains('modal-overlay')) e.target.classList.add('hidden');
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape')
    document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(m => m.classList.add('hidden'));
});

// ── Form helpers ──────────────────────────────────────────────
function collectForm(formId) {
  const data = {};
  document.getElementById(formId).querySelectorAll('[name]').forEach(el => {
    data[el.name] = el.value.trim();
  });
  return data;
}
function fillForm(formId, obj) {
  const form = document.getElementById(formId);
  Object.entries(obj).forEach(([k, v]) => {
    const el = form.querySelector(`[name="${k}"]`);
    if (el) el.value = v ?? '';
  });
}
function resetForm(formId) { document.getElementById(formId).reset(); }

// ── Severity badge ────────────────────────────────────────────
function severityBadge(s) {
  const m = { Critical:'rose', Severe:'rose', Moderate:'amber', Mild:'emerald' };
  return `<span class="badge badge-${m[s]||'gray'}">${s||'—'}</span>`;
}

// ── Age calc ──────────────────────────────────────────────────
function calcAge(dob) {
  if (!dob) return '—';
  return Math.floor((Date.now() - new Date(dob)) / (365.25*24*3600*1000)) + ' yrs';
}

// ── Confirm ───────────────────────────────────────────────────
function confirmDelete(msg, cb) {
  if (window.confirm(msg || 'Delete this record?')) cb();
}

// ── Sidebar ───────────────────────────────────────────────────
function renderSidebar(active) {
  const user = Auth.current();
  if (!user) return;
  const init = user.name.charAt(0).toUpperCase();
  const isAdmin = user.role === 'admin';

  const adminLinks = isAdmin ? `
    <div class="nav-group-title">Administration</div>
    <a class="nav-link ${active==='doctors'?'active':''}" href="/pages/doctors.html">
      <span class="nav-icon">👨‍⚕️</span> Doctors
    </a>` : '';

  document.getElementById('sidebar').innerHTML = `
    <div class="sidebar-brand">
      <div class="brand-logo">
        <div class="brand-icon">🏥</div>
        <div class="brand-name">Care<span>Track</span></div>
      </div>
      <div class="brand-sub">Medical Records System</div>
      <div class="sidebar-user" style="margin:12px 0 0;padding:9px 10px">
        <div class="user-avatar">${init}</div>
        <div>
          <div class="user-name">${user.name}</div>
          <span class="user-role-badge role-${user.role}">${user.role}</span>
        </div>
      </div>
    </div>
    <nav class="sidebar-nav">
      <div class="nav-group-title">Main</div>
      <a class="nav-link ${active==='dashboard'?'active':''}" href="/pages/dashboard.html">
        <span class="nav-icon">📊</span> Dashboard
      </a>
      ${adminLinks}
      <div class="nav-group-title">Records</div>
      <a class="nav-link ${active==='patients'?'active':''}" href="/pages/patients.html">
        <span class="nav-icon">🧑‍🤝‍🧑</span> Patients
      </a>
      <a class="nav-link ${active==='diagnoses'?'active':''}" href="/pages/diagnoses.html">
        <span class="nav-icon">🩺</span> Diagnoses
      </a>
    </nav>
    <div class="sidebar-footer">
      <button class="logout-btn" onclick="Auth.logout()">
        <span>⏏️</span> Sign Out
      </button>
    </div>`;
}
