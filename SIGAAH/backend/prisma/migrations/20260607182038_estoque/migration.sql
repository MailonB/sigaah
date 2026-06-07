-- CreateEnum
CREATE TYPE "public"."TipoMovimentacao" AS ENUM ('ENTRADA', 'SAIDA', 'DOACAO', 'AJUSTE');

-- CreateTable
CREATE TABLE "public"."itens_estoque" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT,
    "quantidade" INTEGER NOT NULL DEFAULT 0,
    "quantidadeMinima" INTEGER NOT NULL DEFAULT 0,
    "abrigoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itens_estoque_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."movimentacoes_estoque" (
    "id" SERIAL NOT NULL,
    "tipo" "public"."TipoMovimentacao" NOT NULL,
    "quantidade" INTEGER NOT NULL,
    "observacao" TEXT,
    "itemId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimentacoes_estoque_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."itens_estoque" ADD CONSTRAINT "itens_estoque_abrigoId_fkey" FOREIGN KEY ("abrigoId") REFERENCES "public"."abrigos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."movimentacoes_estoque" ADD CONSTRAINT "movimentacoes_estoque_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "public"."itens_estoque"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
