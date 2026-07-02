# Render Deployment Guide

## Environment Variables Required

Set these in your Render Dashboard under "Environment":

```
MONGODB_URI=mongodb+srv://username:password@your-cluster.mongodb.net/helpdesk
NODE_ENV=production
PORT=10000
```

## Build Command

```bash
npm run build
```

This will:
1. Build React frontend to `dist/` folder
2. Server will serve static files from `dist/` directory

## Start Command

```bash
npm run start
```

This starts the Node.js Express server that serves both:
- API endpoints at `/api/*`
- Static frontend files from `dist/`

## How It Works

- Frontend makes API calls to `/api/*` (same origin)
- Server automatically serves the built React app at `/`
- No CORS issues because both frontend and API are on same domain

## Local Development

1. Create `.env` file with your MongoDB URI:
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/helpdesk
```

2. Start backend server:
```bash
npm run server
```

3. In another terminal, start frontend dev server:
```bash
npm run dev
```

Frontend will proxy API calls to `http://localhost:5000` via Vite, or you can set:
```
VITE_API_BASE=http://localhost:5000/api
```

## Troubleshooting

- **API calls failing**: Ensure frontend is using relative paths (`/api/*`) or Render URL
- **Database connection error**: Verify MONGODB_URI is correct and IP whitelist includes Render IPs (0.0.0.0/0)
- **Static files not loading**: Ensure `npm run build` completes successfully before deploying
