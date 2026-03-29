-- Coach membership payments table
-- Tracks individual coach payments for membership, renewal, and certification fees

create table if not exists coach_payments (
  id uuid primary key default gen_random_uuid(),
  coach_id uuid not null references coaches(id) on delete cascade,
  payer_name text not null,
  payer_email text not null,
  membership_type text not null check (membership_type in ('membership', 'renewal', 'certification')),
  amount_cents integer not null,
  currency text not null default 'usd',
  payment_method text not null check (payment_method in ('stripe', 'paypal')),
  stripe_checkout_session_id text null,
  paypal_order_id text null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'failed', 'canceled')),
  paid_at timestamptz null,
  created_at timestamptz not null default now()
);

-- Index for fast lookups by coach
create index if not exists coach_payments_coach_id_idx on coach_payments(coach_id);

-- RLS: coaches can view their own payment records
alter table coach_payments enable row level security;

create policy "Coaches can view own payments"
  on coach_payments for select
  using (
    coach_id in (
      select id from coaches where profile_id = auth.uid()
    )
  );

create policy "Service role full access to coach_payments"
  on coach_payments for all
  using (true)
  with check (true);
