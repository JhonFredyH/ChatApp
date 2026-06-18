import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log(' Generando hashes correctos...');

  // Usar 12 rounds como en tu authController
  const password1 = await bcrypt.hash('Test1234!', 12);
  const password2 = await bcrypt.hash('Mara2022!', 12);

  console.log('Hash para Test1234!:', password1);
  console.log('Hash para Mara2022!:', password2);

  // Eliminar usuarios existentes
  await prisma.user.deleteMany({
    where: {
      OR: [
        { email: 'juan@test.com' },
        { email: 'jhonfredyha@gmail.com' }
      ]
    }
  });
  console.log('🗑️ Usuarios anteriores eliminados');

  // Crear usuarios
  const user1 = await prisma.user.create({
    data: {
      id: 'user-1',
      email: 'juan@test.com',
      name: 'Juan Test',
      password: password1,
      role: 'USER',
      isOnline: false,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  const user2 = await prisma.user.create({
    data: {
      id: 'user-2',
      email: 'jhonfredyha@gmail.com',
      name: 'Jhon Fredy',
      password: password2,
      role: 'USER',
      isOnline: false,
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }
  });

  console.log('✅ Usuarios creados:');
  console.log('  -', user1.email, '(Test1234!)');
  console.log('  -', user2.email, '(Mara2022!)');
}

main()
  .catch((e) => console.error('❌ Error:', e))
  .finally(async () => await prisma.$disconnect());