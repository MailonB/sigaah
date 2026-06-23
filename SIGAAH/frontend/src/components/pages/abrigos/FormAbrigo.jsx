import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import {
  atualizarAbrigo,
  buscarAbrigoPorId,
  criarAbrigo,
} from "../../../services/abrigoService";

import "./Abrigos.css";

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const POSICAO_PADRAO = [-27.2142, -49.6431]; // Rio do Sul/SC

function MarcadorClicavel({ position, setPosition, setForm }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;

      setPosition([lat, lng]);

      setForm((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
      }));
    },
  });

  return position ? <Marker position={position} /> : null;
}

function FormAbrigo() {
  const navigate = useNavigate();
  const { id } = useParams();

  const editando = Boolean(id);

  const [form, setForm] = useState({
    nome: "",
    cep: "",
    endereco: "",
    bairro: "",
    cidade: "",
    uf: "",
    capacidade: "",
    responsavel: "",
    telefone: "",
    latitude: "",
    longitude: "",
    status: "ATIVO",
  });

  const [position, setPosition] = useState(POSICAO_PADRAO);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    async function carregarAbrigo() {
      if (!editando) return;

      try {
        setCarregando(true);
        const response = await buscarAbrigoPorId(id);
        const abrigo = response.data;

        setForm({
          nome: abrigo.nome || "",
          cep: abrigo.cep || "",
          endereco: abrigo.endereco || "",
          bairro: abrigo.bairro || "",
          cidade: abrigo.cidade || "",
          uf: abrigo.uf || "",
          capacidade: abrigo.capacidade || "",
          responsavel: abrigo.responsavel || "",
          telefone: abrigo.telefone || "",
          latitude: abrigo.latitude || "",
          longitude: abrigo.longitude || "",
          status: abrigo.status || "ATIVO",
        });

        if (abrigo.latitude && abrigo.longitude) {
          setPosition([abrigo.latitude, abrigo.longitude]);
        }
      } catch (error) {
        setErro("Erro ao carregar abrigo.");
      } finally {
        setCarregando(false);
      }
    }

    carregarAbrigo();
  }, [id, editando]);

  function handleChange(e) {
    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "latitude" || name === "longitude") {
      const novaLatitude = name === "latitude" ? value : form.latitude;
      const novaLongitude = name === "longitude" ? value : form.longitude;

      if (novaLatitude && novaLongitude) {
        setPosition([Number(novaLatitude), Number(novaLongitude)]);
      }
    }
  }

  async function buscarCep() {
    const cepLimpo = form.cep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      setErro("Informe um CEP válido com 8 dígitos.");
      return;
    }

    try {
      setErro("");

      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
      const dados = await response.json();

      if (dados.erro) {
        setErro("CEP não encontrado.");
        return;
      }

      setForm((prev) => ({
        ...prev,
        endereco: dados.logradouro || prev.endereco,
        bairro: dados.bairro || prev.bairro,
        cidade: dados.localidade || prev.cidade,
        uf: dados.uf || prev.uf,
      }));
    } catch (error) {
      setErro("Erro ao consultar CEP.");
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErro("");

    const dados = {
      nome: form.nome,
      cep: form.cep,
      endereco: form.endereco,
      bairro: form.bairro,
      cidade: form.cidade,
      uf: form.uf,
      capacidade: Number(form.capacidade),
      responsavel: form.responsavel,
      telefone: form.telefone,
      latitude: form.latitude ? Number(form.latitude) : null,
      longitude: form.longitude ? Number(form.longitude) : null,
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
          <p>Informe os dados e a localização geográfica do abrigo.</p>
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
            <label>CEP</label>
            <input name="cep" value={form.cep} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>&nbsp;</label>
            <button type="button" className="btn-secondary" onClick={buscarCep}>
              Buscar CEP
            </button>
          </div>
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

        <div className="form-row">
          <div className="form-group">
            <label>Bairro</label>
            <input name="bairro" value={form.bairro} onChange={handleChange} />
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

          <div className="form-group">
            <label>UF</label>
            <input name="uf" value={form.uf} onChange={handleChange} maxLength="2" />
          </div>
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
            <input name="telefone" value={form.telefone} onChange={handleChange} />
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

        <div className="form-row">
          <div className="form-group">
            <label>Latitude</label>
            <input name="latitude" value={form.latitude} onChange={handleChange} />
          </div>

          <div className="form-group">
            <label>Longitude</label>
            <input name="longitude" value={form.longitude} onChange={handleChange} />
          </div>
        </div>

        <div className="form-group">
          <label>Localização no mapa</label>
          <p className="map-help">
            Clique no mapa para marcar a posição exata do abrigo.
          </p>

          <div className="map-container">
            <MapContainer center={position} zoom={13} style={{ height: "350px" }}>
              <TileLayer
                attribution="&copy; OpenStreetMap"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MarcadorClicavel
                position={position}
                setPosition={setPosition}
                setForm={setForm}
              />
            </MapContainer>
          </div>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange}>
            <option value="ATIVO">Ativo</option>
            <option value="INATIVO">Inativo</option>
            <option value="LOTADO">Lotado</option>
            <option value="MANUTENCAO">Manutenção</option>
          </select>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate("/abrigos")}
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

export default FormAbrigo;