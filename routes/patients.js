// routes/patients.js
const express  = require('express');
const { read, write, nextId } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/patients
router.get('/', (req, res) => {
  const db = read();
  const { q, doctorId, gender } = req.query;
  let patients = db.patients.map(p => {
    const doc = db.doctors.find(d => d.id === p.doctorId);
    return { ...p, doctorName: doc ? `Dr. ${doc.firstName} ${doc.lastName}` : '—' };
  });
  if (q) {
    const s = q.toLowerCase();
    patients = patients.filter(p =>
      `${p.firstName} ${p.lastName} ${p.email||''} ${p.bloodType||''}`.toLowerCase().includes(s));
  }
  if (doctorId) patients = patients.filter(p => String(p.doctorId) === doctorId);
  if (gender)   patients = patients.filter(p => p.gender === gender);
  res.json(patients);
});

// GET /api/patients/:id — with doctor + diagnoses
router.get('/:id', (req, res) => {
  const db  = read();
  const pat = db.patients.find(p => p.id === +req.params.id);
  if (!pat) return res.status(404).json({ error: 'Patient not found' });

  const doc = db.doctors.find(d => d.id === pat.doctorId) || null;
  const diagnoses = db.diagnoses
    .filter(d => d.patientId === pat.id)
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  res.json({ ...pat, doctor: doc, diagnoses });
});

// POST /api/patients — admin + clinician
router.post('/', authorize('admin', 'clinician'), (req, res) => {
  const { firstName, lastName } = req.body;
  if (!firstName || !lastName)
    return res.status(400).json({ error: 'firstName and lastName required' });
  const db  = read();
  const pat = { id: nextId(db.patients), ...req.body };
  if (pat.doctorId) pat.doctorId = +pat.doctorId;
  db.patients.push(pat);
  write(db);
  res.status(201).json(pat);
});

// PUT /api/patients/:id — admin + clinician
router.put('/:id', authorize('admin', 'clinician'), (req, res) => {
  const db = read();
  const i  = db.patients.findIndex(p => p.id === +req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Patient not found' });
  const updated = { ...db.patients[i], ...req.body, id: db.patients[i].id };
  if (updated.doctorId) updated.doctorId = +updated.doctorId;
  db.patients[i] = updated;
  write(db);
  res.json(db.patients[i]);
});

// DELETE /api/patients/:id — admin only (cascade delete diagnoses)
router.delete('/:id', authorize('admin'), (req, res) => {
  const db = read();
  const id = +req.params.id;
  if (!db.patients.find(p => p.id === id))
    return res.status(404).json({ error: 'Patient not found' });
  db.diagnoses = db.diagnoses.filter(d => d.patientId !== id);
  db.patients  = db.patients.filter(p => p.id !== id);
  write(db);
  res.json({ message: 'Patient and related diagnoses deleted' });
});

module.exports = router;
