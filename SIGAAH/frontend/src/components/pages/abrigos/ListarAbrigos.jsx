import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { excluirAbrigo, listarAbrigos } from "../../../services/abrigoService";
import "./Abrigos.css";
import { useAuth } from "../../../context/AuthContext";



function ListarAbrigos() {
  const [abrigos, setAbrigos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const { podeGerenciar, podeExcluir } = useAuth();

  async function carregarAbrigos() {
    try {
      setCarregando(true);
      const response = await listarAbrigos();
      setAbrigos(response.data);
    } catch (error) {
      setErro("Erro ao carregar abrigos.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarAbrigos();
  }, []);

  async function handleExcluir(id) {
    const confirmar = window.confirm("Deseja realmente excluir este abrigo?");

    if (!confirmar) return;

    try {
      await excluirAbrigo(id);
      carregarAbrigos();
    } catch (error) {
      alert("Erro ao excluir abrigo.");
    }
  }

  if (carregando) return <p>Carregando abrigos...</p>;

  return (
    <div className="abrigos-page">
      <div className="page-header">
        <div>
          <h2>Abrigos</h2>
          <p>Gerencie os abrigos temporários cadastrados.</p>
        </div>
        {podeGerenciar() && (
          <Link to="/abrigos/novo" className="btn-primary">
            Novo Abrigo
          </Link>
        )}
      </div>

      {erro && <p className="error-message">{erro}</p>}

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Endereço</th>
              <th>Capacidade</th>
              <th>Status</th>
              <th>Responsável</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {abrigos.length === 0 ? (
              <tr>
                <td colSpan="6">Nenhum abrigo cadastrado.</td>
              </tr>
            ) : (
              abrigos.map((abrigo) => (
                <tr key={abrigo.id}>
                  <td>{abrigo.nome}</td>
                  <td>{abrigo.endereco}</td>
                  <td>{abrigo.capacidade}</td>
                  <td>
                    <span className={abrigo.status === "ATIVO" ? "status ativo" : "status inativo"}>
                      {abrigo.status === "ATIVO" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td>{abrigo.responsavel || "-"}</td>
                  <td className="actions">
                    {podeGerenciar() && (
                      <Link to={`/abrigos/editar/${abrigo.id}`} className="btn-edit">
                        Editar
                      </Link>
                    )}
                    {podeExcluir() && (
                      <button
                        onClick={() => handleExcluir(abrigo.id)}
                        className="btn-delete"
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

export default ListarAbrigos;