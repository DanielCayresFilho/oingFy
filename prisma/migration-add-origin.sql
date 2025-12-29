-- =====================================================
-- MIGRATION: Adicionar campo originName
-- Data: 29/12/2025
-- Descrição: Adiciona campo para identificar origem da despesa (cartão, tipo de conta)
-- =====================================================

-- Adicionar coluna originName
ALTER TABLE "month_movimentation_items"
ADD COLUMN IF NOT EXISTS "originName" TEXT;

-- Adicionar comentário explicativo
COMMENT ON COLUMN "month_movimentation_items"."originName" IS
'Nome do cartão (para CREDIT) ou tipo da conta (Conta Fixa, Conta Variável)';

-- Atualizar registros existentes (se houver)
-- Para contas de crédito, buscar o nome do cartão
UPDATE "month_movimentation_items" mmi
SET "originName" = cc.name
FROM accounts_credit ac
JOIN credit_cards cc ON ac."cardId" = cc.id
WHERE mmi."accountCreditId" = ac.id
AND mmi."accountType" = 'CREDIT'
AND mmi."originName" IS NULL;

-- Para contas fixas
UPDATE "month_movimentation_items"
SET "originName" = 'Conta Fixa'
WHERE "accountType" = 'FIXED'
AND "originName" IS NULL;

-- Para contas variáveis
UPDATE "month_movimentation_items"
SET "originName" = 'Conta Variável'
WHERE "accountType" = 'VARIABLE'
AND "originName" IS NULL;

-- Verificar
SELECT
    "accountType",
    "originName",
    COUNT(*) as total
FROM "month_movimentation_items"
GROUP BY "accountType", "originName"
ORDER BY "accountType";

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
