import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { listarAbrigos } from "../../../services/abrigoService";
import {
  atualizarSolicitacao,
  buscarSolicitacaoPorId,
  criarSolicitacao,
} from "../../../services/solicitacaoService";
import "./Solicitacoes.css";

function FormSolicitacao() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editando = Boolean(id);

  const [abrigos, setAbrigos] = useState([]);
  const [form, setForm] = useState({
    titulo: "",
    descricao: "",
    prioridade: "MEDIA",
    status: "ABERTA",
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
          const response = await buscarSolicitacaoPorId(id);
          const solicitacao = response.data;

          setForm({
            titulo: solicitacao.titulo || "",
            descricao: solicitacao.descricao || "",
            prioridade: solicitacao.prioridade || "MEDIA",
            status: solicitacao.status || "ABERTA",
            abrigoId: solicitacao.abrigoId || "",
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

    if (carregando) return;

    setErro("");

    const dados = {
      titulo: form.titulo,
      descricao: form.descricao,
      prioridade: form.prioridade,
      status: form.status,
      abrigoId: Number(form.abrigoId),
    };

    try {
      setCarregando(true);

      if (editando) {
        await atualizarSolicitacao(id, dados);
      } else {
        await criarSolicitacao(dados);
      }

      navigate("/solicitacoes");
    } catch (error) {
      setErro(error.response?.data?.erro || "Erro ao salvar solicitação.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="solicitacoes-page">
      <div className="page-header">
        <div>
          <h2>{editando ? "Editar Solicitação" : "Nova Solicitação"}</h2>
          <p>Informe a demanda humanitária vinculada ao abrigo.</p>
        </div>
      </div>

      {erro && <p className="error-message">{erro}</p>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Título *</label>
          <input
            name="titulo"
            value={form.titulo}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Descrição *</label>
          <textarea
            name="descricao"
            value={form.descricao}
            onChange={handleChange}
            rows="4"
            required
          />
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

        <div className="form-row">
          <div className="form-group">
            <label>Prioridade</label>
            <select
              name="prioridade"
              value={form.prioridade}
              onChange={handleChange}
            >
              <option value="BAIXA">Baixa</option>
              <option value="MEDIA">Média</option>
              <option value="ALTA">Alta</option>
              <option value="URGENTE">Urgente</option>
            </select>
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="ABERTA">Aberta</option>
              <option value="EM_ATENDIMENTO">Em atendimento</option>
              <option value="ATENDIDA">Atendida</option>
              <option value="CANCELADA">Cancelada</option>
            </select>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/solicitacoes")}
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

export default FormSolicitacao;