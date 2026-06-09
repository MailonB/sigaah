const prisma = require('../config/prisma');

class RelatorioController {
  async necessidadesPorAbrigo(req, res) {
    try {
      const abrigos = await prisma.abrigo.findMany({
        include: {
          pessoas: {
            where: {
              status: 'ACOLHIDO'
            },
            include: {
              necessidades: true
            }
          }
        },
        orderBy: {
          nome: 'asc'
        }
      });

      const resultado = abrigos.map(abrigo => {
        const necessidades = abrigo.pessoas.flatMap(pessoa =>
          pessoa.necessidades.map(necessidade => ({
            id: necessidade.id,
            tipo: necessidade.tipo,
            descricao: necessidade.descricao,
            pessoa: {
              id: pessoa.id,
              nome: pessoa.nome
            }
          }))
        );

        return {
          abrigo: {
            id: abrigo.id,
            nome: abrigo.nome
          },
          necessidades
        };
      });

      return res.json(resultado);

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }
}

module.exports = new RelatorioController();