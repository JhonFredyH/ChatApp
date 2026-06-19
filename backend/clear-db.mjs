import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function clearDatabase() {
  console.log("🗑️  Limpiando base de datos...\n");

  try {
    // Orden importa: borrar hijos primero por las relaciones
    const directMessages = await prisma.directMessage.deleteMany();
    console.log(`✅ ${directMessages.count} mensajes directos eliminados`);

    const messages = await prisma.message.deleteMany();
    console.log(`✅ ${messages.count} mensajes eliminados`);

    const memberships = await prisma.membership.deleteMany();
    console.log(`✅ ${memberships.count} membresías eliminadas`);

    const refreshTokens = await prisma.refreshToken.deleteMany();
    console.log(`✅ ${refreshTokens.count} tokens de refresh eliminados`);

    const users = await prisma.user.deleteMany();
    console.log(`✅ ${users.count} usuarios eliminados`);

    const channels = await prisma.channel.deleteMany();
    console.log(`✅ ${channels.count} canales eliminados`);

    console.log("\n🎉 Base de datos completamente limpia");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

clearDatabase();