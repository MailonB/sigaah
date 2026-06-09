import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  atualizarVoluntario,
  buscarVoluntarioPorId,
  criarVoluntario,
} from "../../../services/voluntarioService";
import "./Voluntarios.css";

function FormVoluntario() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editando = Boolean(id);

  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    telefone: "",
    email: "",
    especialidade: "OUTRO",
    disponibilidade: "",
    observacoes: "",
    ativo: true,
  });

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarVoluntario() {
      if (!editando) return;

      try {
        const response = await buscarVoluntarioPorId(id);
        const voluntario = response.data;

        setForm({
          nome: voluntario.nome || "",
          cpf: voluntario.cpf || "",
          telefone: voluntario.telefone || "",
          email: voluntario.email || "",
          especialidade: voluntario.especialidade || "OUTRO",
          disponibilidade: voluntario.disponibilidade || "",
          observacoes: voluntario.observacoes || "",
          ativo: voluntario.ativo ?? true,
        });
      } catch (error) {
        setErro("Erro ao carregar voluntário.");
      }
    }

    carregarVoluntario();
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
      cpf: form.cpf,
      telefone: form.telefone,
      email: form.email || null,
      especialidade: form.especialidade,
      disponibilidade: form.disponibilidade || null,
      observacoes: form.observacoes || null,
      ativo: form.ativo,
    };

    try {
      setCarregando(true);

      if (editando) {
        await atualizarVoluntario(id, dados);
      } else {
        await criarVoluntario(dados);
      }

      navigate("/voluntarios");
    } catch (error) {
      setErro(error.response?.data?.erro || "Erro ao salvar voluntário.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="voluntarios-page">
      <div className="page-header">
        <div>
          <h2>{editando ? "Editar Voluntário" : "Novo Voluntário"}</h2>
          <p>Informe os dados do voluntário.</p>
        </div>
      </div>

      {erro && <p className="error-message">{erro}</p>}

      <form className="form-card" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Nome *</label>
          <input name="nome" value={form.nome} onChange={handleChange} required />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>CPF *</label>
            <input name="cpf" value={form.cpf} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label>Telefone *</label>
            <input
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>E-mail</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Especialidade</label>
            <select
              name="especialidade"
              value={form.especialidade}
              onChange={handleChange}
            >
              <option value="MEDICO">Médico</option>
              <option value="ENFERMEIRO">Enfermeiro</option>
              <option value="PSICOLOGO">Psicólogo</option>
              <option value="BOMBEIRO">Bombeiro</option>
              <option value="MOTORISTA">Motorista</option>
              <option value="COZINHEIRO">Cozinheiro</option>
              <option value="ASSISTENTE_SOCIAL">Assistente social</option>
              <option value="SEGURANCA">Segurança</option>
              <option value="OUTRO">Outro</option>
            </select>
          </div>

          <div className="form-group">
            <label>Disponibilidade</label>
            <input
              name="disponibilidade"
              value={form.disponibilidade}
              onChange={handleChange}
              placeholder="Ex: manhã, tarde, finais de semana"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Observações</label>
          <textarea
            name="observacoes"
            value={form.observacoes}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <label className="checkbox-group">
          <input
            type="checkbox"
            name="ativo"
            checked={form.ativo}
            onChange={handleChange}
          />
          Voluntário ativo
        </label>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/voluntarios")}
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

export default FormVoluntario;