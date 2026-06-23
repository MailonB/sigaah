const prisma = require('../config/prisma');

class AbrigoController {

  async listar(req, res) {
    try {
      const abrigos = await prisma.abrigo.findMany();

      return res.json(abrigos);
    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }

  async buscarPorId(req, res) {
    try {

      const { id } = req.params;

      const abrigo = await prisma.abrigo.findUnique({
        where: {
          id: Number(id)
        }
      });

      if (!abrigo) {
        return res.status(404).json({
          erro: "Abrigo não encontrado"
        });
      }

      return res.json(abrigo);

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
      endereco,
      bairro,
      cidade,
      uf,
      cep,
      latitude,
      longitude,
      capacidade,
      responsavel,
      telefone,
      status
    } = req.body;

    const abrigo = await prisma.abrigo.create({
      data: {
        nome,
        endereco,
        bairro,
        cidade,
        uf,
        cep,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        capacidade,
        responsavel,
        telefone,
        status
      }
    });

    return res.status(201).json(abrigo);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

async atualizar(req, res) {
  try {
    const { id } = req.params;

    const {
      nome,
      endereco,
      bairro,
      cidade,
      uf,
      cep,
      latitude,
      longitude,
      capacidade,
      responsavel,
      telefone,
      status
    } = req.body;

    const abrigo = await prisma.abrigo.update({
      where: { id: Number(id) },
      data: {
        nome,
        endereco,
        bairro,
        cidade,
        uf,
        cep,
        latitude: latitude ? Number(latitude) : null,
        longitude: longitude ? Number(longitude) : null,
        capacidade,
        responsavel,
        telefone,
        status
      }
    });

    return res.json(abrigo);
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}
  async excluir(req, res) {
    try {

      const { id } = req.params;

      await prisma.abrigo.delete({
        where: {
          id: Number(id)
        }
      });

      return res.json({
        mensagem: "Abrigo removido com sucesso"
      });

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }
}

module.exports = new AbrigoController();