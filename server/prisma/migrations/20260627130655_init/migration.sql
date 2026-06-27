-- CreateEnum
CREATE TYPE "EstadoCafe" AS ENUM ('humedo', 'seco');

-- CreateEnum
CREATE TYPE "EstadoLote" AS ENUM ('abierto', 'vendido');

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoCafe" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TipoCafe_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Compra" (
    "id" TEXT NOT NULL,
    "fecha" TEXT NOT NULL,
    "agricultor" TEXT NOT NULL,
    "tipoCafeId" TEXT NOT NULL,
    "estado" "EstadoCafe" NOT NULL,
    "kilos" DOUBLE PRECISION NOT NULL,
    "precioPorKilo" INTEGER NOT NULL,
    "costosAdicionales" JSONB NOT NULL DEFAULT '[]',
    "notas" TEXT NOT NULL DEFAULT '',
    "loteId" TEXT,
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Compra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Lote" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaCreacion" TEXT NOT NULL,
    "precioVentaPorKilo" INTEGER,
    "estado" "EstadoLote" NOT NULL DEFAULT 'abierto',
    "gastosAdicionales" JSONB NOT NULL DEFAULT '[]',
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Configuracion" (
    "id" TEXT NOT NULL,
    "porcentajePerdidaSecado" INTEGER NOT NULL DEFAULT 50,
    "costosFrecuentes" JSONB NOT NULL DEFAULT '[]',
    "usuarioId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Configuracion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Configuracion_usuarioId_key" ON "Configuracion"("usuarioId");

-- AddForeignKey
ALTER TABLE "TipoCafe" ADD CONSTRAINT "TipoCafe_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_tipoCafeId_fkey" FOREIGN KEY ("tipoCafeId") REFERENCES "TipoCafe"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_loteId_fkey" FOREIGN KEY ("loteId") REFERENCES "Lote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Compra" ADD CONSTRAINT "Compra_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Lote" ADD CONSTRAINT "Lote_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Configuracion" ADD CONSTRAINT "Configuracion_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
