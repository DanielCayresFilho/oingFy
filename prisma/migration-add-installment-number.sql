-- Migration: Add installmentNumber field to month_movimentation_items
-- This field tracks which installment number each item represents (for VARIABLE and CREDIT accounts)
-- Run this SQL on your database to update the schema

-- Add the new column
ALTER TABLE "month_movimentation_items"
ADD COLUMN "installmentNumber" INTEGER;

-- Add comment to explain the column
COMMENT ON COLUMN "month_movimentation_items"."installmentNumber" IS
'Número da parcela para contas variáveis e de crédito (ex: 1 para primeira parcela, 2 para segunda, etc.)';
