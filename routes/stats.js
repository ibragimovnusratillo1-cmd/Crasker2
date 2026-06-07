// routes/stats.js
const express  = require('express');
const { read } = require('../db');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/', (req, res) => {
  const db = read();
  res.json({
    doctors:   db.doctors.length,
    patients:  db.patients.length,
    diagnoses: db.diagnoses.length,
    critical:  db.diagnoses.filter(d => d.severity === 'Critical').length,
    recentPatients:  db.patients.slice(-5).reverse(),
    recentDiagnoses: [...db.diagnoses].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,5)
      .map(d => {
        const p = db.patients.find(p => p.id === d.patientId);
        return { ...d, patientName: p ? `${p.firstName} ${p.lastName}` : '—' };
      }),
    doctorsOverview: db.doctors.map(doc => ({
      ...doc,
      patientCount: db.patients.filter(p => p.doctorId === doc.id).length
    }))
  });
});

module.exports = router;
