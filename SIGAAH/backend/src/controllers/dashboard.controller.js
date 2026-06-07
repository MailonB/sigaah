const prisma = require('../config/prisma');

class DashboardController {

  async resumo(req, res) {
    try {

      const [
        abrigos,
        pessoasAcolhidas,
        voluntarios,
        solicitacoesAbertas,
        itensEstoque
      ] = await Promise.all([

        prisma.abrigo.count(),

        prisma.pessoaAcolhida.count(),

        prisma.voluntario.count({
          where: {
            ativo: true
          }
        }),

        prisma.solicitacaoAjuda.count({
          where: {
            status: 'ABERTA'
          }
        }),

        prisma.itemEstoque.count()

      ]);

      const estoqueBaixo =
        (
          await prisma.itemEstoque.findMany()
        ).filter(item =>
          item.quantidade <= item.quantidadeMinima
        ).length;

      return res.json({
        abrigos,
        pessoasAcolhidas,
        voluntarios,
        solicitacoesAbertas,
        itensEstoque,
        estoqueBaixo
      });

    } catch (error) {
      return res.status(500).json({
        erro: error.message
      });
    }
  }

async solicitacoes(req, res) {
  try {

    const abertas =
      await prisma.solicitacaoAjuda.count({
        where: {
          status: 'ABERTA'
        }
      });

    const atendimento =
      await prisma.solicitacaoAjuda.count({
        where: {
          status: 'EM_ATENDIMENTO'
        }
      });

    const atendidas =
      await prisma.solicitacaoAjuda.count({
        where: {
          status: 'ATENDIDA'
        }
      });

    const canceladas =
      await prisma.solicitacaoAjuda.count({
        where: {
          status: 'CANCELADA'
        }
      });

    return res.json({
      abertas,
      atendimento,
      atendidas,
      canceladas
    });

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }

}

async estoqueCritico(req, res) {
  try {

    const itens =
      await prisma.itemEstoque.findMany({
        include: {
          abrigo: true
        }
      });

    const criticos =
      itens.filter(item =>
        item.quantidade <= item.quantidadeMinima
      );

    return res.json(criticos);

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }
}

async pessoasPorAbrigo(req, res) {
  try {

    const abrigos =
      await prisma.abrigo.findMany({
        include: {
          pessoas: true
        }
      });

    const resultado =
      abrigos.map(abrigo => ({
        id: abrigo.id,
        nome: abrigo.nome,
        totalPessoas: abrigo.pessoas.length
      }));

    return res.json(resultado);

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }
}
async voluntariosPorEspecialidade(req, res) {
  try {

    const especialidades =
      await prisma.voluntario.groupBy({
        by: ['especialidade'],
        _count: {
          id: true
        }
      });

    const resultado =
      especialidades.map(item => ({
        especialidade: item.especialidade,
        total: item._count.id
      }));

    return res.json(resultado);

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }
}
async ocupacaoAbrigos(req, res) {
  try {

    const abrigos = await prisma.abrigo.findMany({
      include: {
        pessoas: true
      }
    });

    const resultado = abrigos.map(abrigo => {

      const ocupados = abrigo.pessoas.length;

      const percentual =
        abrigo.capacidade > 0
          ? Number(
              (
                (ocupados / abrigo.capacidade) * 100
              ).toFixed(2)
            )
          : 0;

      return {
        id: abrigo.id,
        nome: abrigo.nome,
        capacidade: abrigo.capacidade,
        ocupados,
        vagasDisponiveis:
          abrigo.capacidade - ocupados,
        percentualOcupacao: percentual
      };
    });

    return res.json(resultado);

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }
}
async movimentacoesRecentes(req, res) {
  try {

    const movimentacoes =
      await prisma.movimentacaoEstoque.findMany({
        take: 10,
        orderBy: {
          createdAt: 'desc'
        },
        include: {
          item: true
        }
      });

    const resultado =
      movimentacoes.map(mov => ({
        id: mov.id,
        tipo: mov.tipo,
        item: mov.item.nome,
        quantidade: mov.quantidade,
        observacao: mov.observacao,
        data: mov.createdAt
      }));

    return res.json(resultado);

  } catch (error) {
    return res.status(500).json({
      erro: error.message
    });
  }
}

}

module.exports = new DashboardController();