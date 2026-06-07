-- CreateEnum
CREATE TYPE "public"."Sexo" AS ENUM ('MASCULINO', 'FEMININO', 'OUTRO');

-- CreateEnum
CREATE TYPE "public"."StatusPessoaAcolhida" AS ENUM ('ACOLHIDO', 'TRANSFERIDO', 'DESLIGADO', 'FALECIDO');

-- AlterTable
ALTER TABLE "public"."abrigos" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "public"."pessoas_acolhidas" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "cpf" TEXT,
    "dataNascimento" TIMESTAMP(3),
    "telefone" TEXT,
    "observacoes" TEXT,
    "sexo" "public"."Sexo",
    "status" "public"."StatusPessoaAcolhida" NOT NULL DEFAULT 'ACOLHIDO',
    "abrigoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pessoas_acolhidas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."necessidades_especiais" (
    "id" SERIAL NOT NULL,
    "descricao" TEXT NOT NULL,
    "pessoaAcolhidaId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "necessidades_especiais_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pessoas_acolhidas_cpf_key" ON "public"."pessoas_acolhidas"("cpf");

-- AddForeignKey
ALTER TABLE "public"."pessoas_acolhidas" ADD CONSTRAINT "pessoas_acolhidas_abrigoId_fkey" FOREIGN KEY ("abrigoId") REFERENCES "public"."abrigos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."necessidades_especiais" ADD CONSTRAINT "necessidades_especiais_pessoaAcolhidaId_fkey" FOREIGN KEY ("pessoaAcolhidaId") REFERENCES "public"."pessoas_acolhidas"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
