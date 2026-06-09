import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  excluirVoluntario,
  listarVoluntarios,
} from "../../../services/voluntarioService";
import "./Voluntarios.css";
import { useAuth } from "../../../context/AuthContext";



function ListarVoluntarios() {
  const [voluntarios, setVoluntarios] = useState([]);
  const [carregando, setCarregando] = useState(true);
const { podeGerenciar, podeExcluir } = useAuth();
  async function carregar() {
    try {
      const response = await listarVoluntarios();
      setVoluntarios(response.data);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleExcluir(id) {
    if (!window.confirm("Deseja excluir este voluntário?")) return;

    await excluirVoluntario(id);
    carregar();
  }

  if (carregando) return <p>Carregando voluntários...</p>;

  return (
    <div className="voluntarios-page">
      <div className="page-header">
        <div>
          <h2>Voluntários</h2>
          <p>Gerencie voluntários e equipes de apoio.</p>
        </div>
        {podeGerenciar() && (
          <Link to="/voluntarios/novo" className="btn-primary">
            Novo Voluntário
          </Link>
        )}
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>E-mail</th>
              <th>Especialidade</th>
              <th>Disponibilidade</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {voluntarios.length === 0 ? (
              <tr>
                <td colSpan="8">Nenhum voluntário cadastrado.</td>
              </tr>
            ) : (
              voluntarios.map((voluntario) => (
                <tr key={voluntario.id}>
                  <td>{voluntario.nome}</td>
                  <td>{voluntario.cpf}</td>
                  <td>{voluntario.telefone}</td>
                  <td>{voluntario.email || "-"}</td>
                  <td>{voluntario.especialidade}</td>
                  <td>{voluntario.disponibilidade || "-"}</td>
                  <td>
                    <span
                      className={
                        voluntario.ativo ? "status ativo" : "status inativo"
                      }
                    >
                      {voluntario.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="actions">
                    {podeGerenciar() && (
                      <Link
                        to={`/voluntarios/editar/${voluntario.id}`}
                        className="btn-edit"
                      >
                        Editar
                      </Link>
                    )}
                    {podeExcluir() && (
                      <button
                        className="btn-delete"
                        onClick={() => handleExcluir(voluntario.id)}
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

export default ListarVoluntarios;