const express = require("express");
const router = express.Router();

const controller = require("../controllers/pessoaAcolhida.controller");

const authMiddleware = require("../middlewares/auth.middleware");
const permitir = require("../middlewares/perfil.middleware");

router.get(
  "/",
  authMiddleware,
  permitir("ADMIN", "GESTOR", "VOLUNTARIO"),
  controller.listar
);

router.get(
  "/:id",
  authMiddleware,
  permitir("ADMIN", "GESTOR", "VOLUNTARIO"),
  controller.buscarPorId
);

router.post(
  "/",
  authMiddleware,
  permitir("ADMIN", "GESTOR"),
  controller.criar
);

router.put(
  "/:id",
  authMiddleware,
  permitir("ADMIN", "GESTOR"),
  controller.atualizar
);

router.patch(
  "/:id/desligar",
  authMiddleware,
  permitir("ADMIN", "GESTOR"),
  controller.desligar
);

router.get(
  "/:pessoaId/necessidades",
  authMiddleware,
  permitir("ADMIN", "GESTOR", "VOLUNTARIO"),
  controller.listarNecessidades
);

router.post(
  "/:pessoaId/necessidades",
  authMiddleware,
  permitir("ADMIN", "GESTOR"),
  controller.criarNecessidade
);

router.put(
  "/:pessoaId/necessidades/:necessidadeId",
  authMiddleware,
  permitir("ADMIN", "GESTOR"),
  controller.atualizarNecessidade
);

router.delete(
  "/:pessoaId/necessidades/:necessidadeId",
  authMiddleware,
  permitir("ADMIN", "GESTOR"),
  controller.excluirNecessidade
);

module.exports = router;