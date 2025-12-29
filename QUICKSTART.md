# Quick Start - OingFy

## Iniciar Rapidamente

### Opção 1: Docker (Recomendado)

```bash
# Iniciar todo o sistema (PostgreSQL + API)
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Parar
docker-compose down
```

A API estará em: `http://localhost:3000`

### Opção 2: Local

```bash
# Instalar dependências
npm install

# Copiar .env
cp .env.example .env

# Configurar PostgreSQL no .env
# DATABASE_URL="postgresql://usuario:senha@localhost:5432/oingfy?schema=public"

# Rodar migrations
npm run prisma:migrate

# Gerar Prisma Client
npm run prisma:generate

# Iniciar em desenvolvimento
npm run start:dev
```

## Primeiro Uso

### 1. Registrar Usuário

```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seu@email.com",
    "password": "senha123",
    "nome": "Seu Nome"
  }'
```

Você receberá um `access_token`. Guarde-o!

### 2. Criar Categorias

```bash
# Substituir SEU_TOKEN pelo access_token recebido
curl -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Mercado"}'

curl -X POST http://localhost:3000/categories \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Contas Fixas"}'
```

### 3. Cadastrar uma Conta Fixa

```bash
curl -X POST http://localhost:3000/accounts-fixed \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Internet",
    "vencibleAt": "2024-01-10",
    "price": 100.00,
    "categoryId": 2
  }'
```

### 4. Registrar um Salário

```bash
curl -X POST http://localhost:3000/money-entries \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Salário Janeiro",
    "entryDate": "2024-01-05",
    "amount": 5000.00
  }'
```

### 5. Gerar Movimentação do Mês

```bash
curl -X POST "http://localhost:3000/month-movimentation/generate?month=1&year=2024" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### 6. Ver Dashboard

```bash
curl -X GET http://localhost:3000/reports/dashboard \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Comandos Úteis

### Prisma Studio (Interface Visual)
```bash
npm run prisma:studio
```
Abre em: `http://localhost:5555`

### Ver todas as categorias
```bash
curl -X GET http://localhost:3000/categories \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Ver resumo financeiro
```bash
curl -X GET "http://localhost:3000/reports/financial-summary?month=1&year=2024" \
  -H "Authorization: Bearer SEU_TOKEN"
```

### Marcar conta como paga
```bash
# itemId é retornado na movimentação mensal
curl -X POST http://localhost:3000/month-movimentation/items/1/pay \
  -H "Authorization: Bearer SEU_TOKEN"
```

## Testar com Postman/Insomnia

Importe a collection:

**Base URL:** `http://localhost:3000`

**Endpoints principais:**
- POST `/auth/register` - Registrar
- POST `/auth/login` - Login
- GET `/reports/dashboard` - Dashboard (requer auth)
- POST `/month-movimentation/generate?month=X&year=Y` - Gerar mês

## Dicas

1. Sempre gere a movimentação do mês antes de visualizar os relatórios
2. Use o Prisma Studio para ver os dados no banco visualmente
3. O sistema atualiza automaticamente os limites dos cartões
4. Contas atrasadas são marcadas automaticamente
5. Use o endpoint `/reports/dashboard` para ter uma visão completa

## Troubleshooting

### Erro de conexão com banco
- Verifique se o PostgreSQL está rodando
- Confirme a `DATABASE_URL` no `.env`

### Token inválido
- Faça login novamente para obter novo token
- Verifique se o token está no header: `Authorization: Bearer TOKEN`

### Migrations não executadas
```bash
npm run prisma:migrate
npm run prisma:generate
```
