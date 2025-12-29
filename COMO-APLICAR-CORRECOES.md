# Como Aplicar as Correções do Sistema Financeiro

## ✅ Correções Aplicadas

1. **Erro JSON Parse** - Removido `null` das chamadas POST no frontend
2. **Saldo com Receitas Futuras** - Backend agora só conta receitas recebidas
3. **Missing await** - Corrigido retorno de Promise não-resolvida
4. **Migration SQL** - Script para limpar dados antigos e adicionar campo installmentNumber

## 📋 Passo a Passo

### 1. Aplicar Migration no Banco de Dados

**ATENÇÃO**: Esta migration vai **deletar todas as movimentações** existentes!

```bash
# Conecte-se ao banco PostgreSQL
psql -U postgres -d oingfy

# Execute a migration
\i /home/unix/git/fyna/prisma/migration-fix-system.sql

# Ou copie e cole o conteúdo do arquivo
```

Ou se preferir via comando:
```bash
psql -U postgres -d oingfy -f /home/unix/git/fyna/prisma/migration-fix-system.sql
```

### 2. Fazer Build do Backend

```bash
cd /home/unix/git/fyna

# Instalar dependências (se necessário)
npm install

# Fazer build
npm run build
```

### 3. Reiniciar o Backend

```bash
# Se estiver usando PM2:
pm2 restart all

# Ou se estiver rodando manualmente:
npm run start:prod

# Ou para desenvolvimento:
npm run start:dev
```

### 4. Fazer Build do Frontend

```bash
cd /home/unix/git/fyna/frontend

# Instalar dependências (se necessário)
npm install

# Fazer build
npm run build
```

### 5. Limpar Cache e Testar

1. Abra o navegador
2. Limpe o cache (Ctrl + Shift + R ou Ctrl + F5)
3. Acesse o dashboard
4. O sistema vai regenerar automaticamente as movimentações com a lógica correta

## 🧪 Testes Recomendados

### Teste 1: Saldo com Receitas Futuras

1. Crie uma receita (MoneyEntry) para dia 15 do mês atual
2. **Antes do dia 15**: Verifique que o saldo NÃO inclui esta receita
3. **Após o dia 15**: Verifique que o saldo INCLUI esta receita

✅ **Esperado**: Saldo só mostra receitas já recebidas

### Teste 2: Parcelas de Cartão

1. Crie um cartão de crédito (se ainda não tem)
2. Crie uma compra parcelada em **janeiro/2025**
3. Acesse **janeiro/2025** no dashboard
   - ✅ **Esperado**: NÃO deve mostrar nenhuma parcela (mês da compra)
4. Acesse **fevereiro/2025** no dashboard
   - ✅ **Esperado**: Deve mostrar **parcela 1/X**
5. Acesse **março/2025** no dashboard
   - ✅ **Esperado**: Deve mostrar **parcela 2/X**

### Teste 3: Marcar Pagamentos

1. Marque uma parcela como paga
2. Verifique se o saldo atualiza corretamente
3. Desmarque a parcela
4. Verifique se o saldo volta ao valor anterior

✅ **Esperado**: Saldo atualiza em tempo real

### Teste 4: Erro JSON Parse

1. Navegue entre diferentes meses
2. Clique para gerar movimentação
3. ✅ **Esperado**: NÃO deve aparecer erro "Unexpected token 'n', 'null' is not valid JSON"

## 🐛 Se Algo Der Errado

### Problema: "Error: P1000: Authentication failed against database"

**Solução**: Verifique o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="postgresql://postgres:SUA_SENHA@localhost:5432/oingfy?schema=public"
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"
PORT=3000
```

Substitua `SUA_SENHA` pela senha correta do PostgreSQL.

### Problema: "Erro ao gerar movimentação mensal"

**Solução**:
1. Verifique se a migration foi aplicada corretamente
2. Verifique se o backend foi reiniciado
3. Limpe o cache do navegador (Ctrl + Shift + R)
4. Verifique os logs do backend:
   ```bash
   pm2 logs
   # ou
   npm run start:dev
   ```

### Problema: Saldo ainda mostra receitas futuras

**Solução**:
1. Verifique se fez build do backend após as alterações
2. Verifique se o backend foi reiniciado
3. Limpe as movimentações manualmente e regenere:
   ```sql
   DELETE FROM month_movimentation_items;
   DELETE FROM month_movimentations;
   ```
4. Recarregue o dashboard

### Problema: Parcelas de cartão não aparecem

**Verificar**:
1. Você tem compras cadastradas de meses anteriores?
2. Lembre-se: Compra em janeiro → Parcela 1 aparece em fevereiro
3. Verifique se resetou os contadores (se necessário):
   ```sql
   UPDATE accounts_credit SET "installmentsPayed" = 0;
   ```

## 📊 Arquivos Modificados

- ✅ `frontend/src/lib/api.ts` - Removido `null` das chamadas POST
- ✅ `src/month-movimentation/month-movimentation.service.ts` - Filtro de receitas + await
- ✅ `src/reports/reports.service.ts` - Filtro de receitas
- ✅ `prisma/migration-fix-system.sql` - Migration completa
- ✅ `prisma/schema.prisma` - Adicionado campo installmentNumber

## 🎯 Comportamento Esperado Após Correções

### Saldo Disponível
- ✅ Mostra apenas receitas já recebidas (data passou)
- ✅ Não inclui salário futuro
- ✅ Atualiza em tempo real ao marcar pagamentos

### Parcelas de Cartão
- ✅ Primeira parcela vence no mês SEGUINTE à compra
- ✅ Cada mês mostra a parcela correspondente
- ✅ Parcelas atrasadas aparecem como OVERDUE

### Dashboard
- ✅ Carrega sem erros
- ✅ Tabela mostra todas as transações corretamente
- ✅ Cards de resumo mostram valores corretos
- ✅ Gráficos funcionam

## ❓ Dúvidas?

Se tiver problemas ou dúvidas, verifique:
1. Logs do backend (`pm2 logs` ou console do npm)
2. Console do navegador (F12 → Console)
3. Dados no banco (psql)

---

**Data das Correções**: 29/12/2024
**Versão**: 2.1 (Correção Completa)
