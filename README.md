# Dantes Media

Dantes Media is a production-oriented ICT services website built with React 18, Vite, and an Express API.

The project is arranged as:
- `frontend/` for the React app
- `server/` for checkout, contact, admin, and notification endpoints

For production, the backend now serves the built frontend and the API from the same service. That makes deployment simpler and fits a single custom domain:
- Site: `https://dantesmediasolution.com`
- API: `https://dantesmediasolution.com/api/*`

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
- `BREVO_API_KEY`
- `BREVO_FROM`
- `BREVO_REPLY_TO`
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

To deliver those emails with Brevo into the owner's Gmail inbox, set these values in your deployed environment:

```bash
SELLER_NOTIFY_EMAIL=owner@gmail.com
BREVO_API_KEY=xkeysib-xxxxxxxxxxxxxxxxxxxxx
BREVO_FROM=Dantes Media <orders@dantesmediasolution.com>
BREVO_REPLY_TO=
```

Important:

- `SELLER_NOTIFY_EMAIL` should be the Gmail address that should receive paid-order notifications.
- `BREVO_FROM` must use a sender address you have verified inside Brevo.
- When a paid order is confirmed, the server emails the owner automatically from `markOrderPaid -> notifySeller -> notifyViaEmail`.
- The customer email is used as the `Reply-To`, so the owner can reply directly from Gmail unless you set `BREVO_REPLY_TO`.
- Brevo is checked first. Resend and SMTP remain available as fallbacks if you prefer them.

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

## Deploy To Render

This repo includes `render.yaml` for a single web service deployment.

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

## Connect Namecheap Domain

Add `dantesmediasolution.com` as the custom domain in Render, then update Namecheap DNS:

1. In Namecheap Advanced DNS, set an `A` record for `@` to `216.24.57.1`.
2. Set a `CNAME` record for `www` to your Render hostname, for example `your-service.onrender.com`.
3. Remove conflicting `AAAA` or old parking records if present.
4. Wait for DNS propagation and complete domain verification in Render.

Once the domain is verified, Render provisions HTTPS automatically.

## Production Notes

- `frontend/public/sitemap.xml` and `frontend/public/robots.txt` now point to `https://dantesmediasolution.com`.
- The Express server serves `frontend/dist` in production, so frontend routes like `/projects/...` and `/checkout/verify` work without separate static hosting.
- Runtime data written by the API is ignored under `server/data/`.
