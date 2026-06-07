const prisma = require('../config/prisma');

class SolicitacaoAjudaController {

  async listar(req, res) {
    try {

      const solicitacoes =
        await prisma.solicitacaoAjuda.findMany({
          include: {
            abrigo: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

      return res.json(solicitacoes);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }

  async buscarPorId(req, res) {
    try {

      const { id } = req.params;

      const solicitacao =
        await prisma.solicitacaoAjuda.findUnique({
          where: {
            id: Number(id)
          },
          include: {
            abrigo: true
          }
        });

      if (!solicitacao) {
        return res.status(404).json({
          erro: 'Solicitação não encontrada'
        });
      }

      return res.json(solicitacao);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }

  async criar(req, res) {
    try {

      const {
        titulo,
        descricao,
        prioridade,
        abrigoId
      } = req.body;

      const abrigo =
        await prisma.abrigo.findUnique({
          where: {
            id: Number(abrigoId)
          }
        });

      if (!abrigo) {
        return res.status(404).json({
          erro: 'Abrigo não encontrado'
        });
      }

      const solicitacao =
        await prisma.solicitacaoAjuda.create({
          data: {
            titulo,
            descricao,
            prioridade,
            abrigoId: Number(abrigoId)
          }
        });

      return res.status(201).json(solicitacao);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }

  async atualizar(req, res) {
    try {

      const { id } = req.params;

      const solicitacao =
        await prisma.solicitacaoAjuda.findUnique({
          where: {
            id: Number(id)
          }
        });

      if (!solicitacao) {
        return res.status(404).json({
          erro: 'Solicitação não encontrada'
        });
      }

      const atualizada =
        await prisma.solicitacaoAjuda.update({
          where: {
            id: Number(id)
          },
          data: req.body
        });

      return res.json(atualizada);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }

  async excluir(req, res) {
    try {

      const { id } = req.params;

      const solicitacao =
        await prisma.solicitacaoAjuda.findUnique({
          where: {
            id: Number(id)
          }
        });

      if (!solicitacao) {
        return res.status(404).json({
          erro: 'Solicitação não encontrada'
        });
      }

      await prisma.solicitacaoAjuda.delete({
        where: {
          id: Number(id)
        }
      });

      return res.json({
        mensagem: 'Solicitação removida com sucesso'
      });

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }
}

module.exports = new SolicitacaoAjudaController();