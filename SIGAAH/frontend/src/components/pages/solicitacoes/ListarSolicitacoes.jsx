import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  excluirSolicitacao,
  listarSolicitacoes,
} from "../../../services/solicitacaoService";
import "./Solicitacoes.css";
import { useAuth } from "../../../context/AuthContext";



function ListarSolicitacoes() {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [carregando, setCarregando] = useState(true);
 const { podeGerenciar, podeExcluir } = useAuth();
  async function carregar() {
    try {
      const response = await listarSolicitacoes();
      setSolicitacoes(response.data);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleExcluir(id) {
    if (!window.confirm("Deseja excluir esta solicitação?")) return;

    await excluirSolicitacao(id);
    carregar();
  }

  if (carregando) return <p>Carregando solicitações...</p>;

  return (
    <div className="solicitacoes-page">
      <div className="page-header">
        <div>
          <h2>Solicitações Humanitárias</h2>
          <p>Gerencie demandas de apoio, recursos e atendimento.</p>
        </div>
        {podeGerenciar() && (
          <Link to="/solicitacoes/novo" className="btn-primary">
            Nova Solicitação
          </Link>
        )}
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Abrigo</th>
              <th>Prioridade</th>
              <th>Status</th>
              <th>Data</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {solicitacoes.length === 0 ? (
              <tr>
                <td colSpan="6">Nenhuma solicitação cadastrada.</td>
              </tr>
            ) : (
              solicitacoes.map((solicitacao) => (
                <tr key={solicitacao.id}>
                  <td>
                    <strong>{solicitacao.titulo}</strong>
                    <br />
                    <small>{solicitacao.descricao}</small>
                  </td>
                  <td>{solicitacao.abrigo?.nome || "-"}</td>
                  <td>
                    <span className={`prioridade ${solicitacao.prioridade.toLowerCase()}`}>
                      {solicitacao.prioridade}
                    </span>
                  </td>
                  <td>
                    <span className={`status ${solicitacao.status.toLowerCase()}`}>
                      {solicitacao.status}
                    </span>
                  </td>
                  <td>{new Date(solicitacao.createdAt).toLocaleString("pt-BR")}</td>
                  <td className="actions">
                    {podeGerenciar() && (
                      <Link
                        to={`/solicitacoes/editar/${solicitacao.id}`}
                        className="btn-edit"
                      >
                        Editar
                      </Link>
                    )}
                    {podeExcluir() && (
                      <button
                        className="btn-delete"
                        onClick={() => handleExcluir(solicitacao.id)}
                      >
                        Excluir
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListarSolicitacoes;