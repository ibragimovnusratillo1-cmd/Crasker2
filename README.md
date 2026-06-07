# 🏥 CareTrack MRMS — Medical Records Management System
**BTEC Level 3 — Unit 25: Full Stack Development**

---

## 🚀 How to Run

```bash
# 1. Install dependencies
npm install

# 2. Start the server
node server.js

# 3. Open browser
http://localhost:3000
```

---

## 🔑 Demo Accounts

| Role | Username | Password | Access |
|------|----------|----------|--------|
| **Admin** | `admin` | `admin123` | Full access |
| **Clinician** | `dr.smith` | `clinic123` | Patients + Diagnoses |
| **Clinician** | `dr.jones` | `clinic123` | Patients + Diagnoses |

---

## 📁 Project Structure

```
caretrack-mrms/
│
├── server.js              ← Express server (entry point)
├── db.js                  ← JSON database helper
├── db.json                ← Data store (doctors, patients, diagnoses)
│
├── routes/
│   ├── auth.js            ← POST /api/auth/login
│   ├── doctors.js         ← CRUD /api/doctors
│   ├── patients.js        ← CRUD /api/patients
│   ├── diagnoses.js       ← CRUD /api/diagnoses
│   └── stats.js           ← GET /api/stats (dashboard)
│
├── middleware/
│   └── auth.js            ← JWT verify + RBAC authorize()
│
└── public/                ← Frontend (served as static files)
    ├── index.html         ← Login page
    ├── css/
    │   ├── style.css      ← Global styles
    │   └── login.css      ← Login page styles
    ├── js/
    │   └── shared.js      ← API client, Auth, UI helpers
    └── pages/
        ├── dashboard.html
        ├── doctors.html
        ├── patients.html
        ├── patient-profile.html
        └── diagnoses.html
```

---

## ✅ BTEC Requirements Coverage

| Criterion | Feature |
|-----------|---------|
| **C.P4** | Full stack app — Express backend + HTML/JS frontend |
| **C.P5** | Doctor, Patient, Diagnosis CRUD + Role-Based Access Control |
| **C.M3** | Cascade delete, data integrity checks, responsive design |
| **C.P6** | All CareTrack Clinic requirements met |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js + Express.js |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Database | JSON file (db.json) |
| Frontend | HTML5 + CSS3 + Vanilla JavaScript |
| API | REST API (JSON responses) |

## 🔐 RBAC Summary

| Action | Admin | Clinician |
|--------|-------|-----------|
| View Doctors | ✅ | ✅ |
| Add/Edit/Delete Doctors | ✅ | ❌ |
| View Patients | ✅ | ✅ |
| Add/Edit Patients | ✅ | ✅ |
| Delete Patients | ✅ | ❌ |
| Add/Edit Diagnoses | ✅ | ✅ |
| Delete Diagnoses | ✅ | ✅ |
