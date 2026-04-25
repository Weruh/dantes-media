# Dantes Media

Dantes Media is a React + Vite storefront that now uses Supabase directly for its backend.

Current architecture:
- `frontend/` for the website UI
- `shared/catalog.js` for authoritative product pricing used by checkout logic
- `supabase/schema.sql` for database schema and RLS policies
- `supabase/functions/` for Paystack checkout, payment verification/webhook handling, and quote email delivery

There is no Express backend in this repo anymore.

## Features

- React storefront and service pages
- Supabase-backed custom products
- Supabase-backed quote requests
- Supabase-backed orders
- Supabase Auth-based admin dashboard
- Supabase Edge Functions for:
  - quote submission email
  - Paystack checkout initialization
  - Paystack payment verification
  - Paystack webhook processing
  - admin and buyer confirmation emails after payment

## Local Development

Install dependencies:

```bash
npm install
```

Create a root `.env` for the frontend using [.env.example](.env.example):

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
```

Run the frontend:

```bash
npm run dev
```

Build the frontend:

```bash
npm run build
```

## Supabase Setup

1. Create a Supabase project.
2. Apply all migrations in [`supabase/migrations/`](supabase/migrations), or run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor.
3. Create an admin user in Supabase Auth.
4. Set that user’s `app_metadata.role` to `admin`.

Product image uploads require the `product-images` Supabase Storage bucket from
[`supabase/migrations/20260424010000_product_images_storage.sql`](supabase/migrations/20260424010000_product_images_storage.sql).

The admin dashboard signs in with Supabase Auth directly. A normal authenticated user without `app_metadata.role = admin` will be blocked by RLS and the frontend admin check.

## Frontend Environment

The browser only needs:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Do not expose the service role key in the frontend.

## Edge Function Secrets

Use [`supabase/functions/.env.example`](supabase/functions/.env.example) as the template for function secrets. Never commit real service-role, payment, or email API keys.

Important secrets:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `PAYSTACK_SECRET_KEY`
- `PAYSTACK_CURRENCY`
- `PAYSTACK_CALLBACK_URL`
- `SELLER_NOTIFY_EMAIL`
- `CONTACT_NOTIFY_EMAIL`
- `MAILERSEND_API_KEY`
- `MAILERSEND_FROM`
- `MAILERSEND_REPLY_TO`

Optional email fallback:

- `RESEND_API_KEY`
- `RESEND_FROM`
- `RESEND_REPLY_TO`

Set deployed function secrets with the Supabase CLI, replacing values with the
real keys from each provider dashboard:

```bash
supabase secrets set PAYSTACK_SECRET_KEY=sk_test_xxx PAYSTACK_CURRENCY=KES PAYSTACK_CALLBACK_URL=https://dantesmediasolution.com/checkout/verify
```

`PAYSTACK_SECRET_KEY` must be a secret key that starts with `sk_test_` or
`sk_live_`. Do not use the Paystack public key that starts with `pk_`.

## Deploying Supabase Functions

Deploy these functions from `supabase/functions/`:

- `submit-quote`
- `create-checkout-session`
- `verify-payment`
- `paystack-webhook`

After deployment:

- update the site to use the correct `VITE_SUPABASE_URL` and publishable key
- configure Paystack webhook URL to the deployed `paystack-webhook` function
- make sure the callback URL matches your frontend checkout verification page
- set `verify_jwt = false` only for `paystack-webhook`; Paystack authenticates with the webhook signature instead of a Supabase JWT
- rotate any service-role, Paystack, or email keys that were ever committed or shared outside the provider dashboards

## Database Access Model

- `custom_products`
  - public read
  - admin create/update/delete
- `quote_requests`
  - admin read
  - inserts happen through the `submit-quote` Edge Function
- `orders`
  - admin read
  - inserts/updates happen through checkout/payment Edge Functions

## Notes

- `shared/catalog.js` is used as the authoritative base price list for checkout calculation inside Edge Functions.
- The admin dashboard no longer talks to `/api/*`; it uses Supabase directly.
- Quote requests and orders are emailed from Edge Functions, not from a Node server.
