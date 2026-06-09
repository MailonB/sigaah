import api from "./api";

export const listarPessoas = () => api.get("/pessoas-acolhidas");

export const buscarPessoaPorId = (id) =>
  api.get(`/pessoas-acolhidas/${id}`);

export const criarPessoa = (dados) =>
  api.post("/pessoas-acolhidas", dados);

export const atualizarPessoa = (id, dados) =>
  api.put(`/pessoas-acolhidas/${id}`, dados);

export const desligarPessoa = (id) =>
  api.patch(`/pessoas-acolhidas/${id}/desligar`);