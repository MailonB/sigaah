const express = require('express');
const router = express.Router();

const usuarioController = require('../controllers/usuario.controller');

const authMiddleware = require('../middlewares/auth.middleware');

router.get('/', authMiddleware, usuarioController.listar);
router.get('/:id', authMiddleware, usuarioController.buscarPorId);

router.post('/', authMiddleware, usuarioController.criar);

router.put('/:id', authMiddleware, usuarioController.atualizar);

router.delete('/:id', authMiddleware, usuarioController.excluir);

module.exports = router;