const prisma = require('../config/prisma');

class NecessidadeEspecialController {

  async listar(req, res) {
    try {

      const { pessoaId } = req.params;

      const pessoa = await prisma.pessoaAcolhida.findUnique({
        where: {
          id: Number(pessoaId)
        }
      });

      if (!pessoa) {
        return res.status(404).json({
          erro: 'Pessoa acolhida não encontrada'
        });
      }

      const necessidades =
        await prisma.necessidadeEspecial.findMany({
          where: {
            pessoaAcolhidaId: Number(pessoaId)
          }
        });

      return res.json(necessidades);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }

    async criar(req, res) {
    try {

      const { pessoaId } = req.params;

      const {
        tipo,
        descricao
      } = req.body;

      const pessoa =
        await prisma.pessoaAcolhida.findUnique({
          where: {
            id: Number(pessoaId)
          }
        });

      if (!pessoa) {
        return res.status(404).json({
          erro: 'Pessoa acolhida não encontrada'
        });
      }

      const necessidade =
        await prisma.necessidadeEspecial.create({
          data: {
            tipo,
            descricao,
            pessoaAcolhidaId: Number(pessoaId)
          }
        });

      return res.status(201).json(necessidade);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }
    async atualizar(req, res) {
    try {

      const {
        pessoaId,
        necessidadeId
      } = req.params;

      const necessidade =
        await prisma.necessidadeEspecial.findFirst({
          where: {
            id: Number(necessidadeId),
            pessoaAcolhidaId: Number(pessoaId)
          }
        });

      if (!necessidade) {
        return res.status(404).json({
          erro: 'Necessidade não encontrada'
        });
      }

      const {
        tipo,
        descricao
      } = req.body;

      const atualizada =
        await prisma.necessidadeEspecial.update({
          where: {
            id: Number(necessidadeId)
          },
          data: {
            tipo,
            descricao
          }
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

      const {
        pessoaId,
        necessidadeId
      } = req.params;

      const necessidade =
        await prisma.necessidadeEspecial.findFirst({
          where: {
            id: Number(necessidadeId),
            pessoaAcolhidaId: Number(pessoaId)
          }
        });

      if (!necessidade) {
        return res.status(404).json({
          erro: 'Necessidade não encontrada'
        });
      }

      await prisma.necessidadeEspecial.delete({
        where: {
          id: Number(necessidadeId)
        }
      });

      return res.json({
        mensagem: 'Necessidade removida com sucesso'
      });

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }
}

module.exports = new NecessidadeEspecialController();