-- ============================================
-- SQL Completo para criação do banco de dados
-- ============================================

-- Criar enums
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'ADVANCED');
CREATE TYPE "AccountType" AS ENUM ('FIXED', 'VARIABLE', 'CREDIT');

-- Criar tabela de usuários
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- Criar índice único para email
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- Criar tabela de categorias
CREATE TABLE "categories" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- Criar tabela de contas fixas
CREATE TABLE "accounts_fixed" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "vencibleAt" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_fixed_pkey" PRIMARY KEY ("id")
);

-- Criar tabela de contas variáveis
CREATE TABLE "accounts_variable" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "vencibleAt" TIMESTAMP(3) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "quantity" INTEGER NOT NULL,
    "qtPayed" INTEGER NOT NULL DEFAULT 0,
    "categoryId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_variable_pkey" PRIMARY KEY ("id")
);

-- Criar tabela de cartões de crédito
CREATE TABLE "credit_cards" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "vencibleAt" TIMESTAMP(3) NOT NULL,
    "totalLimite" DECIMAL(10,2) NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "credit_cards_pkey" PRIMARY KEY ("id")
);

-- Criar tabela de contas de crédito
CREATE TABLE "accounts_credit" (
    "id" SERIAL NOT NULL,
    "cardId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "totalPrice" DECIMAL(10,2) NOT NULL,
    "installmentsPrice" DECIMAL(10,2) NOT NULL,
    "installments" INTEGER NOT NULL,
    "installmentsPayed" INTEGER NOT NULL DEFAULT 0,
    "categoryId" INTEGER NOT NULL,
    "purchaseDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "accounts_credit_pkey" PRIMARY KEY ("id")
);

-- Criar tabela de entradas de dinheiro
CREATE TABLE "money_entries" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "entryDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "money_entries_pkey" PRIMARY KEY ("id")
);

-- Criar tabela de movimentações mensais
CREATE TABLE "month_movimentations" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "totalIncome" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalExpenses" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalPaid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalPending" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "totalOverdue" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "balance" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "month_movimentations_pkey" PRIMARY KEY ("id")
);

-- Criar índice único para userId, month, year
CREATE UNIQUE INDEX "month_movimentations_userId_month_year_key" ON "month_movimentations"("userId", "month", "year");

-- Criar tabela de itens de movimentação mensal
CREATE TABLE "month_movimentation_items" (
    "id" SERIAL NOT NULL,
    "monthMovimentationId" INTEGER NOT NULL,
    "accountType" "AccountType" NOT NULL,
    "accountId" INTEGER NOT NULL,
    "accountName" TEXT NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),
    "categoryName" TEXT NOT NULL,
    "accountFixedId" INTEGER,
    "accountVariableId" INTEGER,
    "accountCreditId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "month_movimentation_items_pkey" PRIMARY KEY ("id")
);

-- Criar foreign keys
ALTER TABLE "categories" ADD CONSTRAINT "categories_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "accounts_fixed" ADD CONSTRAINT "accounts_fixed_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "accounts_fixed" ADD CONSTRAINT "accounts_fixed_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "accounts_variable" ADD CONSTRAINT "accounts_variable_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "accounts_variable" ADD CONSTRAINT "accounts_variable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "credit_cards" ADD CONSTRAINT "credit_cards_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "accounts_credit" ADD CONSTRAINT "accounts_credit_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "credit_cards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "accounts_credit" ADD CONSTRAINT "accounts_credit_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "money_entries" ADD CONSTRAINT "money_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "month_movimentations" ADD CONSTRAINT "month_movimentations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "month_movimentation_items" ADD CONSTRAINT "month_movimentation_items_monthMovimentationId_fkey" FOREIGN KEY ("monthMovimentationId") REFERENCES "month_movimentations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "month_movimentation_items" ADD CONSTRAINT "month_movimentation_items_accountFixedId_fkey" FOREIGN KEY ("accountFixedId") REFERENCES "accounts_fixed"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "month_movimentation_items" ADD CONSTRAINT "month_movimentation_items_accountVariableId_fkey" FOREIGN KEY ("accountVariableId") REFERENCES "accounts_variable"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "month_movimentation_items" ADD CONSTRAINT "month_movimentation_items_accountCreditId_fkey" FOREIGN KEY ("accountCreditId") REFERENCES "accounts_credit"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- SEED: Inserir usuário padrão
-- ============================================
-- Email: ape301@mail.com
-- Senha: #DAN2409ju

INSERT INTO "users" (email, password, nome, "createdAt", "updatedAt")
VALUES (
  'ape301@mail.com',
  '$argon2id$v=19$m=65536,t=3,p=4$/56ZJmu+s+G8tLYrEAcqNw$WSRyRDPLvgLicZZatZFtTm+EJOE6GSE6atTjTdMmMvA',
  'Usuário Padrão',
  NOW(),
  NOW()
);

