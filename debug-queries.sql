-- ============================================
-- QUERIES DE DEBUG - Janeiro 2026
-- ============================================

-- 1. Ver compras de crédito cadastradas
SELECT
    ac.id,
    ac.name,
    ac."purchaseDate",
    ac.installments,
    ac."installmentsPayed",
    cc.name as cartao,
    cc."vencibleAt" as vencimento_cartao,
    c.name as categoria
FROM accounts_credit ac
JOIN credit_cards cc ON ac."cardId" = cc.id
JOIN categories c ON ac."categoryId" = c.id
ORDER BY ac."purchaseDate" DESC
LIMIT 10;

-- 2. Ver movimentações de janeiro 2026
SELECT
    mm.id,
    mm.month,
    mm.year,
    COUNT(mmi.id) as total_items
FROM month_movimentations mm
LEFT JOIN month_movimentation_items mmi ON mm.id = mmi."monthMovimentationId"
WHERE mm.month = 1 AND mm.year = 2026
GROUP BY mm.id, mm.month, mm.year;

-- 3. Ver items de movimentação de janeiro 2026
SELECT
    mmi.id,
    mmi."accountName",
    mmi."accountType",
    mmi."dueDate",
    mmi.amount,
    mmi."installmentNumber",
    mmi."categoryName"
FROM month_movimentation_items mmi
JOIN month_movimentations mm ON mmi."monthMovimentationId" = mm.id
WHERE mm.month = 1 AND mm.year = 2026
ORDER BY mmi."dueDate";

-- 4. Ver TODOS os cartões cadastrados
SELECT
    id,
    name,
    "vencibleAt",
    "totalLimite"
FROM credit_cards
ORDER BY id;

-- 5. Contar total de compras de crédito
SELECT COUNT(*) as total_compras FROM accounts_credit;

-- 6. Ver se há movimentações geradas
SELECT month, year, COUNT(*)
FROM month_movimentations
GROUP BY month, year
ORDER BY year DESC, month DESC;
