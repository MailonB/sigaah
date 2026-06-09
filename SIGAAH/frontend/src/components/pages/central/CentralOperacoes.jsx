import { useEffect, useState } from "react";
import api from "../../../services/api";
import "./CentralOperacoes.css";

function CentralOperacoes() {
  const [resumo, setResumo] = useState(null);
  const [ocupacao, setOcupacao] = useState([]);
  const [estoqueCritico, setEstoqueCritico] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregarCentral() {
      try {
        const [
          resumoResponse,
          ocupacaoResponse,
          estoqueResponse,
          movimentacoesResponse,
          solicitacoesResponse,
        ] = await Promise.all([
          api.get("/dashboard/resumo"),
          api.get("/dashboard/ocupacao-abrigos"),
          api.get("/dashboard/estoque-critico"),
          api.get("/dashboard/movimentacoes-recentes"),
          api.get("/solicitacoes"),
        ]);

        setResumo(resumoResponse.data);
        setOcupacao(ocupacaoResponse.data);
        setEstoqueCritico(estoqueResponse.data);
        setMovimentacoes(movimentacoesResponse.data);
        setSolicitacoes(solicitacoesResponse.data);
      } catch (error) {
        setErro("Erro ao carregar a central de operações.");
      } finally {
        setCarregando(false);
      }
    }

    carregarCentral();
  }, []);

  if (carregando) return <p>Carregando central...</p>;
  if (erro) return <p className="error-message">{erro}</p>;

  const abrigosCriticos = ocupacao.filter(
    (abrigo) => abrigo.percentualOcupacao >= 80
  );

  const solicitacoesUrgentes = solicitacoes.filter(
    (solicitacao) =>
      solicitacao.prioridade === "URGENTE" &&
      solicitacao.status !== "ATENDIDA" &&
      solicitacao.status !== "CANCELADA"
  );

  return (
    <div className="central-page">
      <div className="page-header">
        <div>
          <h2>Central de Operações</h2>
          <p>Visão gerencial para tomada de decisão em tempo real.</p>
        </div>
      </div>

      <div className="central-cards">
        <Card titulo="Abrigos" valor={resumo.abrigos} />
        <Card titulo="Pessoas Acolhidas" valor={resumo.pessoasAcolhidas} />
        <Card titulo="Estoque Baixo" valor={resumo.estoqueBaixo} alerta />
        <Card titulo="Solicitações Abertas" valor={resumo.solicitacoesAbertas} alerta />
      </div>

      <div className="central-grid">
        <section className="central-panel danger">
          <h3>🚨 Solicitações Urgentes</h3>

          {solicitacoesUrgentes.length === 0 ? (
            <p>Nenhuma solicitação urgente pendente.</p>
          ) : (
            solicitacoesUrgentes.map((item) => (
              <div key={item.id} className="alert-item">
                <strong>{item.titulo}</strong>
                <span>{item.abrigo?.nome || "-"}</span>
                <small>{item.status}</small>
              </div>
            ))
          )}
        </section>

        <section className="central-panel warning">
          <h3>⚠️ Abrigos Próximos da Lotação</h3>

          {abrigosCriticos.length === 0 ? (
            <p>Nenhum abrigo crítico no momento.</p>
          ) : (
            abrigosCriticos.map((abrigo) => (
              <div key={abrigo.id} className="alert-item">
                <strong>{abrigo.nome}</strong>
                <span>{abrigo.percentualOcupacao}% ocupado</span>
                <small>
                  {abrigo.ocupados}/{abrigo.capacidade} pessoas
                </small>
              </div>
            ))
          )}
        </section>
      </div>

      <div className="central-grid">
        <section className="central-panel">
          <h3>📦 Estoque Crítico</h3>

          {estoqueCritico.length === 0 ? (
            <p>Nenhum item em estoque crítico.</p>
          ) : (
            estoqueCritico.map((item) => (
              <div key={item.id} className="list-item">
                <strong>{item.nome}</strong>
                <span>{item.abrigo?.nome || "-"}</span>
                <small>
                  Atual: {item.quantidade} | Mínimo: {item.quantidadeMinima}
                </small>
              </div>
            ))
          )}
        </section>

        <section className="central-panel">
          <h3>🔄 Últimas Movimentações</h3>

          {movimentacoes.length === 0 ? (
            <p>Nenhuma movimentação recente.</p>
          ) : (
            movimentacoes.slice(0, 6).map((mov) => (
              <div key={mov.id} className="list-item">
                <strong>{mov.tipo} - {mov.item}</strong>
                <span>Quantidade: {mov.quantidade}</span>
                <small>{new Date(mov.data).toLocaleString("pt-BR")}</small>
              </div>
            ))
          )}
        </section>
      </div>

      <section className="central-panel">
        <h3>🏠 Ocupação Geral dos Abrigos</h3>

        {ocupacao.map((abrigo) => (
          <div key={abrigo.id} className="ocupacao-item">
            <div className="ocupacao-header">
              <strong>{abrigo.nome}</strong>
              <span>{abrigo.percentualOcupacao}%</span>
            </div>

            <div className="progress-bar">
              <div
                className={
                  abrigo.percentualOcupacao >= 80
                    ? "progress-fill danger-fill"
                    : "progress-fill"
                }
                style={{ width: `${abrigo.percentualOcupacao}%` }}
              />
            </div>

            <small>
              {abrigo.ocupados} ocupados | {abrigo.vagasDisponiveis} vagas disponíveis
            </small>
          </div>
        ))}
      </section>
    </div>
  );
}

function Card({ titulo, valor, alerta }) {
  return (
    <div className={alerta ? "central-card alert" : "central-card"}>
      <span>{titulo}</span>
      <strong>{valor}</strong>
    </div>
  );
}

export default CentralOperacoes;