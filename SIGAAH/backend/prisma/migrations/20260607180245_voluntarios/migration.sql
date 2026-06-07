-- CreateEnum
CREATE TYPE "public"."EspecialidadeVoluntario" AS ENUM ('MEDICO', 'ENFERMEIRO', 'PSICOLOGO', 'BOMBEIRO', 'MOTORISTA', 'COZINHEIRO', 'ASSISTENTE_SOCIAL', 'SEGURANCA', 'OUTRO');

-- CreateTable
CREATE TABLE "public"."voluntarios" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "telefone" TEXT NOT NULL,
    "email" TEXT,
    "especialidade" "public"."EspecialidadeVoluntario" NOT NULL DEFAULT 'OUTRO',
    "disponibilidade" TEXT,
    "observacoes" TEXT,
    "ativo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voluntarios_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "voluntarios_cpf_key" ON "public"."voluntarios"("cpf");
