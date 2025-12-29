# OingFy - Sistema de Gestão Financeira Pessoal

Sistema completo de gestão financeira pessoal desenvolvido com NestJS, Prisma ORM e PostgreSQL.

## Tecnologias

- **NestJS** - Framework Node.js
- **Prisma ORM** - ORM para PostgreSQL
- **PostgreSQL** - Banco de dados
- **JWT** - Autenticação
- **Argon2id** - Hash de senhas (máxima segurança)
- **Docker** - Containerização

## Funcionalidades

### Autenticação
- Registro e login de usuários
- Autenticação via JWT
- Senhas criptografadas com Argon2id

### Categorias
- Criar categorias personalizadas (ex: Mercado, Farmácia, Luz, etc)
- Gerenciar categorias de gastos

### Contas Fixas
- Cadastrar contas fixas mensais (luz, internet, água, etc)
- Associar a categorias

### Contas Variáveis
- Cadastrar contas parceladas (apartamento, móveis, etc)
- Controlar parcelas pagas

### Cartões de Crédito
- Cadastrar múltiplos cartões
- Definir limite total
- Visualizar limite disponível em tempo real
- Calcular limite usado baseado em compras parceladas

### Compras no Crédito
- Registrar compras parceladas no cartão
- Controlar parcelas pagas automaticamente
- Associar a categorias

### Entradas de Dinheiro
- Registrar salários e outras receitas
- Filtrar por mês/ano
- Calcular total de receitas

### Movimentação Mensal (Core do Sistema)
- Gerar movimentação mensal automática
- Consolidar todas as contas do mês
- Marcar contas como PAGAS, PENDENTES ou ATRASADAS
- Calcular automaticamente:
  - Total de receitas
  - Total de despesas
  - Total pago
  - Total pendente
  - Total atrasado
  - Saldo disponível
- Atualizar status de parcelas automaticamente

### Relatórios Completos
- **Dashboard**: Visão geral completa das finanças
- **Resumo Financeiro**: Receitas, despesas e saldo por mês
- **Resumo de Cartões**: Limite disponível de cada cartão
- **Gastos por Categoria**: Análise detalhada por categoria
- **Contas a Vencer**: Próximos vencimentos (configurável)
- **Contas Atrasadas**: Identificação de pendências
- **Comparação Anual**: Evolução mês a mês

## Instalação

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose (para deploy)
- PostgreSQL (se não usar Docker)

### Configuração Local

1. Clone o repositório:
```bash
cd fyna
```

2. Instale as dependências:
```bash
npm install
```

3. Configure o arquivo `.env`:
```bash
cp .env.example .env
```

Edite o `.env` com suas configurações:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/oingfy?schema=public"
JWT_SECRET="seu-secret-super-secreto"
JWT_EXPIRES_IN="7d"
PORT=3000
```

4. Execute as migrations do Prisma:
```bash
npm run prisma:migrate
```

5. Gere o Prisma Client:
```bash
npm run prisma:generate
```

6. Inicie o servidor:
```bash
npm run start:dev
```

A API estará disponível em `http://localhost:3000`

### Deploy com Docker

1. Configure as variáveis de ambiente no `docker-compose.yml`

2. Execute:
```bash
docker-compose up -d
```

A aplicação estará rodando em `http://localhost:3000`

## API Endpoints

### Autenticação

#### Registro
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123",
  "nome": "João Silva"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Resposta:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "nome": "João Silva"
  }
}
```

### Headers Autenticados

Todos os endpoints abaixo requerem o header:
```
Authorization: Bearer {access_token}
```

### Categorias

```http
GET    /categories           # Listar todas
POST   /categories           # Criar
GET    /categories/:id       # Buscar uma
PATCH  /categories/:id       # Atualizar
DELETE /categories/:id       # Deletar
```

**Criar categoria:**
```json
{
  "name": "Mercado"
}
```

### Contas Fixas

```http
GET    /accounts-fixed       # Listar todas
POST   /accounts-fixed       # Criar
GET    /accounts-fixed/:id   # Buscar uma
PATCH  /accounts-fixed/:id   # Atualizar
DELETE /accounts-fixed/:id   # Deletar
```

**Criar conta fixa:**
```json
{
  "name": "Conta de Luz",
  "vencibleAt": "2024-01-10",
  "price": 150.50,
  "categoryId": 1
}
```

### Contas Variáveis

```http
GET    /accounts-variable           # Listar todas
POST   /accounts-variable           # Criar
GET    /accounts-variable/:id       # Buscar uma
PATCH  /accounts-variable/:id       # Atualizar
DELETE /accounts-variable/:id       # Deletar
POST   /accounts-variable/:id/pay   # Pagar parcela
```

**Criar conta variável:**
```json
{
  "name": "Parcela Apartamento",
  "vencibleAt": "2024-01-15",
  "price": 2000.00,
  "quantity": 120,
  "categoryId": 2
}
```

### Cartões de Crédito

```http
GET    /credit-cards                      # Listar todos
POST   /credit-cards                      # Criar
GET    /credit-cards/:id                  # Buscar um
GET    /credit-cards/:id/available-limit  # Limite disponível
PATCH  /credit-cards/:id                  # Atualizar
DELETE /credit-cards/:id                  # Deletar
```

**Criar cartão:**
```json
{
  "name": "Nubank",
  "vencibleAt": "2024-01-05",
  "totalLimite": 5000.00
}
```

### Compras no Crédito

```http
GET    /accounts-credit           # Listar todas
GET    /accounts-credit?cardId=1  # Filtrar por cartão
POST   /accounts-credit           # Criar
GET    /accounts-credit/:id       # Buscar uma
PATCH  /accounts-credit/:id       # Atualizar
DELETE /accounts-credit/:id       # Deletar
POST   /accounts-credit/:id/pay   # Pagar parcela
```

**Criar compra parcelada:**
```json
{
  "cardId": 1,
  "name": "Televisão Samsung",
  "totalPrice": 3000.00,
  "installmentsPrice": 300.00,
  "installments": 10,
  "categoryId": 3,
  "purchaseDate": "2024-01-20"
}
```

### Entradas de Dinheiro

```http
GET    /money-entries                           # Listar todas
GET    /money-entries/by-month?month=1&year=2024 # Por mês
GET    /money-entries/total-by-month?month=1&year=2024 # Total do mês
POST   /money-entries                            # Criar
GET    /money-entries/:id                        # Buscar uma
PATCH  /money-entries/:id                        # Atualizar
DELETE /money-entries/:id                        # Deletar
```

**Criar entrada:**
```json
{
  "name": "Salário Janeiro",
  "entryDate": "2024-01-05",
  "amount": 5000.00
}
```

### Movimentação Mensal

```http
POST /month-movimentation/generate?month=1&year=2024      # Gerar movimentação
POST /month-movimentation/update?month=1&year=2024        # Atualizar
GET  /month-movimentation                                 # Listar todas
GET  /month-movimentation/by-month?month=1&year=2024      # Buscar por mês
GET  /month-movimentation/by-category?month=1&year=2024   # Agrupar por categoria
POST /month-movimentation/items/:itemId/pay               # Marcar como pago
POST /month-movimentation/items/:itemId/unpay             # Desmarcar pagamento
```

### Relatórios

```http
GET /reports/dashboard                              # Dashboard completo
GET /reports/financial-summary?month=1&year=2024    # Resumo financeiro
GET /reports/credit-cards-summary                   # Resumo dos cartões
GET /reports/expenses-by-category?month=1&year=2024 # Gastos por categoria
GET /reports/upcoming-bills?days=7                  # Contas a vencer
GET /reports/overdue-bills                          # Contas atrasadas
GET /reports/yearly-comparison?year=2024            # Comparação anual
```

**Resposta do Dashboard:**
```json
{
  "month": 1,
  "year": 2024,
  "financialSummary": {
    "totalIncome": 5000.00,
    "totalExpenses": 3500.00,
    "totalPaid": 2000.00,
    "totalPending": 1500.00,
    "totalOverdue": 0,
    "balance": 3000.00,
    "availableMoney": 3000.00
  },
  "creditCardsSummary": [
    {
      "id": 1,
      "name": "Nubank",
      "totalLimit": 5000.00,
      "usedLimit": 2000.00,
      "availableLimit": 3000.00,
      "usagePercentage": 40.00,
      "activeAccounts": 2
    }
  ],
  "expensesByCategory": [...],
  "upcomingBills": [...],
  "overdueBills": [...]
}
```

## Fluxo de Uso

1. **Cadastro/Login**: Crie sua conta e faça login
2. **Criar Categorias**: Crie categorias para organizar seus gastos
3. **Cadastrar Cartões**: Adicione seus cartões de crédito
4. **Cadastrar Contas**: Adicione contas fixas e variáveis
5. **Registrar Compras**: Cadastre compras no crédito
6. **Adicionar Receitas**: Registre seus salários
7. **Gerar Movimentação**: Gere a movimentação do mês atual
8. **Acompanhar**: Use os relatórios para controlar suas finanças
9. **Marcar Pagamentos**: Conforme paga as contas, marque como pago
10. **Atualizar**: Sistema atualiza automaticamente saldos e limites

## Scripts Úteis

```bash
npm run start:dev      # Desenvolvimento
npm run build          # Build para produção
npm run start:prod     # Executar produção
npm run prisma:migrate # Executar migrations
npm run prisma:studio  # Interface visual do banco
npm run lint           # Linter
npm run test           # Testes
```

## Estrutura do Projeto

```
src/
├── auth/                 # Autenticação JWT
├── users/                # Gerenciamento de usuários
├── categories/           # Categorias
├── accounts-fixed/       # Contas fixas
├── accounts-variable/    # Contas variáveis
├── credit-cards/         # Cartões de crédito
├── accounts-credit/      # Compras no crédito
├── money-entries/        # Entradas de dinheiro
├── month-movimentation/  # Movimentação mensal
├── reports/              # Relatórios e dashboard
├── prisma/               # Prisma service
├── app.module.ts         # Módulo principal
└── main.ts               # Entry point
```

## Segurança

- Senhas criptografadas com Argon2id (máxima segurança)
- Autenticação via JWT
- Todas as rotas protegidas (exceto login/registro)
- Validação de dados em todos os endpoints
- Isolamento de dados por usuário

## Suporte

Para dúvidas ou problemas, abra uma issue no repositório.

## Licença

MIT
