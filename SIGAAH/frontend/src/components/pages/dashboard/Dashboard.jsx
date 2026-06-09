import { useEffect, useState } from "react";
import api from "../../../services/api";
import "./Dashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [ocupacao, setOcupacao] = useState([]);
  const [estoqueCritico, setEstoqueCritico] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [solicitacoes, setSolicitacoes] = useState([]);
  useEffect(() => {
    async function carregarDashboard() {
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
          api.get("/dashboard/solicitacoes"),
        ]);

        setResumo(resumoResponse.data);
        setOcupacao(ocupacaoResponse.data);
        setEstoqueCritico(estoqueResponse.data);
        setMovimentacoes(movimentacoesResponse.data);
        setSolicitacoes([
            { status: "Abertas", total: solicitacoesResponse.data.abertas },
            { status: "Em atendimento", total: solicitacoesResponse.data.atendimento },
            { status: "Atendidas", total: solicitacoesResponse.data.atendidas },
            { status: "Canceladas", total: solicitacoesResponse.data.canceladas },
            ]);
      } catch (error) {
        setErro("Erro ao carregar dados do dashboard.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDashboard();
  }, []);

  if (carregando) {
    return <p>Carregando dashboard...</p>;
  }

  if (erro) {
    return <p className="dashboard-error">{erro}</p>;
  }

  return (
    <div className="dashboard">
      <h2>Dashboard Operacional</h2>
      <p className="dashboard-subtitle">
        Visão geral dos abrigos, pessoas, estoque e solicitações.
      </p>

      <div className="cards-grid">
        <Card titulo="Abrigos" valor={resumo.abrigos} />
        <Card titulo="Pessoas Acolhidas" valor={resumo.pessoasAcolhidas} />
        <Card titulo="Voluntários Ativos" valor={resumo.voluntarios} />
        <Card titulo="Solicitações Abertas" valor={resumo.solicitacoesAbertas} />
        <Card titulo="Itens em Estoque" valor={resumo.itensEstoque} />
        <Card titulo="Estoque Baixo" valor={resumo.estoqueBaixo} alerta />
      </div>

      <div className="dashboard-grid">
        <section className="dashboard-panel">
          <h3>Ocupação dos Abrigos</h3>

          {ocupacao.length === 0 ? (
            <p>Nenhum abrigo encontrado.</p>
          ) : (
            ocupacao.map((abrigo) => (
              <div key={abrigo.id} className="ocupacao-item">
                <div className="ocupacao-header">
                  <strong>{abrigo.nome}</strong>
                  <span>{abrigo.percentualOcupacao}%</span>
                </div>

                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${abrigo.percentualOcupacao}%` }}
                  />
                </div>

                <small>
                  {abrigo.ocupados} ocupados / {abrigo.capacidade} capacidade —
                  {abrigo.vagasDisponiveis} vagas disponíveis
                </small>
              </div>
            ))
          )}
        </section>

            <section className="dashboard-panel">
            <h3>Solicitações por Status</h3>

            <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={solicitacoes}>
            <XAxis dataKey="status" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="total" />
            </BarChart>
            </ResponsiveContainer>
            </div>
            </section>

        <section className="dashboard-panel">
          <h3>Estoque Crítico</h3>

          {estoqueCritico.length === 0 ? (
            <p>Nenhum item crítico no momento.</p>
          ) : (
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Abrigo</th>
                  <th>Qtd.</th>
                  <th>Mín.</th>
                </tr>
              </thead>
              <tbody>
                {estoqueCritico.map((item) => (
                  <tr key={item.id}>
                    <td>{item.nome}</td>
                    <td>{item.abrigo?.nome || "-"}</td>
                    <td>{item.quantidade}</td>
                    <td>{item.quantidadeMinima}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>

      <section className="dashboard-panel">
        <h3>Movimentações Recentes</h3>

        {movimentacoes.length === 0 ? (
          <p>Nenhuma movimentação encontrada.</p>
        ) : (
          <table className="dashboard-table">
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Item</th>
                <th>Quantidade</th>
                <th>Observação</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {movimentacoes.map((mov) => (
                <tr key={mov.id}>
                  <td>{mov.tipo}</td>
                  <td>{mov.item}</td>
                  <td>{mov.quantidade}</td>
                  <td>{mov.observacao || "-"}</td>
                  <td>{new Date(mov.data).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>



  );
}

function Card({ titulo, valor, alerta }) {
  return (
    <div className={alerta ? "dashboard-card alert" : "dashboard-card"}>
      <span>{titulo}</span>
      <strong>{valor}</strong>
    </div>
  );
}

export default Dashboard;