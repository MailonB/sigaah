import api from "./api";

export const criarNecessidade = (pessoaId, dados) =>
  api.post(`/pessoas-acolhidas/${pessoaId}/necessidades`, dados);

export const atualizarNecessidade = (pessoaId, necessidadeId, dados) =>
  api.put(`/pessoas-acolhidas/${pessoaId}/necessidades/${necessidadeId}`, dados);

export const excluirNecessidade = (pessoaId, necessidadeId) =>
  api.delete(`/pessoas-acolhidas/${pessoaId}/necessidades/${necessidadeId}`);