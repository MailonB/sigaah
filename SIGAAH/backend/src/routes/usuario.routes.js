const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuario.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const permitir = require('../middlewares/perfil.middleware');

router.get(
  '/',
  authMiddleware,
  permitir('ADMIN', 'GESTOR'),
  usuarioController.listar
);

router.get(
  '/:id',
  authMiddleware,
  permitir('ADMIN', 'GESTOR'),
  usuarioController.buscarPorId
);

router.post(
  '/',
  //authMiddleware,
  //permitir('ADMIN'),
  usuarioController.criar
);

router.put(
  '/:id',
  authMiddleware,
  permitir('ADMIN'),
  usuarioController.atualizar
);

router.delete(
  '/:id',
  authMiddleware,
  permitir('ADMIN'),
  usuarioController.excluir
);

module.exports = router;
