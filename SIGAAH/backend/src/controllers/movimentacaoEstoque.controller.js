const prisma = require('../config/prisma');

class MovimentacaoEstoqueController {

  async entrada(req, res) {
    try {

      const { id } = req.params;

      const {
        quantidade,
        observacao
      } = req.body;

          if (!quantidade || quantidade <= 0) {
          return res.status(400).json({
          erro: 'Quantidade deve ser maior que zero'
          });
          }

      const item =
        await prisma.itemEstoque.findUnique({
          where: {
            id: Number(id)
          }
        });

      if (!item) {
        return res.status(404).json({
          erro: 'Item não encontrado'
        });
      }

const resultado = await prisma.$transaction(
  async (tx) => {

    const movimentacao =
      await tx.movimentacaoEstoque.create({
        data: {
          tipo: 'ENTRADA',
          quantidade,
          observacao,
          itemId: Number(id)
        }
      });

    await tx.itemEstoque.update({
      where: {
        id: Number(id)
      },
      data: {
        quantidade:
          item.quantidade + quantidade
      }
    });

    return movimentacao;
  }
);

return res.status(201).json(resultado);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }
    async saida(req, res) {
    try {

      const { id } = req.params;

      const {
        quantidade,
        observacao
      } = req.body;

      const item =
        await prisma.itemEstoque.findUnique({
          where: {
            id: Number(id)
          }
        });

      if (!item) {
        return res.status(404).json({
          erro: 'Item não encontrado'
        });
      }

      if (item.quantidade < quantidade) {
        return res.status(400).json({
          erro: 'Quantidade insuficiente'
        });
      }

   const resultado = await prisma.$transaction(
  async (tx) => {

    const movimentacao =
      await tx.movimentacaoEstoque.create({
        data: {
          tipo: 'SAIDA',
          quantidade,
          observacao,
          itemId: Number(id)
        }
      });

          await tx.itemEstoque.update({
            where: {
              id: Number(id)
            },
            data: {
              quantidade: {
                decrement: quantidade
              }
            }
});

    return movimentacao;
  }
);

return res.status(201).json(resultado);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }  async listar(req, res) {
    try {

      const { id } = req.params;

      const movimentacoes =
        await prisma.movimentacaoEstoque.findMany({
          where: {
            itemId: Number(id)
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

      return res.json(movimentacoes);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }
}

module.exports =
  new MovimentacaoEstoqueController();