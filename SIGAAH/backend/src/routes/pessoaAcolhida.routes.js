const express = require('express');
const router = express.Router();

const controller = require('../controllers/pessoaAcolhida.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const permitir = require('../middlewares/perfil.middleware');

router.get(
  '/',
  authMiddleware,
  permitir('ADMIN', 'GESTOR', 'VOLUNTARIO'),
  controller.listar
);

router.get(
  '/:id',
  authMiddleware,
  permitir('ADMIN', 'GESTOR', 'VOLUNTARIO'),
  controller.buscarPorId
);

router.post(
  '/',
  authMiddleware,
  permitir('ADMIN', 'GESTOR'),
  controller.criar
);

router.put(
  '/:id',
  authMiddleware,
  permitir('ADMIN', 'GESTOR'),
  controller.atualizar
);

router.patch(
  '/:id/desligar',
  authMiddleware,
  permitir('ADMIN', 'GESTOR'),
  controller.desligar
);

module.exports = router;