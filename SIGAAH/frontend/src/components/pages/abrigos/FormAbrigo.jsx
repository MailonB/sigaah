import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  atualizarAbrigo,
  buscarAbrigoPorId,
  criarAbrigo,
} from "../../../services/abrigoService";


import "./Abrigos.css";

function FormAbrigo() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editando = Boolean(id);

  const [form, setForm] = useState({
  nome: "",
  endereco: "",
  cidade: "",
  capacidade: "",
  responsavel: "",
  telefone: "",
  status: "ATIVO",
});

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarAbrigo() {
      if (!editando) return;

      try {
        setCarregando(true);
        const response = await buscarAbrigoPorId(id);

          setForm({
            nome: response.data.nome || "",
            endereco: response.data.endereco || "",
            cidade: response.data.cidade || "",
            capacidade: response.data.capacidade || "",
            responsavel: response.data.responsavel || "",
            telefone: response.data.telefone || "",
            status: response.data.status || "ATIVO",
          });
      } catch (error) {
        setErro("Erro ao carregar abrigo.");
      } finally {
        setCarregando(false);
      }
    }

    carregarAbrigo();
  }, [id, editando]);

  function handleChange(e) {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

          const dados = {
            nome: form.nome,
            endereco: form.endereco,
            cidade: form.cidade,
            capacidade: Number(form.capacidade),
            responsavel: form.responsavel,
            telefone: form.telefone,
            status: form.status,
          };

    try {
      setCarregando(true);

      if (editando) {
        await atualizarAbrigo(id, dados);
      } else {
        await criarAbrigo(dados);
      }

      navigate("/abrigos");
    } catch (error) {
      setErro("Erro ao salvar abrigo.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="abrigos-page">
      <div className="page-header">
        <div>
          <h2>{editando ? "Editar Abrigo" : "Novo Abrigo"}</h2>
          <p>Informe os dados do abrigo temporário.</p>
        </div>
      </div>

      {erro && <p className="error-message">{erro}</p>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome *</label>
          <input
            name="nome"
            value={form.nome}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Endereço *</label>
          <input
            name="endereco"
            value={form.endereco}
            onChange={handleChange}
            required
          />
        </div>
                <div className="form-group">
          <label>Cidade *</label>
          <input
            name="cidade"
            value={form.cidade}
            onChange={handleChange}
            required
          />
          </div>

        <div className="form-row">
          <div className="form-group">
            <label>Capacidade *</label>
            <input
              type="number"
              name="capacidade"
              value={form.capacidade}
              onChange={handleChange}
              min="1"
              required
            />
          </div>

          <div className="form-group">
            <label>Telefone</label>
            <input
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Responsável</label>
          <input
            name="responsavel"
            value={form.responsavel}
            onChange={handleChange}
          />
        </div>

          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
            >
              <option value="ATIVO">Ativo</option>
              <option value="INATIVO">Inativo</option>
            </select>
          </div>

        <div className="form-actions">
          <button type="button" className="btn-secondary" onClick={() => navigate("/abrigos")}>
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

export default FormAbrigo;