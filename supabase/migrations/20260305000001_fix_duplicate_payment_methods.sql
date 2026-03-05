-- ============================================================
-- Migration: Fix duplicate payment methods
-- Date: 2026-03-05
-- Description: Remove duplicate "Credit/Debit Card" rows from
--              payment_methods table, keeping the one with the
--              lowest display_order (earliest created).
-- ============================================================

DELETE FROM payment_methods
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY LOWER(TRIM(name))
             ORDER BY display_order ASC, created_at ASC
           ) AS rn
    FROM payment_methods
  ) ranked
  WHERE rn > 1
);
