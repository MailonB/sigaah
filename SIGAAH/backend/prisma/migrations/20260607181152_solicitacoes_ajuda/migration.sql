-- CreateEnum
CREATE TYPE "public"."PrioridadeSolicitacao" AS ENUM ('BAIXA', 'MEDIA', 'ALTA', 'URGENTE');

-- CreateEnum
CREATE TYPE "public"."StatusSolicitacao" AS ENUM ('ABERTA', 'EM_ATENDIMENTO', 'ATENDIDA', 'CANCELADA');

-- CreateTable
CREATE TABLE "public"."solicitacoes_ajuda" (
    "id" SERIAL NOT NULL,
    "titulo" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "prioridade" "public"."PrioridadeSolicitacao" NOT NULL DEFAULT 'MEDIA',
    "status" "public"."StatusSolicitacao" NOT NULL DEFAULT 'ABERTA',
    "abrigoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "solicitacoes_ajuda_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."solicitacoes_ajuda" ADD CONSTRAINT "solicitacoes_ajuda_abrigoId_fkey" FOREIGN KEY ("abrigoId") REFERENCES "public"."abrigos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
