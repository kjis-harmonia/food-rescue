-- FOOD RESCUE — records which payment method (credit_card / paypay /
-- apple_pay) was used for a payment, so a future Edge Function calling
-- Stripe's PayPay/Apple Pay APIs server-side has a column to write into.
-- Additive only — safe to run multiple times.

alter table public.payments
  add column if not exists payment_method text not null default 'credit_card';
