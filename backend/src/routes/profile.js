const express = require('express');
const router = express.Router();
const { fetchUser, fetchRepos, fetchEvents } = require('../services/githubProfile');
const { analyzeProfile } = require('../services/persona');

router.post('/analyze', async (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'GitHub username is required' });

  const clean = username.trim().replace(/^@/, '').replace('https://github.com/', '').split('/')[0];

  try {
    const [user, repos, events] = await Promise.all([
      fetchUser(clean),
      fetchRepos(clean),
      fetchEvents(clean),
    ]);

    const result = analyzeProfile(user, repos, events);
    res.json(result);
  } catch (err) {
    if (err.response?.status === 404) return res.status(404).json({ error: `GitHub user "${clean}" not found.` });
    if (err.response?.status === 403) return res.status(403).json({ error: 'GitHub API rate limit hit. Add a token in .env or wait a minute.' });
    if (err.response?.status === 401) return res.status(401).json({ error: 'GitHub token is invalid or expired. Check your GITHUB_TOKEN environment variable.' });
    console.error('Profile analyze error:', err.response?.status, err.message);
    res.status(500).json({ error: 'Failed to analyze profile. Please try again.' });
  }
});

module.exports = router;
