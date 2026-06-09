import api from "./api";

export const listarSolicitacoes = () => api.get("/solicitacoes");

export const buscarSolicitacaoPorId = (id) =>
  api.get(`/solicitacoes/${id}`);

export const criarSolicitacao = (dados) =>
  api.post("/solicitacoes", dados);

export const atualizarSolicitacao = (id, dados) =>
  api.put(`/solicitacoes/${id}`, dados);

export const excluirSolicitacao = (id) =>
  api.delete(`/solicitacoes/${id}`);