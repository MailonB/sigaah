import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { desligarPessoa, listarPessoas } from "../../../services/pessoaService";
import "./Pessoas.css";
import { useAuth } from "../../../context/AuthContext";



function ListarPessoas() {
  const [pessoas, setPessoas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { podeGerenciar, podeExcluir } = useAuth();

  async function carregar() {
    try {
      const response = await listarPessoas();
      setPessoas(response.data);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleDesligar(id) {
    if (!window.confirm("Deseja registrar a saída desta pessoa?")) return;

    await desligarPessoa(id);
    carregar();
  }

  if (carregando) return <p>Carregando pessoas...</p>;

  return (
    <div className="pessoas-page">
      <div className="page-header">
        <div>
          <h2>Pessoas Acolhidas</h2>
          <p>Controle de entrada e saída de pessoas nos abrigos.</p>
        </div>
        {podeGerenciar() && (
          <Link to="/pessoas-acolhidas/novo" className="btn-primary">
            Nova Pessoa
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
              <th>Abrigo</th>
              <th>Sexo</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {pessoas.length === 0 ? (
              <tr>
                <td colSpan="7">Nenhuma pessoa cadastrada.</td>
              </tr>
            ) : (
              pessoas.map((pessoa) => (
                <tr key={pessoa.id}>
                  <td>{pessoa.nome}</td>
                  <td>{pessoa.cpf || "-"}</td>
                  <td>{pessoa.telefone || "-"}</td>
                  <td>{pessoa.abrigo?.nome || "-"}</td>
                  <td>{pessoa.sexo || "-"}</td>
                  <td>
                    <span
                      className={
                        pessoa.status === "ACOLHIDO"
                          ? "status acolhido"
                          : "status desligado"
                      }
                    >
                      {pessoa.status}
                    </span>
                  </td>
                  <td className="actions">
                    {podeGerenciar() && (
                      <Link to={`/pessoas-acolhidas/editar/${pessoa.id}`} className="btn-edit">
                        Editar
                      </Link>
                    )}

                    {pessoa.status === "ACOLHIDO" && (
                      podeExcluir() && (
                        <button
                          className="btn-delete"
                          onClick={() => handleDesligar(pessoa.id)}
                        >
                          Registrar Saída
                        </button>
                      )
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

export default ListarPessoas;