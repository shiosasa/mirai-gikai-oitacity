-- Add seat_number (議席番号) to politicians
-- Nullable: 辞職等で欠番となった席はレコード自体が無いか NULL のままになる

ALTER TABLE public.politicians
    ADD COLUMN IF NOT EXISTS seat_number INTEGER;

COMMENT ON COLUMN public.politicians.seat_number IS '議席番号（欠番は NULL / レコード無し）';

CREATE INDEX IF NOT EXISTS politicians_seat_number_idx
    ON public.politicians (seat_number);
