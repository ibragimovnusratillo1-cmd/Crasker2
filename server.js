// server.js — CareTrack MRMS Backend
const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static frontend
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/auth',      require('./routes/auth'));
app.use('/api/doctors',   require('./routes/doctors'));
app.use('/api/patients',  require('./routes/patients'));
app.use('/api/diagnoses', require('./routes/diagnoses'));
app.use('/api/stats',     require('./routes/stats'));

// All other routes → index.html (SPA fallback)
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ CareTrack MRMS running at http://localhost:${PORT}`));
