# Como Aplicar: Coluna "Origem" no Dashboard

## 📋 O Que Foi Adicionado

Nova coluna **"Origem"** na tabela do dashboard que mostra:
- **Compras de crédito** → Nome do cartão (ex: "Nubank", "SpParcelado")
- **Contas fixas** → "Conta Fixa"
- **Contas variáveis** → "Conta Variável"

## ✅ Arquivos Modificados

### Backend:
1. `prisma/schema.prisma` - Adicionado campo `originName`
2. `src/month-movimentation/month-movimentation.service.ts` - Preenche originName ao gerar items

### Frontend:
3. `frontend/src/lib/api.ts` - Interface MonthMovimentationItem atualizada
4. `frontend/src/types/finance.ts` - Interface Transaction com campo `origin`
5. `frontend/src/pages/Index.tsx` - Mapeia originName para origin
6. `frontend/src/components/dashboard/TransactionTable.tsx` - Nova coluna "Origem"

### Migration:
7. `prisma/migration-add-origin.sql` - Script SQL para adicionar coluna

## 🚀 Como Aplicar

### 1. Aplicar Migration no Banco de Dados

```bash
psql -U postgres -d oingfy -f /home/unix/git/fyna/prisma/migration-add-origin.sql
```

Ou execute manualmente:

```sql
-- Adicionar coluna
ALTER TABLE "month_movimentation_items"
ADD COLUMN IF NOT EXISTS "originName" TEXT;

-- Atualizar registros existentes de crédito
UPDATE "month_movimentation_items" mmi
SET "originName" = cc.name
FROM accounts_credit ac
JOIN credit_cards cc ON ac."cardId" = cc.id
WHERE mmi."accountCreditId" = ac.id
AND mmi."accountType" = 'CREDIT'
AND mmi."originName" IS NULL;

-- Atualizar contas fixas
UPDATE "month_movimentation_items"
SET "originName" = 'Conta Fixa'
WHERE "accountType" = 'FIXED'
AND "originName" IS NULL;

-- Atualizar contas variáveis
UPDATE "month_movimentation_items"
SET "originName" = 'Conta Variável'
WHERE "accountType" = 'VARIABLE'
AND "originName" IS NULL;
```

### 2. Limpar Movimentações Antigas (Recomendado)

Para garantir que todos os novos registros tenham a origem:

```sql
DELETE FROM month_movimentation_items;
DELETE FROM month_movimentations;
```

### 3. Build do Backend

```bash
cd /home/unix/git/fyna
npm run build
pm2 restart all
```

### 4. Build do Frontend

```bash
cd /home/unix/git/fyna/frontend
npm run build
```

### 5. Testar

1. Acesse o dashboard
2. Verifique a nova coluna "Origem"
3. Compras de cartão devem mostrar o nome do cartão
4. Contas fixas devem mostrar "Conta Fixa"
5. Contas variáveis devem mostrar "Conta Variável"

## 🎯 Comportamento Esperado

### Tabela do Dashboard

| Descrição | Categoria | **Origem** | Vencimento | Status | Valor |
|-----------|-----------|------------|------------|--------|-------|
| Fatura (1/12) | Compras | **Nubank** | 15/01 | Pendente | R$ 100,00 |
| Internet | Contas | **Conta Fixa** | 10/01 | Pago | R$ 99,90 |
| Celular (2/10) | Contas | **Conta Variável** | 05/01 | Pendente | R$ 50,00 |
| Notebook (3/12) | Eletrônicos | **SpParcelado** | 20/01 | Pendente | R$ 300,00 |

## 📊 Exemplo de Dados

```typescript
// Item de crédito
{
  accountName: "Compra Amazon (1/12)",
  categoryName: "Compras",
  originName: "Nubank",  // ← Nome do cartão
  accountType: "CREDIT"
}

// Item de conta fixa
{
  accountName: "Internet Fibra",
  categoryName: "Contas",
  originName: "Conta Fixa",  // ← Tipo da conta
  accountType: "FIXED"
}

// Item de conta variável
{
  accountName: "Celular (2/10)",
  categoryName: "Contas",
  originName: "Conta Variável",  // ← Tipo da conta
  accountType: "VARIABLE"
}
```

## 🐛 Troubleshooting

### Coluna não aparece

**Solução**:
1. Verifique se a migration foi aplicada: `\d month_movimentation_items` no psql
2. Limpe cache do navegador (Ctrl + Shift + R)
3. Verifique se fez rebuild do frontend

### Origem aparece vazia

**Solução**:
1. Limpe as movimentações antigas e regenere
2. Execute a migration de atualização de registros existentes
3. Verifique se o backend foi reiniciado

### Mostra "-" ao invés do nome do cartão

**Solução**:
1. Verifique se a compra tem um cartão associado
2. Limpe as movimentações e regenere
3. Verifique os logs do backend para erros

## 💡 Benefícios

✅ **Identificação rápida**: Veja imediatamente de qual cartão é cada despesa
✅ **Organização**: Separe facilmente contas fixas, variáveis e crédito
✅ **Controle**: Saiba quanto está gastando em cada cartão
✅ **Clareza**: Não precisa clicar para ver detalhes

---

**Data**: 29/12/2025
**Versão**: 2.2 (Feature: Coluna Origem)
