import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  await prisma.user.upsert({
    where: { email: "admin@carrefour.com.ar" },
    update: {},
    create: {
      email: "admin@carrefour.com.ar",
      passwordHash: adminPassword,
      rol: "ADMIN",
    },
  });

  const seller = await prisma.seller.upsert({
    where: { sellerIdVtex: "seller-demo-001" },
    update: {},
    create: {
      sellerIdVtex: "seller-demo-001",
      razonSocial: "Seller Demo S.A.",
      cuit: "30-12345678-9",
      estado: "ACTIVO",
    },
  });

  const sellerPassword = await bcrypt.hash("Seller123!", 10);
  await prisma.user.upsert({
    where: { email: "seller@demo.com" },
    update: {},
    create: {
      email: "seller@demo.com",
      passwordHash: sellerPassword,
      rol: "SELLER",
      sellerId: seller.id,
    },
  });

  console.log("Seed completado:");
  console.log("  Admin  -> admin@carrefour.com.ar / Admin123!");
  console.log("  Seller -> seller@demo.com / Seller123!");
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
