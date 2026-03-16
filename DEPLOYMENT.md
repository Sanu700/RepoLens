# 🚀 RepoLens — Deployment Guide

This guide walks you through deploying RepoLens for free using **Render** (backend) and **Vercel** (frontend).

---

## Prerequisites

- GitHub account (push your code here first)
- [Render account](https://render.com) — free
- [Vercel account](https://vercel.com) — free
- GitHub Personal Access Token (optional but recommended)

### Get a GitHub Token (recommended)
Without a token you get 60 API requests/hour. With one: 5,000/hour.

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Generate new token → select **no scopes** (read-only public data)
3. Copy the token — you'll need it in Step 1

---

## Step 1 — Push to GitHub

```bash
cd repolens
git init
git add .
git commit -m "🚀 Initial commit — RepoLens"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/repolens.git
git push -u origin main
```

---

## Step 2 — Deploy Backend on Render

1. Go to [render.com](https://render.com) → **New +** → **Web Service**
2. Connect your GitHub account and select your `repolens` repo
3. Fill in the settings:

| Field | Value |
|-------|-------|
| Name | `repolens-api` |
| Root Directory | `backend` |
| Runtime | `Node` |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Instance Type | `Free` |

4. Click **Advanced** → **Add Environment Variable**:

| Key | Value |
|-----|-------|
| `GITHUB_TOKEN` | your_github_token_here |
| `PORT` | `3001` |

5. Click **Create Web Service**
6. Wait ~2 minutes for deploy
7. Copy your URL — looks like: `https://repolens-api.onrender.com`

> ⚠️ Free Render instances sleep after 15 mins of inactivity. First request after sleep takes ~30s. Upgrade to paid ($7/mo) to avoid this.

---

## Step 3 — Deploy Frontend on Vercel

1. Open `frontend/vercel.json` and replace the Render URL:
```json
"destination": "https://YOUR-RENDER-URL.onrender.com/api/$1"
```
and:
```json
"REACT_APP_API_URL": "https://YOUR-RENDER-URL.onrender.com"
```

2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo

3. Fill in settings:

| Field | Value |
|-------|-------|
| Framework Preset | `Create React App` |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `build` |

4. Click **Environment Variables** → Add:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://your-repolens-api.onrender.com` |

5. Click **Deploy**
6. Your app is live at `https://repolens.vercel.app` 🎉

---

## Step 4 — Custom Domain (optional)

On Vercel: Settings → Domains → Add `repolens.dev` or any domain you own.

---

## Step 5 — Keep Backend Alive (optional)

Free Render instances sleep after inactivity. To prevent this, use [UptimeRobot](https://uptimerobot.com) (free):

1. Sign up at uptimerobot.com
2. New monitor → HTTP(s)
3. URL: `https://your-repolens-api.onrender.com/health`
4. Interval: every 5 minutes

This pings your backend and keeps it awake 24/7 for free.

---

## Local Development

```bash
# Terminal 1 — Backend
cd backend
cp .env.example .env     # add your GITHUB_TOKEN
npm install
npm run dev              # runs on :3001

# Terminal 2 — Frontend
cd frontend
npm install
npm start                # runs on :3000, proxies /api → :3001
```

---

## Environment Variables Summary

### Backend (`backend/.env`)
```
PORT=3001
GITHUB_TOKEN=ghp_your_token_here
```

### Frontend (`frontend/.env.local` for local dev)
```
REACT_APP_API_URL=http://localhost:3001
```

### Frontend (Vercel production)
```
REACT_APP_API_URL=https://your-repolens-api.onrender.com
```

---

## Troubleshooting

**CORS errors** — Make sure your Render backend URL is correct in vercel.json

**Rate limit errors** — Add a GITHUB_TOKEN to your Render env vars

**Build fails on Vercel** — Make sure Root Directory is set to `frontend`

**Backend sleeping** — Set up UptimeRobot as described in Step 5
