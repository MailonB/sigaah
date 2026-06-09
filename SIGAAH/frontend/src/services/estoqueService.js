import api from "./api";

export const listarItensEstoque = () => api.get("/estoque");

export const buscarItemEstoquePorId = (id) => api.get(`/estoque/${id}`);

export const criarItemEstoque = (dados) => api.post("/estoque", dados);

export const atualizarItemEstoque = (id, dados) =>
  api.put(`/estoque/${id}`, dados);

export const excluirItemEstoque = (id) => api.delete(`/estoque/${id}`);

export const registrarEntrada = (id, dados) =>
  api.post(`/estoque/${id}/entrada`, dados);

export const registrarSaida = (id, dados) =>
  api.post(`/estoque/${id}/saida`, dados);

export const listarMovimentacoesItem = (id) =>
  api.get(`/estoque/${id}/movimentacoes`);