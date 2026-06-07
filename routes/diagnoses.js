// routes/diagnoses.js
const express  = require('express');
const { read, write, nextId } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/diagnoses
router.get('/', (req, res) => {
  const db = read();
  const { q, severity, patientId } = req.query;
  let list = db.diagnoses.map(d => {
    const pat = db.patients.find(p => p.id === d.patientId);
    return { ...d, patientName: pat ? `${pat.firstName} ${pat.lastName}` : '—' };
  }).sort((a, b) => new Date(b.date) - new Date(a.date));

  if (q)         list = list.filter(d => `${d.icdCode} ${d.description} ${d.patientName}`.toLowerCase().includes(q.toLowerCase()));
  if (severity)  list = list.filter(d => d.severity === severity);
  if (patientId) list = list.filter(d => String(d.patientId) === patientId);
  res.json(list);
});

// GET /api/diagnoses/:id
router.get('/:id', (req, res) => {
  const db   = read();
  const diag = db.diagnoses.find(d => d.id === +req.params.id);
  if (!diag) return res.status(404).json({ error: 'Diagnosis not found' });
  res.json(diag);
});

// POST /api/diagnoses — admin + clinician
router.post('/', authorize('admin', 'clinician'), (req, res) => {
  const { patientId, icdCode, description, date } = req.body;
  if (!patientId || !icdCode || !description || !date)
    return res.status(400).json({ error: 'patientId, icdCode, description, date required' });
  const db   = read();
  const diag = { id: nextId(db.diagnoses), ...req.body, patientId: +req.body.patientId };
  db.diagnoses.push(diag);
  write(db);
  res.status(201).json(diag);
});

// PUT /api/diagnoses/:id — admin + clinician
router.put('/:id', authorize('admin', 'clinician'), (req, res) => {
  const db = read();
  const i  = db.diagnoses.findIndex(d => d.id === +req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Diagnosis not found' });
  db.diagnoses[i] = { ...db.diagnoses[i], ...req.body, id: db.diagnoses[i].id };
  if (db.diagnoses[i].patientId) db.diagnoses[i].patientId = +db.diagnoses[i].patientId;
  write(db);
  res.json(db.diagnoses[i]);
});

// DELETE /api/diagnoses/:id — admin + clinician
router.delete('/:id', authorize('admin', 'clinician'), (req, res) => {
  const db = read();
  const id = +req.params.id;
  if (!db.diagnoses.find(d => d.id === id))
    return res.status(404).json({ error: 'Diagnosis not found' });
  db.diagnoses = db.diagnoses.filter(d => d.id !== id);
  write(db);
  res.json({ message: 'Diagnosis deleted' });
});

module.exports = router;
