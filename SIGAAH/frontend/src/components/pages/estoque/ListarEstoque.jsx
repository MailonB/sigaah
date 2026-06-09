import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  excluirItemEstoque,
  listarItensEstoque,
} from "../../../services/estoqueService";
import "./Estoque.css";
import { useAuth } from "../../../context/AuthContext";



function ListarEstoque() {
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const { podeGerenciar, podeExcluir } = useAuth();

  async function carregar() {
    try {
      const response = await listarItensEstoque();
      setItens(response.data);
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function handleExcluir(id) {
    if (!window.confirm("Deseja excluir este item?")) return;

    await excluirItemEstoque(id);
    carregar();
  }

  if (carregando) return <p>Carregando estoque...</p>;

  return (
    <div className="estoque-page">
      <div className="page-header">
        <div>
          <h2>Estoque</h2>
          <p>Controle de itens e insumos dos abrigos.</p>
        </div>
        {podeGerenciar() && (
          <Link to="/estoque/novo" className="btn-primary">
            Novo Item
          </Link>
        )}
      </div>

      <div className="table-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Descrição</th>
              <th>Abrigo</th>
              <th>Quantidade</th>
              <th>Mínima</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>

          <tbody>
            {itens.length === 0 ? (
              <tr>
                <td colSpan="7">Nenhum item cadastrado.</td>
              </tr>
            ) : (
              itens.map((item) => {
                const estoqueBaixo = item.quantidade <= item.quantidadeMinima;

                return (
                  <tr key={item.id}>
                    <td>{item.nome}</td>
                    <td>{item.descricao || "-"}</td>
                    <td>{item.abrigo?.nome || "-"}</td>
                    <td>{item.quantidade}</td>
                    <td>{item.quantidadeMinima}</td>
                    <td>
                      <span
                        className={
                          estoqueBaixo ? "status baixo" : "status normal"
                        }
                      >
                        {estoqueBaixo ? "Estoque baixo" : "Normal"}
                      </span>
                    </td>
                    <td className="actions">
                        {podeGerenciar() && (
                      <Link to={`/estoque/editar/${item.id}`} className="btn-edit">
                        Editar
                      </Link>
                          )}
                           {podeGerenciar() && (
                      <Link
                        to={`/estoque/movimentar/${item.id}`} 
                        className="btn-primary"
                      >
                        Movimentar
                      </Link>
                          )}    
                      {podeExcluir() && (
                        <button
                          className="btn-delete"
                          onClick={() => handleExcluir(item.id)}
                        >
                          Excluir
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ListarEstoque;