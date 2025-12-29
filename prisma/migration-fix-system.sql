-- =====================================================
-- MIGRATION: Correção Completa do Sistema Financeiro
-- Data: 29/12/2024
-- Descrição: Adiciona campo installmentNumber e limpa dados antigos corrompidos
-- =====================================================

-- PASSO 1: Adicionar campo installmentNumber (se ainda não existe)
ALTER TABLE "month_movimentation_items"
ADD COLUMN IF NOT EXISTS "installmentNumber" INTEGER;

-- Adicionar comentário explicativo
COMMENT ON COLUMN "month_movimentation_items"."installmentNumber" IS
'Número da parcela para contas variáveis e de crédito (ex: 1 para primeira parcela, 2 para segunda)';

-- PASSO 2: Limpar dados antigos corrompidos
-- ATENÇÃO: Isso vai deletar TODAS as movimentações para regenerar com a lógica correta
DELETE FROM month_movimentation_items;
DELETE FROM month_movimentations;

-- PASSO 3: (OPCIONAL) Resetar contadores de parcelas
-- Descomente as linhas abaixo se quiser resetar tudo para testar do zero
-- UPDATE accounts_variable SET "qtPayed" = 0;
-- UPDATE accounts_credit SET "installmentsPayed" = 0;

-- PASSO 4: Verificar estrutura
SELECT
    'Migration aplicada com sucesso!' AS status,
    COUNT(*) AS movimentacoes_deletadas
FROM month_movimentations;

-- Deve retornar 0 movimentações

-- =====================================================
-- FIM DA MIGRATION
-- =====================================================
--
-- PRÓXIMOS PASSOS:
-- 1. Reinicie o backend NestJS
-- 2. Acesse o dashboard no frontend
-- 3. O sistema vai regenerar as movimentações automaticamente com a lógica correta
-- 4. Verifique se o saldo está correto (apenas receitas recebidas)
-- 5. Verifique se as parcelas de cartão aparecem corretamente
-- =====================================================
