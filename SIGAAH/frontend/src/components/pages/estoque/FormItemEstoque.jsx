import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listarAbrigos } from "../../../services/abrigoService";
import {
  atualizarItemEstoque,
  buscarItemEstoquePorId,
  criarItemEstoque,
} from "../../../services/estoqueService";
import "./Estoque.css";

function FormItemEstoque() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editando = Boolean(id);

  const [abrigos, setAbrigos] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    descricao: "",
    quantidade: 0,
    quantidadeMinima: 0,
    abrigoId: "",
  });

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        const abrigosResponse = await listarAbrigos();
        setAbrigos(abrigosResponse.data);

        if (editando) {
          const itemResponse = await buscarItemEstoquePorId(id);
          const item = itemResponse.data;

          setForm({
            nome: item.nome || "",
            descricao: item.descricao || "",
            quantidade: item.quantidade || 0,
            quantidadeMinima: item.quantidadeMinima || 0,
            abrigoId: item.abrigoId || "",
          });
        }
      } catch (error) {
        setErro("Erro ao carregar dados.");
      }
    }

    carregarDados();
  }, [id, editando]);

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
      nome: form.nome,
      descricao: form.descricao || null,
      quantidade: Number(form.quantidade),
      quantidadeMinima: Number(form.quantidadeMinima),
      abrigoId: Number(form.abrigoId),
    };

    try {
      setCarregando(true);

      if (editando) {
        await atualizarItemEstoque(id, dados);
      } else {
        await criarItemEstoque(dados);
      }

      navigate("/estoque");
    } catch (error) {
      setErro(error.response?.data?.erro || "Erro ao salvar item.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="estoque-page">
      <div className="page-header">
        <div>
          <h2>{editando ? "Editar Item" : "Novo Item de Estoque"}</h2>
          <p>Informe os dados do item disponível no abrigo.</p>
        </div>
      </div>

      {erro && <p className="error-message">{erro}</p>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome *</label>
          <input name="nome" value={form.nome} onChange={handleChange} required />
        </div>

        <div className="form-group">
          <label>Descrição</label>
          <input
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Quantidade *</label>
            <input
              type="number"
              name="quantidade"
              min="0"
              value={form.quantidade}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Quantidade mínima *</label>
            <input
              type="number"
              name="quantidadeMinima"
              min="0"
              value={form.quantidadeMinima}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Abrigo *</label>
          <select
            name="abrigoId"
            value={form.abrigoId}
            onChange={handleChange}
            required
          >
            <option value="">Selecione um abrigo</option>
            {abrigos.map((abrigo) => (
              <option key={abrigo.id} value={abrigo.id}>
                {abrigo.nome} - {abrigo.cidade}
              </option>
            ))}
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/estoque")}
          >
            Cancelar
          </button>

          <button type="submit" className="btn-primary" disabled={carregando}>
            {carregando ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default FormItemEstoque;