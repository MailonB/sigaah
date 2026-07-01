import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import "./Dashboard.css";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

function Dashboard() {
  const [resumo, setResumo] = useState(null);
  const [ocupacao, setOcupacao] = useState([]);
  const [estoqueCritico, setEstoqueCritico] = useState([]);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

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

        const dadosSolicitacoes = solicitacoesResponse.data || {};

        setResumo(resumoResponse.data || {});
        setOcupacao(ocupacaoResponse.data || []);
        setEstoqueCritico(estoqueResponse.data || []);
        setMovimentacoes(movimentacoesResponse.data || []);

        setSolicitacoes([
          {
            status: "Abertas",
            total: dadosSolicitacoes.abertas || 0,
            cor: "#dc2626",
          },
          {
            status: "Em atendimento",
            total: dadosSolicitacoes.atendimento || 0,
            cor: "#f59e0b",
          },
          {
            status: "Atendidas",
            total: dadosSolicitacoes.atendidas || 0,
            cor: "#16a34a",
          },
          {
            status: "Canceladas",
            total: dadosSolicitacoes.canceladas || 0,
            cor: "#64748b",
          },
        ]);
      } catch (error) {
        console.error(error);
        setErro("Erro ao carregar dados do dashboard.");
      } finally {
        setCarregando(false);
      }
    }

    carregarDashboard();
  }, []);

  const indicadoresOcupacao = useMemo(() => {
    const capacidadeTotal = ocupacao.reduce(
      (total, abrigo) => total + Number(abrigo.capacidade || 0),
      0
    );

    const ocupadosTotal = ocupacao.reduce(
      (total, abrigo) => total + Number(abrigo.ocupados || 0),
      0
    );

    const vagasDisponiveis = ocupacao.reduce(
      (total, abrigo) => total + Number(abrigo.vagasDisponiveis || 0),
      0
    );

    const percentualGeral =
      capacidadeTotal > 0
        ? Math.round((ocupadosTotal / capacidadeTotal) * 100)
        : 0;

    const abrigosCriticos = ocupacao.filter(
      (abrigo) => Number(abrigo.percentualOcupacao || 0) >= 100
    ).length;

    const abrigosEmAlerta = ocupacao.filter((abrigo) => {
      const percentual = Number(abrigo.percentualOcupacao || 0);
      return percentual >= 80 && percentual < 100;
    }).length;

    return {
      capacidadeTotal,
      ocupadosTotal,
      vagasDisponiveis,
      percentualGeral,
      abrigosCriticos,
      abrigosEmAlerta,
    };
  }, [ocupacao]);

  const ocupacaoOrdenada = useMemo(() => {
    return [...ocupacao].sort(
      (a, b) =>
        Number(b.percentualOcupacao || 0) - Number(a.percentualOcupacao || 0)
    );
  }, [ocupacao]);

  const totalSolicitacoesAbertas =
    solicitacoes.find((item) => item.status === "Abertas")?.total || 0;

  const existemAlertas =
    indicadoresOcupacao.abrigosCriticos > 0 ||
    indicadoresOcupacao.abrigosEmAlerta > 0 ||
    estoqueCritico.length > 0 ||
    totalSolicitacoesAbertas > 0;

  if (carregando) {
    return (
      <div className="dashboard-loading">
        <div className="dashboard-spinner" />
        <p>Carregando dashboard operacional...</p>
      </div>
    );
  }

  if (erro) {
    return <p className="dashboard-error">{erro}</p>;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h2>Dashboard Operacional</h2>
          <p className="dashboard-subtitle">
            Visão geral dos abrigos, ocupação, estoque e solicitações
            humanitárias.
          </p>
        </div>

        <div className="dashboard-status">
          <span className={existemAlertas ? "status-dot alerta" : "status-dot ok"} />
          {existemAlertas ? "Atenção necessária" : "Operação estável"}
        </div>
      </div>

      <div className="cards-grid">
        <Card
          titulo="Abrigos cadastrados"
          valor={resumo?.abrigos || 0}
          descricao="Unidades disponíveis no sistema"
          tipo="primary"
        />

        <Card
          titulo="Pessoas acolhidas"
          valor={resumo?.pessoasAcolhidas || 0}
          descricao="Pessoas atualmente registradas"
          tipo="success"
        />

        <Card
          titulo="Ocupação geral"
          valor={`${indicadoresOcupacao.percentualGeral}%`}
          descricao={`${indicadoresOcupacao.ocupadosTotal} de ${indicadoresOcupacao.capacidadeTotal} vagas`}
          tipo={
            indicadoresOcupacao.percentualGeral >= 100
              ? "danger"
              : indicadoresOcupacao.percentualGeral >= 80
                ? "warning"
                : "primary"
          }
        />

        <Card
          titulo="Vagas disponíveis"
          valor={indicadoresOcupacao.vagasDisponiveis}
          descricao="Capacidade livre nos abrigos"
          tipo="success"
        />

        <Card
          titulo="Solicitações abertas"
          valor={resumo?.solicitacoesAbertas || 0}
          descricao="Demandas aguardando atendimento"
          tipo={(resumo?.solicitacoesAbertas || 0) > 0 ? "warning" : "success"}
        />

        <Card
          titulo="Estoque baixo"
          valor={resumo?.estoqueBaixo || 0}
          descricao="Itens abaixo do mínimo"
          tipo={(resumo?.estoqueBaixo || 0) > 0 ? "danger" : "success"}
        />
      </div>

      <section className="dashboard-panel alertas-panel">
        <div className="panel-header">
          <div>
            <h3>Pontos de Atenção</h3>
            <p>Resumo dos principais riscos operacionais identificados.</p>
          </div>
        </div>

        {!existemAlertas ? (
          <p className="dashboard-empty">
            Nenhum alerta crítico identificado no momento.
          </p>
        ) : (
          <div className="alertas-grid">
            <AlertaOperacional
              titulo="Abrigos lotados"
              valor={indicadoresOcupacao.abrigosCriticos}
              texto="Abrigos com ocupação igual ou superior a 100%."
              tipo="danger"
            />

            <AlertaOperacional
              titulo="Abrigos em alerta"
              valor={indicadoresOcupacao.abrigosEmAlerta}
              texto="Abrigos com ocupação acima de 80%."
              tipo="warning"
            />

            <AlertaOperacional
              titulo="Estoque crítico"
              valor={estoqueCritico.length}
              texto="Itens com quantidade abaixo do mínimo definido."
              tipo="danger"
            />

            <AlertaOperacional
              titulo="Solicitações abertas"
              valor={totalSolicitacoesAbertas}
              texto="Solicitações que ainda precisam de atendimento."
              tipo="primary"
            />
          </div>
        )}
      </section>

      <div className="dashboard-main-grid">
        <section className="dashboard-panel ocupacao-panel">
          <div className="panel-header">
            <div>
              <h3>Ocupação dos Abrigos</h3>
              <p>Acompanhamento da capacidade operacional por abrigo.</p>
            </div>
          </div>

          {ocupacaoOrdenada.length === 0 ? (
            <p className="dashboard-empty">Nenhum abrigo encontrado.</p>
          ) : (
            ocupacaoOrdenada.map((abrigo) => {
              const classe = getClasseOcupacao(abrigo.percentualOcupacao);
              const percentual = Number(abrigo.percentualOcupacao || 0);
              const critico = percentual >= 100;

              return (
                <div key={abrigo.id} className="ocupacao-item">
                  <div className="ocupacao-header">
                    <div>
                      <strong>{abrigo.nome}</strong>
                      <small>
                        {abrigo.ocupados || 0} ocupados /{" "}
                        {abrigo.capacidade || 0} capacidade
                      </small>
                    </div>

                    <span className={`ocupacao-percentual ${classe}`}>
                      {percentual}%
                    </span>
                  </div>

                  <div className="progress-bar">
                    <div
                      className={`progress-fill ${classe}`}
                      style={{
                        width: `${Math.min(percentual, 100)}%`,
                      }}
                    />
                  </div>

                  <div className="ocupacao-footer">
                    <small>
                      {abrigo.vagasDisponiveis || 0} vagas disponíveis
                    </small>

                    {critico && (
                      <span className="ocupacao-critica-texto">
                        Capacidade máxima atingida
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Solicitações por Status</h3>
              <p>Situação atual das demandas humanitárias.</p>
            </div>
          </div>

          <div className="chart-container">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={solicitacoes}>
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <Tooltip
                  cursor={{ fill: "rgba(37, 99, 235, 0.06)" }}
                  contentStyle={{
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    fontSize: 13,
                  }}
                />
                <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                  {solicitacoes.map((item) => (
                    <Cell key={item.status} fill={item.cor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>

      <div className="dashboard-secondary-grid">
        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Estoque Crítico</h3>
              <p>Itens que exigem reposição ou atenção imediata.</p>
            </div>
          </div>

          {estoqueCritico.length === 0 ? (
            <p className="dashboard-empty">Nenhum item crítico no momento.</p>
          ) : (
            <div className="table-wrapper">
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
                      <td>
                        <strong className="text-danger">
                          {item.quantidade}
                        </strong>
                      </td>
                      <td>{item.quantidadeMinima}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="dashboard-panel">
          <div className="panel-header">
            <div>
              <h3>Movimentações Recentes</h3>
              <p>Últimas alterações registradas no estoque.</p>
            </div>
          </div>

          {movimentacoes.length === 0 ? (
            <p className="dashboard-empty">Nenhuma movimentação encontrada.</p>
          ) : (
            <div className="table-wrapper">
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Tipo</th>
                    <th>Item</th>
                    <th>Qtd.</th>
                    <th>Observação</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {movimentacoes.map((mov) => (
                    <tr key={mov.id}>
                      <td>
                        <span
                          className={`badge-tipo badge-${mov.tipo?.toLowerCase()}`}
                        >
                          {traduzirTipoMovimentacao(mov.tipo)}
                        </span>
                      </td>
                      <td>{mov.item}</td>
                      <td>{mov.quantidade}</td>
                      <td>{mov.observacao || "-"}</td>
                      <td>{formatarData(mov.data)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Card({ titulo, valor, descricao, tipo = "primary" }) {
  return (
    <div className={`dashboard-card card-${tipo}`}>
      <span>{titulo}</span>
      <strong>{valor}</strong>
      {descricao && <small>{descricao}</small>}
    </div>
  );
}

function AlertaOperacional({ titulo, valor, texto, tipo }) {
  return (
    <div className={`alerta-operacional alerta-${tipo}`}>
      <div>
        <strong>{valor}</strong>
        <span>{titulo}</span>
      </div>
      <p>{texto}</p>
    </div>
  );
}

function getClasseOcupacao(percentual) {
  const valor = Number(percentual || 0);

  if (valor >= 100) return "ocupacao-critica";
  if (valor >= 80) return "ocupacao-alerta";

  return "ocupacao-normal";
}

function traduzirTipoMovimentacao(tipo) {
  const tipos = {
    ENTRADA: "Entrada",
    SAIDA: "Saída",
    BAIXA: "Baixa",
    TRANSFERENCIA: "Transferência",
  };

  return tipos[tipo] || tipo;
}

function formatarData(data) {
  if (!data) return "-";

  return new Date(data).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default Dashboard;