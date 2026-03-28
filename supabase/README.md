# Supabase Backend Setup

## 1. Configure environment variables
Copy `.env.example` to `.env.local` and fill in:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `OPENAI_API_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- optional PayPal / Resend keys

## 2. Apply migrations
Run the SQL in:

- `supabase/migrations/0001_initial_schema.sql`

You can apply it through the Supabase SQL editor or the Supabase CLI.

## 3. Seed demo data
After the schema exists and env vars are set:

```bash
npm run seed
```

This seeds:

- chapters
- coaches
- events
- payments
- testimonials
- clients

## 4. Core backend routes

- `POST /api/ai/generate-chapter`
- `POST /api/ai/search`
- `POST /api/ai/enhance-bio`
- `POST /api/ai/generate-reminder`
- `POST /api/embed`
- `GET /api/auth/callback`
- `POST /api/stripe/create-checkout`
- `POST /api/stripe/webhook`
- `POST /api/paypal/create-order`
- `POST /api/paypal/capture-order`
- `POST /api/campaigns/create`
- `POST /api/campaigns/send`
