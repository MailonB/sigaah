import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { listarAbrigos } from "../../../services/abrigoService";
import "./MapaOperacional.css";
import api from "../../../services/api";

const POSICAO_PADRAO = [-27.2423, -50.2189]; // SC

function criarIconeAbrigo(abrigo) {
  const percentual = Number(abrigo.percentualOcupacao || 0);

  let cor = "#16a34a";

  if (abrigo.status === "INATIVO") {
    cor = "#6b7280";
  } else if (abrigo.status === "MANUTENCAO") {
    cor = "#f97316";
  } else if (abrigo.status === "LOTADO" || percentual >= 100) {
    cor = "#dc2626";
  } else if (percentual >= 80) {
    cor = "#f59e0b";
  }

  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div style="
        background:${cor};
        width:22px;
        height:22px;
        border-radius:50%;
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
      "></div>
    `,
    iconSize: [22, 22],
    iconAnchor: [11, 11],
    popupAnchor: [0, -12],
  });
}

function MapaOperacional() {
  const [abrigos, setAbrigos] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
   async function carregarAbrigos() {
  try {
    const [abrigosResponse, ocupacaoResponse] = await Promise.all([
      listarAbrigos(),
      api.get("/dashboard/ocupacao-abrigos"),
    ]);

    const ocupacaoMap = new Map(
      ocupacaoResponse.data.map((item) => [item.id, item])
    );

    const abrigosComOcupacao = abrigosResponse.data
      .map((abrigo) => ({
        ...abrigo,
        ...ocupacaoMap.get(abrigo.id),
      }))
      .filter(
        (abrigo) =>
          abrigo.latitude !== null &&
          abrigo.latitude !== undefined &&
          abrigo.longitude !== null &&
          abrigo.longitude !== undefined
      );

    setAbrigos(abrigosComOcupacao);
  } catch (error) {
    setErro("Erro ao carregar o mapa operacional.");
  } finally {
    setCarregando(false);
  }
}

    carregarAbrigos();
  }, []);

  const centroMapa = useMemo(() => {
    if (abrigos.length > 0) {
      return [Number(abrigos[0].latitude), Number(abrigos[0].longitude)];
    }

    return POSICAO_PADRAO;
  }, [abrigos]);

  const totalAtivos = abrigos.filter((a) => a.status === "ATIVO").length;
  const totalLotados = abrigos.filter((a) => a.status === "LOTADO").length;
  const totalManutencao = abrigos.filter((a) => a.status === "MANUTENCAO").length;
  const totalInativos = abrigos.filter((a) => a.status === "INATIVO").length;

  if (carregando) return <p>Carregando mapa operacional...</p>;
  if (erro) return <p className="error-message">{erro}</p>;

  return (
    <div className="mapa-page">
      <div className="page-header">
        <div>
          <h2>Mapa Operacional</h2>
          <p>
            Visualização georreferenciada dos abrigos cadastrados no SIGAAH.
          </p>
        </div>
      </div>

      <div className="mapa-resumo">
        <div>
          <span>Abrigos no mapa</span>
          <strong>{abrigos.length}</strong>
        </div>

        <div>
          <span>Ativos</span>
          <strong>{totalAtivos}</strong>
        </div>

        <div>
          <span>Lotados</span>
          <strong>{totalLotados}</strong>
        </div>

        <div>
          <span>Manutenção</span>
          <strong>{totalManutencao}</strong>
        </div>
      </div>

      <div className="mapa-legenda">
        <span><i className="legenda-dot ativo"></i> Ativo</span>
        <span><i className="legenda-dot lotado"></i> Lotado</span>
        <span><i className="legenda-dot manutencao"></i> Manutenção</span>
        <span><i className="legenda-dot inativo"></i> Inativo</span>
      </div>

      {abrigos.length === 0 ? (
        <div className="mapa-vazio">
          Nenhum abrigo com latitude e longitude cadastrado.
        </div>
      ) : (
        <div className="mapa-card">
          <MapContainer center={centroMapa} zoom={8} className="mapa-leaflet">
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {abrigos.map((abrigo) => (
              <Marker
                key={abrigo.id}
                position={[Number(abrigo.latitude), Number(abrigo.longitude)]}
                icon={criarIconeAbrigo(abrigo)}
              >
                <Popup>
                  <div className="popup-abrigo">
                    <div className={`popup-status ${abrigo.status?.toLowerCase()}`}>
                      {traduzirStatus(abrigo.status)}
                    </div>

                    <h4>{abrigo.nome}</h4>

                    <div className="popup-info">
                      <p>
                        <strong>Responsável:</strong>
                        <span>{abrigo.responsavel || "Não informado"}</span>
                      </p>

                      <p>
                        <strong>Telefone:</strong>
                        <span>{abrigo.telefone || "Não informado"}</span>
                      </p>

                      <p>
                        <strong>Endereço:</strong>
                        <span>{abrigo.endereco || "Não informado"}</span>
                      </p>

                      <p>
                        <strong>Cidade:</strong>
                        <span>
                          {abrigo.cidade || "Não informado"}
                          {abrigo.uf ? `/${abrigo.uf}` : ""}
                        </span>
                      </p>

                      <p>
                        <strong>Capacidade:</strong>
                        <span>{abrigo.capacidade} pessoas</span>
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      )}
    </div>
  );
}

function traduzirStatus(status) {
  const statusMap = {
    ATIVO: "Ativo",
    INATIVO: "Inativo",
    LOTADO: "Lotado",
    MANUTENCAO: "Manutenção",
  };

  return statusMap[status] || status;
}

export default MapaOperacional;