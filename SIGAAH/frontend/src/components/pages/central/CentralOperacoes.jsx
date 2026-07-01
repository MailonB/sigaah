import { useEffect, useMemo, useState } from "react";
import api from "../../../services/api";
import "./CentralOperacoes.css";
import PainelClimatico from "./PainelClimatico";
import MiniMapaOperacional from "./MiniMapaOperacional";

function CentralOperacoes() {
  const [resumo, setResumo] = useState({});
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

        setResumo(resumoResponse.data || {});
        setOcupacao(ocupacaoResponse.data || []);
        setEstoqueCritico(estoqueResponse.data || []);
        setMovimentacoes(movimentacoesResponse.data || []);
        setSolicitacoes(solicitacoesResponse.data || []);
      } catch (error) {
        console.error(error);
        setErro("Erro ao carregar a central de operações.");
      } finally {
        setCarregando(false);
      }
    }

    carregarCentral();
  }, []);

  const indicadores = useMemo(() => {
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
    );

    const abrigosEmAlerta = ocupacao.filter((abrigo) => {
      const percentual = Number(abrigo.percentualOcupacao || 0);
      return percentual >= 80 && percentual < 100;
    });

    const solicitacoesPendentes = solicitacoes.filter(
      (solicitacao) =>
        solicitacao.status !== "ATENDIDA" &&
        solicitacao.status !== "CANCELADA"
    );

    const solicitacoesUrgentes = solicitacoesPendentes.filter(
      (solicitacao) => solicitacao.prioridade === "URGENTE"
    );

    return {
      capacidadeTotal,
      ocupadosTotal,
      vagasDisponiveis,
      percentualGeral,
      abrigosCriticos,
      abrigosEmAlerta,
      solicitacoesPendentes,
      solicitacoesUrgentes,
    };
  }, [ocupacao, solicitacoes]);

  const nivelCentral = useMemo(() => {
    if (
      indicadores.solicitacoesUrgentes.length > 0 ||
      indicadores.abrigosCriticos.length > 0 ||
      estoqueCritico.length >= 5
    ) {
      return {
        classe: "critico",
        texto: "Operação crítica",
        descricao: "Existem ocorrências que exigem ação imediata.",
      };
    }

    if (
      indicadores.abrigosEmAlerta.length > 0 ||
      estoqueCritico.length > 0 ||
      indicadores.solicitacoesPendentes.length > 0
    ) {
      return {
        classe: "alerta",
        texto: "Operação em atenção",
        descricao: "Existem pontos que devem ser acompanhados pela equipe.",
      };
    }

    return {
      classe: "normal",
      texto: "Operação estável",
      descricao: "Nenhum ponto crítico identificado no momento.",
    };
  }, [indicadores, estoqueCritico]);

  const abrigosOrdenados = useMemo(() => {
    return [...ocupacao].sort(
      (a, b) =>
        Number(b.percentualOcupacao || 0) - Number(a.percentualOcupacao || 0)
    );
  }, [ocupacao]);

  const abrigosParaAtencao = [
    ...indicadores.abrigosCriticos,
    ...indicadores.abrigosEmAlerta,
  ].sort(
    (a, b) =>
      Number(b.percentualOcupacao || 0) - Number(a.percentualOcupacao || 0)
  );

  if (carregando) {
    return (
      <div className="central-loading">
        <div className="central-spinner" />
        <p>Carregando central de operações...</p>
      </div>
    );
  }

  if (erro) {
    return <p className="error-message">{erro}</p>;
  }

  return (
    <div className="central-page">
      <div className="central-header">
        <div>
          <h2>Central de Operações</h2>
          <p>
            Sala de situação para acompanhamento de riscos, abrigos, estoques e
            solicitações humanitárias.
          </p>
        </div>

        <div className={`central-status status-${nivelCentral.classe}`}>
          <span />
          <div>
            <strong>{nivelCentral.texto}</strong>
            <small>{nivelCentral.descricao}</small>
          </div>
        </div>
      </div>

      <div className="central-cards">
        <Card
          titulo="Solicitações urgentes"
          valor={indicadores.solicitacoesUrgentes.length}
          descricao="Demandas com prioridade máxima"
          tipo={
            indicadores.solicitacoesUrgentes.length > 0 ? "danger" : "success"
          }
        />

        <Card
          titulo="Abrigos críticos"
          valor={indicadores.abrigosCriticos.length}
          descricao="Abrigos com lotação máxima"
          tipo={indicadores.abrigosCriticos.length > 0 ? "danger" : "success"}
        />

        <Card
          titulo="Estoque crítico"
          valor={estoqueCritico.length}
          descricao="Itens abaixo do mínimo"
          tipo={estoqueCritico.length > 0 ? "danger" : "success"}
        />

        <Card
          titulo="Ocupação geral"
          valor={`${indicadores.percentualGeral}%`}
          descricao={`${indicadores.ocupadosTotal} de ${indicadores.capacidadeTotal} vagas`}
          tipo={
            indicadores.percentualGeral >= 100
              ? "danger"
              : indicadores.percentualGeral >= 80
                ? "warning"
                : "primary"
          }
        />
      </div>

      <section className="central-panel central-prioridades">
        <div className="central-panel-header">
          <div>
            <h3>Prioridades Operacionais</h3>
            <p>Ações sugeridas com base nos dados atuais do sistema.</p>
          </div>
        </div>

        <div className="prioridades-grid">
          <Prioridade
            numero="1"
            titulo="Atender solicitações urgentes"
            texto={`${indicadores.solicitacoesUrgentes.length} solicitação(ões) urgente(s) pendente(s).`}
            tipo={
              indicadores.solicitacoesUrgentes.length > 0
                ? "danger"
                : "success"
            }
          />

          <Prioridade
            numero="2"
            titulo="Verificar capacidade dos abrigos"
            texto={`${abrigosParaAtencao.length} abrigo(s) acima do nível de atenção.`}
            tipo={abrigosParaAtencao.length > 0 ? "warning" : "success"}
          />

          <Prioridade
            numero="3"
            titulo="Repor itens de estoque"
            texto={`${estoqueCritico.length} item(ns) abaixo do estoque mínimo.`}
            tipo={estoqueCritico.length > 0 ? "danger" : "success"}
          />

          <Prioridade
            numero="4"
            titulo="Monitorar clima e mapa"
            texto="Acompanhe condições climáticas e localização dos abrigos."
            tipo="primary"
          />
        </div>
      </section>

      <PainelClimatico />

      <div className="central-grid">
        <section className="central-panel panel-danger">
          <div className="central-panel-header">
            <div>
              <h3>Solicitações Urgentes</h3>
              <p>Demandas que precisam de resposta rápida da operação.</p>
            </div>

            <span className="panel-counter danger">
              {indicadores.solicitacoesUrgentes.length}
            </span>
          </div>

          {indicadores.solicitacoesUrgentes.length === 0 ? (
            <EmptyState texto="Nenhuma solicitação urgente pendente." />
          ) : (
            indicadores.solicitacoesUrgentes.slice(0, 6).map((item) => (
              <div key={item.id} className="central-list-item danger">
                <div>
                  <strong>{item.titulo || "Solicitação sem título"}</strong>
                  <span>{item.abrigo?.nome || "Sem abrigo vinculado"}</span>
                </div>

                <div className="item-meta">
                  <small>{traduzirStatusSolicitacao(item.status)}</small>
                  <small>{formatarPrioridade(item.prioridade)}</small>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="central-panel panel-warning">
          <div className="central-panel-header">
            <div>
              <h3>Abrigos em Atenção</h3>
              <p>Unidades com ocupação elevada ou capacidade esgotada.</p>
            </div>

            <span className="panel-counter warning">
              {abrigosParaAtencao.length}
            </span>
          </div>

          {abrigosParaAtencao.length === 0 ? (
            <EmptyState texto="Nenhum abrigo crítico no momento." />
          ) : (
            abrigosParaAtencao.slice(0, 6).map((abrigo) => {
              const classe = getClasseOcupacao(abrigo.percentualOcupacao);
              const percentual = Number(abrigo.percentualOcupacao || 0);

              return (
                <div key={abrigo.id} className="central-list-item warning">
                  <div>
                    <strong>{abrigo.nome}</strong>
                    <span>
                      {abrigo.ocupados || 0}/{abrigo.capacidade || 0} pessoas
                    </span>
                  </div>

                  <div className={`ocupacao-chip ${classe}`}>
                    {percentual}%
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>

      <MiniMapaOperacional />

      <div className="central-grid">
        <section className="central-panel">
          <div className="central-panel-header">
            <div>
              <h3>Estoque Crítico</h3>
              <p>Itens que exigem reposição ou redistribuição.</p>
            </div>

            <span className="panel-counter danger">{estoqueCritico.length}</span>
          </div>

          {estoqueCritico.length === 0 ? (
            <EmptyState texto="Nenhum item em estoque crítico." />
          ) : (
            estoqueCritico.slice(0, 6).map((item) => (
              <div key={item.id} className="central-list-item">
                <div>
                  <strong>{item.nome}</strong>
                  <span>{item.abrigo?.nome || "Abrigo não informado"}</span>
                </div>

                <div className="item-meta right">
                  <small>
                    Atual: <b>{item.quantidade}</b>
                  </small>
                  <small>Mínimo: {item.quantidadeMinima}</small>
                </div>
              </div>
            ))
          )}
        </section>

        <section className="central-panel">
          <div className="central-panel-header">
            <div>
              <h3>Últimas Movimentações</h3>
              <p>Registros recentes de entrada, saída, baixa e transferência.</p>
            </div>
          </div>

          {movimentacoes.length === 0 ? (
            <EmptyState texto="Nenhuma movimentação recente." />
          ) : (
            movimentacoes.slice(0, 6).map((mov) => (
              <div key={mov.id} className="central-list-item">
                <div>
                  <strong>
                    {traduzirTipoMovimentacao(mov.tipo)} - {mov.item}
                  </strong>
                  <span>Quantidade: {mov.quantidade}</span>
                </div>

                <div className="item-meta right">
                  <small>{formatarData(mov.data)}</small>
                </div>
              </div>
            ))
          )}
        </section>
      </div>

      <section className="central-panel">
        <div className="central-panel-header">
          <div>
            <h3>Ocupação Geral dos Abrigos</h3>
            <p>Ranking dos abrigos por percentual de ocupação.</p>
          </div>

          <span className="panel-counter primary">{ocupacao.length}</span>
        </div>

        {abrigosOrdenados.length === 0 ? (
          <EmptyState texto="Nenhum dado de ocupação encontrado." />
        ) : (
          <div className="central-ocupacao-lista">
            {abrigosOrdenados.map((abrigo) => {
              const percentual = Number(abrigo.percentualOcupacao || 0);
              const classe = getClasseOcupacao(percentual);

              return (
                <div key={abrigo.id} className="central-ocupacao-item">
                  <div className="central-ocupacao-header">
                    <div>
                      <strong>{abrigo.nome}</strong>
                      <small>
                        {abrigo.ocupados || 0} ocupados |{" "}
                        {abrigo.vagasDisponiveis || 0} vagas disponíveis
                      </small>
                    </div>

                    <span className={`central-percentual ${classe}`}>
                      {percentual}%
                    </span>
                  </div>

                  <div className="central-progress-bar">
                    <div
                      className={`central-progress-fill ${classe}`}
                      style={{ width: `${Math.min(percentual, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

function Card({ titulo, valor, descricao, tipo = "primary" }) {
  return (
    <div className={`central-card card-${tipo}`}>
      <span>{titulo}</span>
      <strong>{valor}</strong>
      {descricao && <small>{descricao}</small>}
    </div>
  );
}

function Prioridade({ numero, titulo, texto, tipo }) {
  return (
    <div className={`prioridade-card prioridade-${tipo}`}>
      <div className="prioridade-numero">{numero}</div>

      <div>
        <strong>{titulo}</strong>
        <p>{texto}</p>
      </div>
    </div>
  );
}

function EmptyState({ texto }) {
  return <p className="central-empty">{texto}</p>;
}

function getClasseOcupacao(percentual) {
  const valor = Number(percentual || 0);

  if (valor >= 100) return "critica";
  if (valor >= 80) return "alerta";

  return "normal";
}

function traduzirStatusSolicitacao(status) {
  const statusMap = {
    ABERTA: "Aberta",
    EM_ATENDIMENTO: "Em atendimento",
    ATENDIDA: "Atendida",
    CANCELADA: "Cancelada",
  };

  return statusMap[status] || status || "-";
}

function formatarPrioridade(prioridade) {
  const prioridadeMap = {
    BAIXA: "Baixa",
    MEDIA: "Média",
    ALTA: "Alta",
    URGENTE: "Urgente",
  };

  return prioridadeMap[prioridade] || prioridade || "-";
}

function traduzirTipoMovimentacao(tipo) {
  const tipos = {
    ENTRADA: "Entrada",
    SAIDA: "Saída",
    BAIXA: "Baixa",
    TRANSFERENCIA: "Transferência",
  };

  return tipos[tipo] || tipo || "-";
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

export default CentralOperacoes;