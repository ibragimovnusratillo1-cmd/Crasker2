// routes/doctors.js
const express  = require('express');
const { read, write, nextId } = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

// GET /api/doctors  — all roles
router.get('/', (req, res) => {
  const db = read();
  // Attach patient count
  const result = db.doctors.map(d => ({
    ...d,
    patientCount: db.patients.filter(p => p.doctorId === d.id).length
  }));
  res.json(result);
});

// GET /api/doctors/:id
router.get('/:id', (req, res) => {
  const db  = read();
  const doc = db.doctors.find(d => d.id === +req.params.id);
  if (!doc) return res.status(404).json({ error: 'Doctor not found' });
  res.json(doc);
});

// POST /api/doctors — admin only
router.post('/', authorize('admin'), (req, res) => {
  const { firstName, lastName, specialization, department, email, phone, status } = req.body;
  if (!firstName || !lastName || !specialization || !department)
    return res.status(400).json({ error: 'firstName, lastName, specialization, department required' });

  const db  = read();
  const doc = { id: nextId(db.doctors), firstName, lastName, specialization, department,
                email: email||'', phone: phone||'', status: status||'Active' };
  db.doctors.push(doc);
  write(db);
  res.status(201).json(doc);
});

// PUT /api/doctors/:id — admin only
router.put('/:id', authorize('admin'), (req, res) => {
  const db = read();
  const i  = db.doctors.findIndex(d => d.id === +req.params.id);
  if (i === -1) return res.status(404).json({ error: 'Doctor not found' });
  db.doctors[i] = { ...db.doctors[i], ...req.body, id: db.doctors[i].id };
  write(db);
  res.json(db.doctors[i]);
});

// DELETE /api/doctors/:id — admin only
router.delete('/:id', authorize('admin'), (req, res) => {
  const db = read();
  const id = +req.params.id;
  const hasPatients = db.patients.some(p => p.doctorId === id);
  if (hasPatients)
    return res.status(409).json({ error: 'Cannot delete: doctor has assigned patients. Reassign them first.' });

  db.doctors = db.doctors.filter(d => d.id !== id);
  write(db);
  res.json({ message: 'Doctor deleted' });
});

module.exports = router;
