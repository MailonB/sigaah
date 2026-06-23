-- AlterTable
ALTER TABLE "public"."abrigos" ADD COLUMN     "bairro" TEXT,
ADD COLUMN     "cep" TEXT,
ADD COLUMN     "latitude" DOUBLE PRECISION,
ADD COLUMN     "longitude" DOUBLE PRECISION,
ADD COLUMN     "telefone" TEXT,
ADD COLUMN     "uf" TEXT;
