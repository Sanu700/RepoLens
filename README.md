# 🔍 RepoLens

> **Analyze any GitHub repository or developer profile instantly.** Deep analytics, productivity scores, AI-powered insights, and improvement suggestions — all in one dashboard.

![RepoLens Dashboard](https://img.shields.io/badge/RepoLens-v1.0.0-00d4ff?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-61dafb?style=flat-square&logo=react)
![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=flat-square&logo=node.js)
![GitHub API](https://img.shields.io/badge/GitHub-REST_API-181717?style=flat-square&logo=github)
![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)
![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=flat-square&logo=vercel)
![Deploy on Render](https://img.shields.io/badge/Deploy-Render-46E3B7?style=flat-square&logo=render)

---

## 🌐 Live Demo

🚀 **[repo-lens-ivory.vercel.app](https://repo-lens-ivory.vercel.app)**

Try it with: `torvalds` · `gaearon` · `sindresorhus` · `Sanu700`

---

## ✨ Features

- 📊 **Repository Overview** — Stars, forks, contributors, commits, languages, last activity
- 📈 **Analytics Charts** — Commit timeline, language distribution, contributor activity
- 🏆 **Productivity Score** — 0–100 score based on 6 key health metrics
- 👤 **Profile Analysis** — Dev persona, skill radar, coding habits, and profile improvement suggestions
- 💡 **Smart Insights** — Auto-generated observations about repo health
- 🛠️ **Improvement Suggestions** — Prioritized, actionable recommendations
- ⚡ **Fast** — Parallel API calls for sub-second analysis

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- GitHub Personal Access Token (optional, increases API rate limits)

### Installation

```bash
git clone https://github.com/Sanu700/RepoLens
cd RepoLens
```

### Backend

```bash
cd backend
npm install

# Optional: create .env for GitHub token
echo "GITHUB_TOKEN=your_token_here" > .env
echo "PORT=3001" >> .env

npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm start
```

Open [http://localhost:3000](http://localhost:3000) and paste any GitHub repo URL!

---

## 🏗️ Project Structure

```
repolens/
├── backend/
│   └── src/
│       ├── index.js              # Express server
│       ├── routes/repo.js        # /api/repo/analyze endpoint
│       ├── services/
│       │   ├── github.js         # GitHub REST API calls
│       │   └── analytics.js      # Scoring & insights engine
│       └── utils/parseUrl.js     # GitHub URL parser
└── frontend/
    └── src/
        ├── App.js
        └── components/
            ├── LandingPage.js    # Home screen with URL input
            ├── Dashboard.js      # Full analytics dashboard
            ├── ScoreRing.js      # Animated productivity score
            └── Charts.js         # Recharts visualizations
```

---

## 📊 Productivity Score Breakdown

| Metric | Max Points |
|--------|-----------|
| Commit Frequency | 20 |
| Recent Activity | 20 |
| Contributor Count | 15 |
| Issue Resolution Rate | 15 |
| Documentation Presence | 15 |
| Community Engagement | 15 |
| **Total** | **100** |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Recharts, Lucide Icons |
| Backend | Node.js, Express |
| Data | GitHub REST API v3 |
| Styling | CSS-in-JS with CSS variables |

---

## 🤝 Contributing

PRs welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

---

## 🚀 Deployment

Full step-by-step guide in [DEPLOYMENT.md](DEPLOYMENT.md).

**Quick version:**
- Backend → [Render](https://render.com) (free, set Root Dir to `backend`)
- Frontend → [Vercel](https://vercel.com) (free, set Root Dir to `frontend`)
- Keep alive → [UptimeRobot](https://uptimerobot.com) (free, ping `/health` every 5 min)

---

## 📄 License

MIT © 2026 RepoLens Contributors — see [LICENSE](LICENSE) for details.

You're free to use, modify, and distribute this project. Just keep the copyright notice. ⭐ A star is always appreciated!
