const express = require('express');
const router = express.Router();

const abrigoController = require('../controllers/abrigo.controller');

router.get('/', abrigoController.listar);
router.get('/:id', abrigoController.buscarPorId);

router.post('/', abrigoController.criar);

router.put('/:id', abrigoController.atualizar);

router.delete('/:id', abrigoController.excluir);

module.exports = router;