const express = require('express');
const router = express.Router();

const controller =
  require('../controllers/necessidadeEspecial.controller');

const authMiddleware =
  require('../middlewares/auth.middleware');

const permitir =
  require('../middlewares/perfil.middleware');

router.get(
  '/:pessoaId/necessidades',
  authMiddleware,
  permitir('ADMIN', 'GESTOR', 'VOLUNTARIO'),
  controller.listar
);

router.post(
  '/:pessoaId/necessidades',
  authMiddleware,
  permitir('ADMIN', 'GESTOR'),
  controller.criar
);

router.put(
  '/:pessoaId/necessidades/:necessidadeId',
  authMiddleware,
  permitir('ADMIN', 'GESTOR'),
  controller.atualizar
);

router.delete(
  '/:pessoaId/necessidades/:necessidadeId',
  authMiddleware,
  permitir('ADMIN', 'GESTOR'),
  controller.excluir
);

module.exports = router;