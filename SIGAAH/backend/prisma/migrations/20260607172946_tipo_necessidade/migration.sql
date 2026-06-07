-- CreateEnum
CREATE TYPE "public"."TipoNecessidade" AS ENUM ('MEDICAMENTO', 'ALIMENTACAO', 'MOBILIDADE', 'PSICOLOGICA', 'OUTRA');

-- AlterTable
ALTER TABLE "public"."necessidades_especiais" ADD COLUMN     "tipo" "public"."TipoNecessidade" NOT NULL DEFAULT 'OUTRA';
