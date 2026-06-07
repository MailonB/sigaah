const prisma = require('../config/prisma');

class ItemEstoqueController {

  async listar(req, res) {
    try {

      const itens = await prisma.itemEstoque.findMany({
        include: {
          abrigo: true
        },
        orderBy: {
          nome: 'asc'
        }
      });

      return res.json(itens);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }

  async buscarPorId(req, res) {
    try {

      const { id } = req.params;

      const item = await prisma.itemEstoque.findUnique({
        where: {
          id: Number(id)
        },
        include: {
          abrigo: true
        }
      });

      if (!item) {
        return res.status(404).json({
          erro: 'Item não encontrado'
        });
      }

      return res.json(item);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }

  async criar(req, res) {
    try {

      const {
        nome,
        descricao,
        quantidade,
        quantidadeMinima,
        abrigoId
      } = req.body;

      const abrigo = await prisma.abrigo.findUnique({
        where: {
          id: Number(abrigoId)
        }
      });

      if (!abrigo) {
        return res.status(404).json({
          erro: 'Abrigo não encontrado'
        });
      }

      const item = await prisma.itemEstoque.create({
        data: {
          nome,
          descricao,
          quantidade,
          quantidadeMinima,
          abrigoId: Number(abrigoId)
        }
      });

      return res.status(201).json(item);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }

  async atualizar(req, res) {
    try {

      const { id } = req.params;

      const item = await prisma.itemEstoque.findUnique({
        where: {
          id: Number(id)
        }
      });

      if (!item) {
        return res.status(404).json({
          erro: 'Item não encontrado'
        });
      }

      const atualizado = await prisma.itemEstoque.update({
        where: {
          id: Number(id)
        },
        data: req.body
      });

      return res.json(atualizado);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }

  async excluir(req, res) {
    try {

      const { id } = req.params;

      const item = await prisma.itemEstoque.findUnique({
        where: {
          id: Number(id)
        }
      });

      if (!item) {
        return res.status(404).json({
          erro: 'Item não encontrado'
        });
      }

      await prisma.itemEstoque.delete({
        where: {
          id: Number(id)
        }
      });

      return res.json({
        mensagem: 'Item removido com sucesso'
      });

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }
}

module.exports = new ItemEstoqueController();