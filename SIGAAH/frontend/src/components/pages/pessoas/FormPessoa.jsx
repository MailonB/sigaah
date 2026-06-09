import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  atualizarPessoa,
  buscarPessoaPorId,
  criarPessoa,
} from "../../../services/pessoaService";
import { listarAbrigos } from "../../../services/abrigoService";
import {
  criarNecessidade,
  excluirNecessidade,
} from "../../../services/necessidadeService";
import "./Pessoas.css";

function FormPessoa() {
  const navigate = useNavigate();
  const { id } = useParams();
  const editando = Boolean(id);

  const [abrigos, setAbrigos] = useState([]);
  const [form, setForm] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    telefone: "",
    observacoes: "",
    sexo: "",
    abrigoId: "",
    status: "ACOLHIDO",
    necessidades: [],
    tipoNecessidade: "",
    descricaoNecessidade: "",
  });

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarDados() {
      try {
        const abrigosResponse = await listarAbrigos();
        setAbrigos(abrigosResponse.data);

        if (editando) {
          const pessoaResponse = await buscarPessoaPorId(id);
          const pessoa = pessoaResponse.data;

          setForm({
            nome: pessoa.nome || "",
            cpf: pessoa.cpf || "",
            dataNascimento: pessoa.dataNascimento
              ? pessoa.dataNascimento.substring(0, 10)
              : "",
            telefone: pessoa.telefone || "",
            observacoes: pessoa.observacoes || "",
            sexo: pessoa.sexo || "",
            abrigoId: pessoa.abrigoId || "",
            status: pessoa.status || "ACOLHIDO",
            necessidades: pessoa.necessidades || [],
            tipoNecessidade: "",
            descricaoNecessidade: "",
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

  async function adicionarNecessidade() {
    if (!form.tipoNecessidade) {
      alert("Informe o tipo da necessidade.");
      return;
    }

    const novaNecessidade = {
      tipo: form.tipoNecessidade,
      descricao: form.descricaoNecessidade || null,
    };

    if (editando) {
      try {
        const response = await criarNecessidade(id, novaNecessidade);

        setForm((prev) => ({
          ...prev,
          necessidades: [...prev.necessidades, response.data],
          tipoNecessidade: "",
          descricaoNecessidade: "",
        }));
      } catch (error) {
        alert(error.response?.data?.erro || "Erro ao adicionar necessidade.");
      }

      return;
    }

    setForm((prev) => ({
      ...prev,
      necessidades: [...prev.necessidades, novaNecessidade],
      tipoNecessidade: "",
      descricaoNecessidade: "",
    }));
  }

  async function removerNecessidade(index) {
    const necessidade = form.necessidades[index];

    if (editando && necessidade.id) {
      if (!window.confirm("Deseja remover esta necessidade?")) return;

      try {
        await excluirNecessidade(id, necessidade.id);
      } catch (error) {
        alert(error.response?.data?.erro || "Erro ao remover necessidade.");
        return;
      }
    }

    setForm((prev) => ({
      ...prev,
      necessidades: prev.necessidades.filter((_, i) => i !== index),
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    const dados = {
      nome: form.nome,
      cpf: form.cpf || null,
      dataNascimento: form.dataNascimento || null,
      telefone: form.telefone || null,
      observacoes: form.observacoes || null,
      sexo: form.sexo || null,
      abrigoId: Number(form.abrigoId),
      status: form.status,
    };

    try {
      setCarregando(true);

      if (editando) {
        await atualizarPessoa(id, dados);
      } else {
        await criarPessoa({
          ...dados,
          necessidades: form.necessidades.map((item) => ({
            tipo: item.tipo,
            descricao: item.descricao || null,
          })),
        });
      }

      navigate("/pessoas-acolhidas");
    } catch (error) {
      setErro(error.response?.data?.erro || "Erro ao salvar pessoa.");
    } finally {
      setCarregando(false);
    }
  }

  return (
    <div className="pessoas-page">
      <div className="page-header">
        <div>
          <h2>{editando ? "Editar Pessoa" : "Nova Pessoa Acolhida"}</h2>
          <p>Informe os dados da pessoa acolhida.</p>
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
            <label>CPF</label>
            <input name="cpf" value={form.cpf} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Data de nascimento</label>
            <input
              type="date"
              name="dataNascimento"
              value={form.dataNascimento}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Telefone</label>
            <input name="telefone" value={form.telefone} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Sexo</label>
            <select name="sexo" value={form.sexo} onChange={handleChange}>
              <option value="">Selecione</option>
              <option value="MASCULINO">Masculino</option>
              <option value="FEMININO">Feminino</option>
              <option value="OUTRO">Outro</option>
            </select>
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

        {editando && (
          <div className="form-group">
            <label>Status</label>
            <select name="status" value={form.status} onChange={handleChange}>
              <option value="ACOLHIDO">Acolhido</option>
              <option value="TRANSFERIDO">Transferido</option>
              <option value="DESLIGADO">Desligado</option>
              <option value="FALECIDO">Falecido</option>
            </select>
          </div>
        )}

        <div className="necessidades-box">
          <h3>Necessidades Especiais</h3>

          <div className="form-row">
            <div className="form-group">
              <label>Tipo</label>
              <select
                name="tipoNecessidade"
                value={form.tipoNecessidade}
                onChange={handleChange}
              >
                <option value="">Selecione</option>

                {/* Ajustar os values abaixo conforme teu enum TipoNecessidade */}
                <option value="MEDICAMENTO">Medicamento</option>
                <option value="ALIMENTACAO">Alimentação especial</option>
                <option value="MOBILIDADE">Mobilidade reduzida</option>
                <option value="PSICOLOGICA">Necessidade psicológica</option>
                <option value="OUTRA">Outra</option>
              </select>
            </div>

            <div className="form-group">
              <label>Descrição</label>
              <input
                name="descricaoNecessidade"
                value={form.descricaoNecessidade}
                onChange={handleChange}
                placeholder="Ex: cadeirante, usa insulina..."
              />
            </div>
          </div>

          <button
            type="button"
            className="btn-secondary"
            onClick={adicionarNecessidade}
          >
            Adicionar necessidade
          </button>

          {form.necessidades.length > 0 && (
            <table className="data-table necessidades-table">
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Descrição</th>
                  <th>Ação</th>
                </tr>
              </thead>

              <tbody>
                {form.necessidades.map((item, index) => (
                  <tr key={item.id || index}>
                    <td>{item.tipo}</td>
                    <td>{item.descricao || "-"}</td>
                    <td>
                      <button
                        type="button"
                        className="btn-delete"
                        onClick={() => removerNecessidade(index)}
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/pessoas-acolhidas")}
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

export default FormPessoa;