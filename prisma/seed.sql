-- SQL para criar o usuário padrão manualmente
-- Email: ape301@mail.com
-- Senha: #DAN2409ju

-- Verificar se o usuário já existe e deletar se necessário
DELETE FROM users WHERE email = 'ape301@mail.com';

-- Inserir o usuário padrão
INSERT INTO users (email, password, nome, "createdAt", "updatedAt")
VALUES (
  'ape301@mail.com',
  '$argon2id$v=19$m=65536,t=3,p=4$/56ZJmu+s+G8tLYrEAcqNw$WSRyRDPLvgLicZZatZFtTm+EJOE6GSE6atTjTdMmMvA',
  'Usuário Padrão',
  NOW(),
  NOW()
);

-- Ou usar UPSERT (INSERT ... ON CONFLICT) para atualizar se já existir
-- INSERT INTO users (email, password, nome, "createdAt", "updatedAt")
-- VALUES (
--   'ape301@mail.com',
--   '$argon2id$v=19$m=65536,t=3,p=4$/56ZJmu+s+G8tLYrEAcqNw$WSRyRDPLvgLicZZatZFtTm+EJOE6GSE6atTjTdMmMvA',
--   'Usuário Padrão',
--   NOW(),
--   NOW()
-- )
-- ON CONFLICT (email) 
-- DO UPDATE SET 
--   password = EXCLUDED.password,
--   nome = EXCLUDED.nome,
--   "updatedAt" = NOW();

