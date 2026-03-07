const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const roles = [
    { name: "admin", description: "Acceso completo" },
    { name: "empleado", description: "Operacion diaria" },
    { name: "lector", description: "Solo lectura" },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      create: role,
      update: { description: role.description },
    });
  }

  const adminRole = await prisma.role.findUnique({ where: { name: "admin" } });
  const adminEmail = process.env.ADMIN_EMAIL || "admin@demo.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "Admin1234";
  const passwordHash = await bcrypt.hash(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      name: "Administrador",
      email: adminEmail,
      passwordHash,
      roleId: adminRole.id,
      isActive: true,
    },
    update: {
      roleId: adminRole.id,
      passwordHash,
      isActive: true,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completado");
  })
  .catch(async (error) => {
    await prisma.$disconnect();
    console.error(error);
    process.exit(1);
  });
