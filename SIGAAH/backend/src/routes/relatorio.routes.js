const express = require('express');
const router = express.Router();

const controller = require('../controllers/relatorio.controller');

const authMiddleware = require('../middlewares/auth.middleware');
const permitir = require('../middlewares/perfil.middleware');

router.get(
  '/necessidades-por-abrigo',
  authMiddleware,
  permitir('ADMIN', 'GESTOR', 'VOLUNTARIO'),
  controller.necessidadesPorAbrigo
);

module.exports = router;