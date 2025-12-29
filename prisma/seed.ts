import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

  // Hash da senha usando os mesmos parâmetros do AuthService
  const hashedPassword = await argon2.hash('#DAN2409ju', {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
  });

  // Verificar se o usuário já existe
  const existingUser = await prisma.user.findUnique({
    where: { email: 'ape301@mail.com' },
  });

  if (existingUser) {
    console.log('👤 Usuário já existe, atualizando senha...');
    await prisma.user.update({
      where: { email: 'ape301@mail.com' },
      data: {
        password: hashedPassword,
        nome: 'Usuário Padrão',
      },
    });
    console.log('✅ Usuário atualizado com sucesso!');
  } else {
    console.log('👤 Criando usuário padrão...');
    await prisma.user.create({
      data: {
        email: 'ape301@mail.com',
        password: hashedPassword,
        nome: 'Usuário Padrão',
      },
    });
    console.log('✅ Usuário criado com sucesso!');
  }

  console.log('🎉 Seed concluído!');
  console.log('📧 Email: ape301@mail.com');
  console.log('🔑 Senha: #DAN2409ju');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao executar seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

