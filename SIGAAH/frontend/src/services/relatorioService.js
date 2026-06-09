import api from "./api";

export const relatorioNecessidadesPorAbrigo = () =>
  api.get("/relatorios/necessidades-por-abrigo");

export const relatorioAbrigos = () => api.get("/abrigos");

export const relatorioPessoas = () => api.get("/pessoas-acolhidas");

export const relatorioVoluntarios = () => api.get("/voluntarios");

export const relatorioEstoque = () => api.get("/estoque");

export const relatorioSolicitacoes = () => api.get("/solicitacoes");