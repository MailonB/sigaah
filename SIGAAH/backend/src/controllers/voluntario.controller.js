const prisma = require('../config/prisma');

class VoluntarioController {

  async listar(req, res) {
    try {

      const voluntarios = await prisma.voluntario.findMany({
        orderBy: {
          nome: 'asc'
        }
      });

      return res.json(voluntarios);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }
  async buscarPorId(req, res) {
    try {

      const { id } = req.params;

      const voluntario =
        await prisma.voluntario.findUnique({
          where: {
            id: Number(id)
          }
        });

      if (!voluntario) {
        return res.status(404).json({
          erro: 'Voluntário não encontrado'
        });
      }

      return res.json(voluntario);

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
        cpf,
        telefone,
        email,
        especialidade,
        disponibilidade,
        observacoes
      } = req.body;

      const cpfExistente =
        await prisma.voluntario.findUnique({
          where: {
            cpf
          }
        });

      if (cpfExistente) {
        return res.status(400).json({
          erro: 'CPF já cadastrado'
        });
      }

      const voluntario =
        await prisma.voluntario.create({
          data: {
            nome,
            cpf,
            telefone,
            email,
            especialidade,
            disponibilidade,
            observacoes
          }
        });

      return res.status(201).json(voluntario);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }
    async atualizar(req, res) {
    try {

      const { id } = req.params;

      const voluntario =
        await prisma.voluntario.findUnique({
          where: {
            id: Number(id)
          }
        });

      if (!voluntario) {
        return res.status(404).json({
          erro: 'Voluntário não encontrado'
        });
      }

      const atualizado =
        await prisma.voluntario.update({
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

      await prisma.voluntario.delete({
        where: {
          id: Number(id)
        }
      });

      return res.json({
        mensagem: 'Voluntário removido com sucesso'
      });

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }
}

module.exports = new VoluntarioController();    