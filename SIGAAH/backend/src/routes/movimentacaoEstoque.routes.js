const express = require('express');
const router = express.Router();

const controller =
  require('../controllers/movimentacaoEstoque.controller');

const authMiddleware =
  require('../middlewares/auth.middleware');

const permitir =
  require('../middlewares/perfil.middleware');

router.post(
  '/:id/entrada',
  authMiddleware,
  permitir('ADMIN', 'GESTOR'),
  controller.entrada
);

router.post(
  '/:id/saida',
  authMiddleware,
  permitir('ADMIN', 'GESTOR'),
  controller.saida
);

router.get(
  '/:id/movimentacoes',
  authMiddleware,
  permitir('ADMIN', 'GESTOR', 'VOLUNTARIO'),
  controller.listar
);

module.exports = router;