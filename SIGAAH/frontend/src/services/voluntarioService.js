import api from "./api";

export const listarVoluntarios = () => api.get("/voluntarios");

export const buscarVoluntarioPorId = (id) =>
  api.get(`/voluntarios/${id}`);

export const criarVoluntario = (dados) =>
  api.post("/voluntarios", dados);

export const atualizarVoluntario = (id, dados) =>
  api.put(`/voluntarios/${id}`, dados);

export const excluirVoluntario = (id) =>
  api.delete(`/voluntarios/${id}`);