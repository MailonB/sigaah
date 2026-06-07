/*
  Warnings:

  - Changed the type of `status` on the `abrigos` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `perfil` on the `usuarios` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."StatusAbrigo" AS ENUM ('ATIVO', 'INATIVO', 'LOTADO', 'MANUTENCAO');

-- CreateEnum
CREATE TYPE "public"."PerfilUsuario" AS ENUM ('ADMIN', 'GESTOR', 'VOLUNTARIO');

-- AlterTable
ALTER TABLE "public"."abrigos" DROP COLUMN "status",
ADD COLUMN     "status" "public"."StatusAbrigo" NOT NULL;

-- AlterTable
ALTER TABLE "public"."usuarios" ADD COLUMN     "ativo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
DROP COLUMN "perfil",
ADD COLUMN     "perfil" "public"."PerfilUsuario" NOT NULL;
