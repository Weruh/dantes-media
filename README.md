# Dantes Media

Dantes Media is a production-oriented ICT services website built with React 18, Vite, and an Express API.

The project is arranged as:
- `frontend/` for the React app
- `server/` for checkout, contact, admin, and notification endpoints

For production, the app is split across two hosts:
- Site: `https://dantesmediasolution.com`
- Frontend: GitHub Pages
- API: Render at either `https://<your-service>.onrender.com/api/*` or `https://api.dantesmediasolution.com/api/*`

## Features

- React storefront and service marketing pages
- Cart and Paystack checkout flow
- Quote request submission endpoint
- Admin login, orders, sold goods, and custom products endpoints
- Email and WhatsApp notification hooks
- Render blueprint and GitHub Actions CI

## Local Development

Install dependencies:

```bash
npm install
```

Create a local env file from `.env.example`.

Recommended local workflow:

```bash
npm run dev:full
```

Available scripts:

```bash
npm run dev         # frontend only
npm run dev:server  # API only
npm run dev:full    # frontend + API together
npm run build       # production frontend build
npm start           # serves frontend/dist + /api from Express
```

## Environment Variables

Common required variables:

- `PAYSTACK_SECRET_KEY`
- `FRONTEND_URL`
- `CORS_ORIGINS`
- `PAYSTACK_CALLBACK_URL`
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

Notification-related variables:

- `SELLER_NOTIFY_EMAIL`
- `CONTACT_NOTIFY_EMAIL`
- `PLUNK_API_KEY`
- `PLUNK_FROM`
- `PLUNK_REPLY_TO`
- `RESEND_API_KEY`
- `RESEND_FROM`
- `RESEND_REPLY_TO`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `SMTP_FROM`
- `WHATSAPP_WEBHOOK_URL`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_RECIPIENT_PHONE`
- `WHATSAPP_API_VERSION`

Use `.env.example` as the template for local development.

## Owner Order Notifications

When a customer completes payment, the server sends the owner an order email with:

- buyer full name
- buyer email
- buyer phone number
- payment phone number
- delivery address and delivery schedule
- products purchased, quantity, and totals

The same paid-order event also sends the customer an order confirmation email with:

- order reference
- products purchased and quantities
- delivery details
- order totals

To deliver those emails with Plunk into the owner's Gmail inbox, set these values in your deployed environment:

```bash
SELLER_NOTIFY_EMAIL=owner@gmail.com
PLUNK_API_KEY=sk_xxxxxxxxxxxxxxxxxxxxx
PLUNK_FROM=Dantes Media <orders@dantesmediasolution.com>
PLUNK_REPLY_TO=
```

Important:

- `SELLER_NOTIFY_EMAIL` should be the Gmail address that should receive paid-order notifications.
- `PLUNK_FROM` must use a sender address you have verified inside Plunk.
- When a paid order is confirmed, the server emails the owner automatically from `markOrderPaid -> notifySeller -> notifyViaEmail`.
- The customer email is used as the `Reply-To`, so the owner can reply directly from Gmail unless you set `PLUNK_REPLY_TO`.
- Plunk is checked first. Resend and SMTP remain available as fallbacks if you prefer them.

## GitHub Readiness

This repo is prepared for GitHub with:

- a cleaner ignore list for build archives and runtime data
- `CI` workflow at `.github/workflows/ci.yml`
- a single production start command via `npm start`

Suggested first push:

```bash
git init
git add .
git commit -m "Prepare Dantes Media for deployment"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

## Deploy Backend To Render

This repo includes `render.yaml` for the Express API deployment.

1. Push the repo to GitHub.
2. In Render, create a new Blueprint from the GitHub repository.
3. Render will create the `dantes-media` web service from `render.yaml`.
4. Set the secret environment variables in Render:
   - `PAYSTACK_SECRET_KEY`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD`
   - notification provider credentials you plan to use
5. Deploy.

Production values already assumed by `render.yaml`:

- `FRONTEND_URL=https://dantesmediasolution.com`
- `CORS_ORIGINS=https://dantesmediasolution.com,https://www.dantesmediasolution.com`
- `PAYSTACK_CALLBACK_URL=https://dantesmediasolution.com/checkout/verify`

After deployment, verify:

- `https://<your-render-service>/api/health`
- `https://<your-render-service>/`

## Deploy Frontend To GitHub Pages

The repo now includes `.github/workflows/pages.yml` for GitHub Pages deployment.

1. In GitHub, go to Settings -> Pages.
2. Set Source to `GitHub Actions`.
3. Add a repository variable named `VITE_API_BASE_URL`.
4. Set that variable to your Render API origin, for example:
   - `https://<your-service>.onrender.com/api`
   - or `https://api.dantesmediasolution.com/api`
5. Push to `main` or `master` and let the Pages workflow deploy `frontend/dist`.

The frontend build includes:

- `frontend/public/CNAME` for `dantesmediasolution.com`
- `frontend/public/.nojekyll`
- `frontend/public/404.html` to preserve SPA routes on direct visits

## Connect Namecheap Domain

Use separate DNS targets for frontend and backend.

Frontend on GitHub Pages:

1. Point apex `@` only to the four GitHub Pages IPs:
   - `185.199.108.153`
   - `185.199.109.153`
   - `185.199.110.153`
   - `185.199.111.153`
2. Point `www` to `weruh.github.io`.

Backend on Render:

1. Use either the default `*.onrender.com` hostname in `VITE_API_BASE_URL`.
2. Or create a separate subdomain such as `api.dantesmediasolution.com`.
3. If you use `api`, point that subdomain to your Render service as instructed by Render.

Important:

- Do not point `dantesmediasolution.com` to Render if GitHub Pages is serving the frontend.
- Do not mix GitHub Pages A records with unrelated A records on the apex domain.
- Keep `FRONTEND_URL`, `CORS_ORIGINS`, and `PAYSTACK_CALLBACK_URL` in Render aligned with the GitHub Pages frontend domain.

## Production Notes

- `frontend/public/sitemap.xml` and `frontend/public/robots.txt` now point to `https://dantesmediasolution.com`.
- GitHub Pages serves the frontend, while Render serves the API.
- Runtime data written by the API is ignored under `server/data/`.
