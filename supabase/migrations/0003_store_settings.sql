-- FOOD RESCUE — adds store-level operating hours and a pause flag, used by
-- the store dashboard's 営業時間・受取時間設定 / 一時停止 controls.
-- Additive only — safe to run multiple times.

alter table public.stores
  add column if not exists open_time text not null default '09:00',
  add column if not exists close_time text not null default '21:00',
  add column if not exists is_paused boolean not null default false;
