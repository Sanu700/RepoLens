require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const repoRoutes = require('./routes/repo');
const profileRoutes = require('./routes/profile');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiter — 30 requests per 15 mins per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests — please wait a few minutes and try again.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Explicit CORS — fixes mobile browser issues on deployed apps
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Handle preflight requests
app.options('*', cors());

app.use(express.json({ limit: '1mb' }));
app.use('/api/', limiter);
app.use('/api/repo', repoRoutes);
app.use('/api/profile', profileRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Debug endpoint — check if GitHub token is set and valid
app.get('/health/token', async (req, res) => {
  const token = process.env.GITHUB_TOKEN;
  if (!token) return res.json({ tokenSet: false, message: 'GITHUB_TOKEN is not set' });
  try {
    const axios = require('axios');
    const r = await axios.get('https://api.github.com/rate_limit', {
      headers: { Authorization: `token ${token}`, Accept: 'application/vnd.github.v3+json' }
    });
    res.json({ tokenSet: true, rateLimit: r.data.rate });
  } catch (err) {
    res.json({ tokenSet: true, valid: false, status: err.response?.status, message: err.message });
  }
});

// Global error handler — prevents crashes sending HTML error pages
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '0.0.0.0', () => console.log(`RepoLens backend running on port ${PORT}`));
