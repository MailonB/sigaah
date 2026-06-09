import { useState } from "react";
import {
  relatorioAbrigos,
  relatorioEstoque,
  relatorioNecessidadesPorAbrigo,
  relatorioPessoas,
  relatorioSolicitacoes,
  relatorioVoluntarios,
} from "../../../services/relatorioService";
import "./Relatorios.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


function Relatorios() {
  const [tipo, setTipo] = useState("");
  const [dados, setDados] = useState([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function carregarRelatorio(tipoSelecionado) {
    setTipo(tipoSelecionado);
    setErro("");
    setCarregando(true);

    try {
      let response;

      if (tipoSelecionado === "abrigos") response = await relatorioAbrigos();
      if (tipoSelecionado === "pessoas") response = await relatorioPessoas();
      if (tipoSelecionado === "voluntarios") response = await relatorioVoluntarios();
      if (tipoSelecionado === "estoque") response = await relatorioEstoque();
      if (tipoSelecionado === "solicitacoes") response = await relatorioSolicitacoes();
      if (tipoSelecionado === "necessidades") {
        response = await relatorioNecessidadesPorAbrigo();
      }

      setDados(response.data);
    } catch (error) {
      setErro("Erro ao carregar relatório.");
    } finally {
      setCarregando(false);
    }
  }

  function exportarPDF() {
  if (!tipo || dados.length === 0) {
    alert("Selecione um relatório antes de exportar.");
    return;
  }

  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("SIGAAH - Relatório", 14, 18);

  doc.setFontSize(11);
  doc.text(`Tipo: ${tipo.toUpperCase()}`, 14, 28);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 35);

  let columns = [];
  let rows = [];

  if (tipo === "abrigos") {
    columns = ["Abrigo", "Cidade", "Responsável", "Capacidade", "Status"];
    rows = dados.map((a) => [
      a.nome,
      a.cidade,
      a.responsavel || "-",
      a.capacidade,
      a.status || "-",
    ]);
  }

  if (tipo === "pessoas") {
    columns = ["Nome", "CPF", "Sexo", "Abrigo", "Status", "Necessidades"];
    rows = dados.map((p) => [
      p.nome,
      p.cpf || "-",
      p.sexo || "-",
      p.abrigo?.nome || "-",
      p.status,
      p.necessidades?.length > 0
        ? p.necessidades
            .map((n) => `${n.tipo}: ${n.descricao || "-"}`)
            .join(" | ")
        : "-",
    ]);
  }

  if (tipo === "voluntarios") {
    columns = ["Nome", "Telefone", "Especialidade", "Disponibilidade", "Status"];
    rows = dados.map((v) => [
      v.nome,
      v.telefone,
      v.especialidade,
      v.disponibilidade || "-",
      v.ativo ? "Ativo" : "Inativo",
    ]);
  }

  if (tipo === "estoque") {
    columns = ["Item", "Abrigo", "Quantidade", "Mínima", "Situação"];
    rows = dados.map((i) => [
      i.nome,
      i.abrigo?.nome || "-",
      i.quantidade,
      i.quantidadeMinima,
      i.quantidade <= i.quantidadeMinima ? "Estoque baixo" : "Normal",
    ]);
  }

  if (tipo === "solicitacoes") {
    columns = ["Título", "Abrigo", "Prioridade", "Status", "Data"];
    rows = dados.map((s) => [
      s.titulo,
      s.abrigo?.nome || "-",
      s.prioridade,
      s.status,
      new Date(s.createdAt).toLocaleString("pt-BR"),
    ]);
  }

  if (tipo === "necessidades") {
    columns = ["Abrigo", "Pessoa", "Tipo", "Descrição"];

    rows = dados.flatMap((grupo) =>
      grupo.necessidades.length > 0
        ? grupo.necessidades.map((n) => [
            grupo.abrigo.nome,
            n.pessoa.nome,
            n.tipo,
            n.descricao || "-",
          ])
        : [[grupo.abrigo.nome, "-", "-", "Nenhuma necessidade registrada"]]
    );
  }

  autoTable(doc, {
    head: [columns],
    body: rows,
    startY: 45,
    styles: {
      fontSize: 9,
    },
    headStyles: {
      fillColor: [37, 99, 235],
    },
  });

  doc.save(`relatorio-${tipo}.pdf`);
}

  return (
    <div className="relatorios-page">
      <div className="page-header">
        <div>
          <h2>Relatórios</h2>
          <p>Central de consultas gerenciais do SIGAAH.</p>
        </div>
      </div>

      <div className="relatorios-menu">
        <button onClick={() => carregarRelatorio("abrigos")}>Abrigos</button>
        <button onClick={() => carregarRelatorio("pessoas")}>Pessoas</button>
        <button onClick={() => carregarRelatorio("voluntarios")}>Voluntários</button>
        <button onClick={() => carregarRelatorio("estoque")}>Estoque</button>
        <button onClick={() => carregarRelatorio("solicitacoes")}>Solicitações</button>
        <button onClick={() => carregarRelatorio("necessidades")}>
          Necessidades por Abrigo
        </button>
      </div>

            {tipo && dados.length > 0 && (
            <button className="btn-exportar-pdf" onClick={exportarPDF}>
            Exportar PDF
            </button>
            )}

      {carregando && <p>Carregando relatório...</p>}
      {erro && <p className="error-message">{erro}</p>}

      {!carregando && tipo === "abrigos" && <RelatorioAbrigos dados={dados} />}
      {!carregando && tipo === "pessoas" && <RelatorioPessoas dados={dados} />}
      {!carregando && tipo === "voluntarios" && <RelatorioVoluntarios dados={dados} />}
      {!carregando && tipo === "estoque" && <RelatorioEstoque dados={dados} />}
      {!carregando && tipo === "solicitacoes" && <RelatorioSolicitacoes dados={dados} />}
      {!carregando && tipo === "necessidades" && (
        <RelatorioNecessidades dados={dados} />
      )}

      {!tipo && (
        <div className="relatorio-vazio">
          <h3>Selecione um relatório</h3>
          <p>Escolha uma das opções acima para visualizar os dados.</p>
        </div>
      )}
    </div>
  );
}

function RelatorioAbrigos({ dados }) {
  return (
    <div className="table-card">
      <h3>Relatório de Abrigos</h3>

      <table className="data-table">
        <thead>
          <tr>
            <th>Abrigo</th>
            <th>Cidade</th>
            <th>Responsável</th>
            <th>Capacidade</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {dados.map((abrigo) => (
            <tr key={abrigo.id}>
              <td>{abrigo.nome}</td>
              <td>{abrigo.cidade}</td>
              <td>{abrigo.responsavel || "-"}</td>
              <td>{abrigo.capacidade}</td>
              <td>{abrigo.status || "-"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RelatorioPessoas({ dados }) {
  return (
    <div className="table-card">
      <h3>Relatório de Pessoas Acolhidas</h3>

      <table className="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Sexo</th>
            <th>Abrigo</th>
            <th>Status</th>
            <th>Necessidades</th>
          </tr>
        </thead>

        <tbody>
          {dados.map((pessoa) => (
            <tr key={pessoa.id}>
              <td>{pessoa.nome}</td>
              <td>{pessoa.cpf || "-"}</td>
              <td>{pessoa.sexo || "-"}</td>
              <td>{pessoa.abrigo?.nome || "-"}</td>
              <td>{pessoa.status}</td>
              <td>
                {pessoa.necessidades?.length > 0
                  ? pessoa.necessidades
                      .map((n) => `${n.tipo}: ${n.descricao || "-"}`)
                      .join(" | ")
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RelatorioVoluntarios({ dados }) {
  return (
    <div className="table-card">
      <h3>Relatório de Voluntários</h3>

      <table className="data-table">
        <thead>
          <tr>
            <th>Nome</th>
            <th>Telefone</th>
            <th>Especialidade</th>
            <th>Disponibilidade</th>
            <th>Status</th>
          </tr>
        </thead>

        <tbody>
          {dados.map((voluntario) => (
            <tr key={voluntario.id}>
              <td>{voluntario.nome}</td>
              <td>{voluntario.telefone}</td>
              <td>{voluntario.especialidade}</td>
              <td>{voluntario.disponibilidade || "-"}</td>
              <td>{voluntario.ativo ? "Ativo" : "Inativo"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RelatorioEstoque({ dados }) {
  return (
    <div className="table-card">
      <h3>Relatório de Estoque</h3>

      <table className="data-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Abrigo</th>
            <th>Quantidade</th>
            <th>Mínima</th>
            <th>Situação</th>
          </tr>
        </thead>

        <tbody>
          {dados.map((item) => {
            const baixo = item.quantidade <= item.quantidadeMinima;

            return (
              <tr key={item.id}>
                <td>{item.nome}</td>
                <td>{item.abrigo?.nome || "-"}</td>
                <td>{item.quantidade}</td>
                <td>{item.quantidadeMinima}</td>
                <td>{baixo ? "Estoque baixo" : "Normal"}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function RelatorioSolicitacoes({ dados }) {
  return (
    <div className="table-card">
      <h3>Relatório de Solicitações</h3>

      <table className="data-table">
        <thead>
          <tr>
            <th>Título</th>
            <th>Abrigo</th>
            <th>Prioridade</th>
            <th>Status</th>
            <th>Data</th>
          </tr>
        </thead>

        <tbody>
          {dados.map((solicitacao) => (
            <tr key={solicitacao.id}>
              <td>{solicitacao.titulo}</td>
              <td>{solicitacao.abrigo?.nome || "-"}</td>
              <td>{solicitacao.prioridade}</td>
              <td>{solicitacao.status}</td>
              <td>{new Date(solicitacao.createdAt).toLocaleString("pt-BR")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function RelatorioNecessidades({ dados }) {
  return (
    <div className="table-card">
      <h3>Relatório de Necessidades por Abrigo</h3>

      {dados.map((grupo) => (
        <div key={grupo.abrigo.id} className="necessidade-grupo">
          <h4>{grupo.abrigo.nome}</h4>

          {grupo.necessidades.length === 0 ? (
            <p>Nenhuma necessidade registrada.</p>
          ) : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Pessoa</th>
                  <th>Tipo</th>
                  <th>Descrição</th>
                </tr>
              </thead>

              <tbody>
                {grupo.necessidades.map((necessidade) => (
                  <tr key={necessidade.id}>
                    <td>{necessidade.pessoa.nome}</td>
                    <td>{necessidade.tipo}</td>
                    <td>{necessidade.descricao || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}

export default Relatorios;