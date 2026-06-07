const prisma = require('../config/prisma');

class PessoaAcolhidaController {

  async listar(req, res) {
    try {

      const pessoas = await prisma.pessoaAcolhida.findMany({
        include: {
          abrigo: true,
          necessidades: true
        }
      });

      return res.json(pessoas);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }

  async buscarPorId(req, res) {
    try {

      const { id } = req.params;

      const pessoa = await prisma.pessoaAcolhida.findUnique({
        where: {
          id: Number(id)
        },
        include: {
          abrigo: true,
          necessidades: true
        }
      });

      if (!pessoa) {
        return res.status(404).json({
          erro: 'Pessoa acolhida não encontrada'
        });
      }

      return res.json(pessoa);

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
        dataNascimento,
        telefone,
        observacoes,
        sexo,
        abrigoId,
        necessidades
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

      if (cpf) {

        const cpfExistente = await prisma.pessoaAcolhida.findUnique({
          where: {
            cpf
          }
        });

        if (cpfExistente) {
          return res.status(400).json({
            erro: 'CPF já cadastrado'
          });
        }
      }

      const pessoa = await prisma.pessoaAcolhida.create({
        data: {
          nome,
          cpf,
          dataNascimento: dataNascimento
            ? new Date(dataNascimento)
            : null,
          telefone,
          observacoes,
          sexo,
          abrigoId: Number(abrigoId),
          necessidades: {
            create: necessidades || []
          }
        },
        include: {
          abrigo: true,
          necessidades: true
        }
      });

      return res.status(201).json(pessoa);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }
  async atualizar(req, res) {
  try {

    const { id } = req.params;

    const pessoaExiste = await prisma.pessoaAcolhida.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!pessoaExiste) {
      return res.status(404).json({
        erro: 'Pessoa acolhida não encontrada'
      });
    }

    const {
      nome,
      cpf,
      dataNascimento,
      telefone,
      observacoes,
      sexo,
      abrigoId,
      status
    } = req.body;

    if (cpf && cpf !== pessoaExiste.cpf) {

      const cpfExistente = await prisma.pessoaAcolhida.findUnique({
        where: {
          cpf
        }
      });

      if (cpfExistente) {
        return res.status(400).json({
          erro: 'CPF já cadastrado'
        });
      }
    }

    if (abrigoId) {

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
    }

    const pessoa = await prisma.pessoaAcolhida.update({
      where: {
        id: Number(id)
      },
      data: {
        nome: nome ?? pessoaExiste.nome,
        cpf: cpf ?? pessoaExiste.cpf,
        telefone: telefone ?? pessoaExiste.telefone,
        observacoes: observacoes ?? pessoaExiste.observacoes,
        sexo: sexo ?? pessoaExiste.sexo,
        status: status ?? pessoaExiste.status,
        abrigoId: abrigoId ?? pessoaExiste.abrigoId,
        dataNascimento: dataNascimento
          ? new Date(dataNascimento)
          : pessoaExiste.dataNascimento
          
      },
      include: {
        abrigo: true,
        necessidades: true
      }
    });

    return res.json(pessoa);

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }
}
async desligar(req, res) {
  try {

    const { id } = req.params;

    const pessoa = await prisma.pessoaAcolhida.findUnique({
      where: {
        id: Number(id)
      }
    });

    if (!pessoa) {
      return res.status(404).json({
        erro: 'Pessoa acolhida não encontrada'
      });
    }

    await prisma.pessoaAcolhida.update({
      where: {
        id: Number(id)
      },
      data: {
        status: 'DESLIGADO'
      }
    });

    return res.json({
      mensagem: 'Pessoa desligada com sucesso'
    });

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }
}

}

module.exports = new PessoaAcolhidaController();