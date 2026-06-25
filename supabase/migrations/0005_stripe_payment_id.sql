-- FOOD RESCUE — records the (simulated, until a backend exists) Stripe
-- payment_intent_id / charge_id against the settled payment row.
-- Additive only — safe to run multiple times.

alter table public.payments
  add column if not exists stripe_payment_id text;
