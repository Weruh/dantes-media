# Dantes Media

Production-ready ICT services website built with React 18 + Vite.

Project structure:
- Frontend (CSR): `frontend/`
- Backend API: `server/`

This repo now includes a lightweight Node API for Paystack:
- `POST /api/paystack/initialize`
- `GET /api/paystack/verify/:reference`
- `POST /api/paystack/webhook`
- `POST /api/admin/login` (seller auth: email + password)
- `POST /api/admin/logout` (seller auth: bearer token)
- `GET /api/admin/orders` (seller API, requires bearer token)
- `GET /api/admin/orders/:reference` (seller API, requires bearer token)

Seller page:
- `/admin/orders`

## Setup
```bash
npm install
```

Create an env file before running Paystack flows:
- `.env` at project root, or
- `server/.env`

Use `.env.example` as the template.

To enable seller tracking:
- Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` for `/api/admin/*` access.
- Configure notifications using:
  - Email: `SELLER_NOTIFY_EMAIL` + SMTP variables.
  - WhatsApp/webhook: `WHATSAPP_WEBHOOK_URL`.

## Development
```bash
npm run dev
```

Run full app + payment API:
```bash
npm run dev:full
```

Run API only:
```bash
npm run dev:server
```

## Build
```bash
npm run build
npm run preview
```

## Deployment
Recommended split:
- Backend API on Render (or any Node host)
- Frontend static site on Netlify/Render Static

### Option A: Render Blueprint (both frontend + backend)
This repo includes `render.yaml`.

1. In Render, create a Blueprint service from this repo.
2. Set required env vars on `dantes-media-api`:
   - `PAYSTACK_SECRET_KEY`
   - `FRONTEND_URL` (your frontend public URL)
   - `PAYSTACK_CALLBACK_URL` (`<frontend-url>/checkout/verify`)
   - `CORS_ORIGINS` (comma-separated allowed origins, e.g. frontend prod + staging)
   - `ADMIN_EMAIL` and `ADMIN_PASSWORD` (for seller/admin order endpoints)
   - Notification envs (`SELLER_NOTIFY_EMAIL` + SMTP vars and/or `WHATSAPP_WEBHOOK_URL`)
3. Set `VITE_API_BASE_URL` on `dantes-media-frontend` to:
   - `https://<your-api-domain>/api`
4. In Paystack dashboard, set webhook URL:
   - `https://<your-api-domain>/api/paystack/webhook`

### Option B: Backend on Render + Frontend on Netlify
This repo includes `netlify.toml` for frontend.

1. Deploy API (`node server/index.js`) on Render with env vars above.
2. Deploy frontend on Netlify:
   - Build command: `npm run build`
   - Publish directory: `frontend/dist`
   - Env var: `VITE_API_BASE_URL=https://<your-api-domain>/api`
3. Set Paystack webhook URL to your API domain as above.

## SPA Routing Notes
This app uses `react-router-dom` with client-side routing. When deploying to static hosts,
ensure your platform routes all requests to `index.html` so refreshes on nested routes work.

Examples:
- Netlify: add a `_redirects` file with `/* /index.html 200`
- Vercel: set `rewrites` to `/*` -> `/index.html`
- Cloudflare Pages: add a `_redirects` file or configure SPA fallback

