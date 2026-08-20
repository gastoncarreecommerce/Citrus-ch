-- =========================================================================
-- Setup manual para correr desde el SQL Editor de Neon (console.neon.tech)
-- cuando no se tiene acceso a una terminal local para correr Prisma CLI.
--
-- Este script es equivalente a: `npm run db:push && npm run db:seed`
-- Generado a partir de prisma/schema.prisma — si el schema cambia, hay que
-- regenerar este archivo (o volver a usar la CLI de Prisma cuando se pueda).
-- =========================================================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "SellerEstado" AS ENUM ('ACTIVO', 'SUSPENDIDO', 'PENDIENTE_APROBACION');

-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('SELLER', 'ADMIN');

-- CreateEnum
CREATE TYPE "Canal" AS ENUM ('SITE', 'APP', 'MAILING');

-- CreateEnum
CREATE TYPE "EspacioEstado" AS ENUM ('BORRADOR', 'ABIERTO', 'CERRADO', 'ARCHIVADO');

-- CreateEnum
CREATE TYPE "CriterioRanking" AS ENUM ('DESCUENTO', 'SCORE_COMPUESTO');

-- CreateEnum
CREATE TYPE "PropuestaEstado" AS ENUM ('BORRADOR', 'ENVIADA', 'GANADORA', 'RECHAZADA', 'VENCIDA');

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "sellerIdVtex" TEXT NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "cuit" TEXT,
    "estado" "SellerEstado" NOT NULL DEFAULT 'ACTIVO',
    "scoreHistorico" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'SELLER',
    "sellerId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Espacio" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "canal" "Canal" NOT NULL,
    "bonificado" BOOLEAN NOT NULL DEFAULT false,
    "descuentoMinimo" DOUBLE PRECISION,
    "cupoMax" INTEGER NOT NULL DEFAULT 1,
    "fechaApertura" TIMESTAMP(3) NOT NULL,
    "fechaCierre" TIMESTAMP(3) NOT NULL,
    "estado" "EspacioEstado" NOT NULL DEFAULT 'BORRADOR',
    "criterioRanking" "CriterioRanking" NOT NULL DEFAULT 'DESCUENTO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Espacio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Propuesta" (
    "id" TEXT NOT NULL,
    "espacioId" TEXT NOT NULL,
    "sellerId" TEXT NOT NULL,
    "estado" "PropuestaEstado" NOT NULL DEFAULT 'BORRADOR',
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Propuesta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PropuestaItem" (
    "id" TEXT NOT NULL,
    "propuestaId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "nombreProducto" TEXT NOT NULL,
    "precioTachado" DOUBLE PRECISION NOT NULL,
    "precioOferta" DOUBLE PRECISION NOT NULL,
    "cuotas" INTEGER NOT NULL DEFAULT 1,
    "envioGratis" BOOLEAN NOT NULL DEFAULT false,
    "stockDisponible" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PropuestaItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Seller_sellerIdVtex_key" ON "Seller"("sellerIdVtex");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Propuesta_espacioId_idx" ON "Propuesta"("espacioId");

-- CreateIndex
CREATE INDEX "Propuesta_sellerId_idx" ON "Propuesta"("sellerId");

-- CreateIndex
CREATE INDEX "PropuestaItem_propuestaId_idx" ON "PropuestaItem"("propuestaId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Propuesta" ADD CONSTRAINT "Propuesta_espacioId_fkey" FOREIGN KEY ("espacioId") REFERENCES "Espacio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Propuesta" ADD CONSTRAINT "Propuesta_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "Seller"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PropuestaItem" ADD CONSTRAINT "PropuestaItem_propuestaId_fkey" FOREIGN KEY ("propuestaId") REFERENCES "Propuesta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- =========================================================================
-- Seed: admin de prueba + seller de prueba
--   Admin  -> admin@carrefour.com.ar / Admin123!
--   Seller -> seller@demo.com / Seller123!
-- Los hashes fueron generados con bcryptjs (10 rounds), igual que hace
-- prisma/seed.ts en runtime.
-- =========================================================================

INSERT INTO "Seller" ("id", "sellerIdVtex", "razonSocial", "cuit", "estado", "updatedAt")
VALUES ('seed-seller-demo-001', 'seller-demo-001', 'Seller Demo S.A.', '30-12345678-9', 'ACTIVO', CURRENT_TIMESTAMP)
ON CONFLICT ("sellerIdVtex") DO NOTHING;

INSERT INTO "User" ("id", "email", "passwordHash", "rol", "sellerId")
VALUES ('seed-user-admin-001', 'admin@carrefour.com.ar', '$2b$10$znzzN.4M1b6dwpXWLR7DSuPbsqHn/jsJ96FVUBUGzdXWMt.HsuDE.', 'ADMIN', NULL)
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "User" ("id", "email", "passwordHash", "rol", "sellerId")
VALUES ('seed-user-seller-001', 'seller@demo.com', '$2b$10$XnBiUye505SOaxlS7TBN1.VvkFg8o8vG.KTSoO2P4OWnOKLqwmihO', 'SELLER', 'seed-seller-demo-001')
ON CONFLICT ("email") DO NOTHING;
