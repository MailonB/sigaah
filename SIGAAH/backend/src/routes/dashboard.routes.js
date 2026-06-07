const express = require('express');
const router = express.Router();

const controller =
  require('../controllers/dashboard.controller');

const authMiddleware =
  require('../middlewares/auth.middleware');

router.get(
  '/resumo',
  authMiddleware,
  controller.resumo
);
router.get(
  '/solicitacoes',
  authMiddleware,
  controller.solicitacoes
);

router.get(
  '/estoque-critico',
  authMiddleware,
  controller.estoqueCritico
);
router.get(
  '/pessoas-por-abrigo',
  authMiddleware,
  controller.pessoasPorAbrigo
);
router.get(
  '/voluntarios-por-especialidade',
  authMiddleware,
  controller.voluntariosPorEspecialidade
);

router.get(
  '/ocupacao-abrigos',
  authMiddleware,
  controller.ocupacaoAbrigos
);

router.get(
  '/movimentacoes-recentes',
  authMiddleware,
  controller.movimentacoesRecentes
);

module.exports = router;