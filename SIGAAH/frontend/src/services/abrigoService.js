import api from "./api";

export const listarAbrigos = () => api.get("/abrigos");

export const buscarAbrigoPorId = (id) => api.get(`/abrigos/${id}`);

export const criarAbrigo = (dados) => api.post("/abrigos", dados);

export const atualizarAbrigo = (id, dados) => api.put(`/abrigos/${id}`, dados);

export const excluirAbrigo = (id) => api.delete(`/abrigos/${id}`);