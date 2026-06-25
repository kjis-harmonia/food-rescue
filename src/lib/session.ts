/**
 * MVP では店舗ログインを実装していないため、
 * ログイン中の店舗として store-1 を固定で扱う。
 * 本実装時は Supabase Auth のユーザーに紐づく store_id に置き換える。
 */
export const CURRENT_STORE_ID = 'store-1'
