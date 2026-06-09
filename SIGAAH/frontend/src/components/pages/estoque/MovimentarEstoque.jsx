import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  buscarItemEstoquePorId,
  listarMovimentacoesItem,
  registrarEntrada,
  registrarSaida,
} from "../../../services/estoqueService";
import "./Estoque.css";

function MovimentarEstoque() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [item, setItem] = useState(null);
  const [movimentacoes, setMovimentacoes] = useState([]);
  const [form, setForm] = useState({
    tipo: "ENTRADA",
    quantidade: "",
    observacao: "",
  });

  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(false);

  async function carregar() {
    const itemResponse = await buscarItemEstoquePorId(id);
    const movResponse = await listarMovimentacoesItem(id);

    setItem(itemResponse.data);
    setMovimentacoes(movResponse.data);
  }

  useEffect(() => {
    carregar();
  }, [id]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    const dados = {
      quantidade: Number(form.quantidade),
      observacao: form.observacao || null,
    };

    try {
      setCarregando(true);

      if (form.tipo === "ENTRADA") {
        await registrarEntrada(id, dados);
      } else {
        await registrarSaida(id, dados);
      }

      setForm({
        tipo: "ENTRADA",
        quantidade: "",
        observacao: "",
      });

      await carregar();
    } catch (error) {
      setErro(error.response?.data?.erro || "Erro ao registrar movimentação.");
    } finally {
      setCarregando(false);
    }
  }

  if (!item) return <p>Carregando item...</p>;

  return (
    <div className="estoque-page">
      <div className="page-header">
        <div>
          <h2>Movimentar Estoque</h2>
          <p>
            {item.nome} — Quantidade atual: <strong>{item.quantidade}</strong>
          </p>
        </div>
      </div>

      {erro && <p className="error-message">{erro}</p>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Tipo</label>
            <select name="tipo" value={form.tipo} onChange={handleChange}>
              <option value="ENTRADA">Entrada</option>
              <option value="SAIDA">Saída</option>
            </select>
          </div>

          <div className="form-group">
            <label>Quantidade *</label>
            <input
              type="number"
              name="quantidade"
              min="1"
              value={form.quantidade}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Observação</label>
          <input
            name="observacao"
            value={form.observacao}
            onChange={handleChange}
            placeholder="Ex: doação recebida, distribuição ao abrigo..."
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/estoque")}
          >
            Voltar
          </button>

          <button type="submit" className="btn-primary" disabled={carregando}>
            {carregando ? "Registrando..." : "Registrar"}
          </button>
        </div>
      </form>

      <div className="table-card estoque-historico">
        <h3>Histórico de Movimentações</h3>

        <table className="data-table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Tipo</th>
              <th>Quantidade</th>
              <th>Observação</th>
            </tr>
          </thead>

          <tbody>
            {movimentacoes.length === 0 ? (
              <tr>
                <td colSpan="4">Nenhuma movimentação encontrada.</td>
              </tr>
            ) : (
              movimentacoes.map((mov) => (
                <tr key={mov.id}>
                  <td>{new Date(mov.createdAt).toLocaleString("pt-BR")}</td>
                  <td>{mov.tipo}</td>
                  <td>{mov.quantidade}</td>
                  <td>{mov.observacao || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default MovimentarEstoque;