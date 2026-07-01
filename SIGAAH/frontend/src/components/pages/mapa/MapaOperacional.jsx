import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { listarAbrigos } from "../../../services/abrigoService";
import "./MapaOperacional.css";
import api from "../../../services/api";

const POSICAO_PADRAO = [-27.2423, -50.2189]; // SC
const RAIO_BUSCA_METROS = 3000;

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

function criarIconeUsuario() {
  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div style="
        background:#2563eb;
        width:24px;
        height:24px;
        border-radius:50%;
        border:4px solid white;
        box-shadow:0 2px 10px rgba(0,0,0,0.4);
      "></div>
    `,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -14],
  });
}

function criarIconeServico(tipo) {
  const ehHospital = tipo === "Hospital";
  const cor = ehHospital ? "#dc2626" : "#0d9488";
  const texto = ehHospital ? "H" : "F";

  return L.divIcon({
    className: "custom-map-marker",
    html: `
      <div style="
        background:${cor};
        width:26px;
        height:26px;
        border-radius:50%;
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
        color:white;
        font-weight:bold;
        font-size:13px;
        display:flex;
        align-items:center;
        justify-content:center;
      ">${texto}</div>
    `,
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -14],
  });
}

function CentralizarMapa({ posicao, zoom = 14 }) {
  const map = useMap();

  useEffect(() => {
    if (posicao) {
      map.setView(posicao, zoom);
    }
  }, [posicao, zoom, map]);

  return null;
}

function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function montarEndereco(tags) {
  if (!tags) return "Endereço não informado";

  const rua = tags["addr:street"];
  const numero = tags["addr:housenumber"];
  const cidade = tags["addr:city"];

  const endereco = [
    rua ? `${rua}${numero ? `, ${numero}` : ""}` : null,
    cidade || null,
  ]
    .filter(Boolean)
    .join(" - ");

  return endereco || "Endereço não informado";
}

function MapaOperacional() {
  const [abrigos, setAbrigos] = useState([]);
  const [erro, setErro] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [localizacaoUsuario, setLocalizacaoUsuario] = useState(null);
  const [servicosProximos, setServicosProximos] = useState([]);
  const [erroServicos, setErroServicos] = useState("");
  const [carregandoServicos, setCarregandoServicos] = useState(false);

  const carregouLocalizacaoAutomaticamente = useRef(false);

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
        console.error(error);
        setErro("Erro ao carregar o mapa operacional.");
      } finally {
        setCarregando(false);
      }
    }

    carregarAbrigos();

    if (!carregouLocalizacaoAutomaticamente.current) {
      carregouLocalizacaoAutomaticamente.current = true;
      localizarUsuario();
    }
  }, []);

  const centroMapa = useMemo(() => {
    if (localizacaoUsuario) {
      return localizacaoUsuario;
    }

    if (abrigos.length > 0) {
      return [Number(abrigos[0].latitude), Number(abrigos[0].longitude)];
    }

    return POSICAO_PADRAO;
  }, [abrigos, localizacaoUsuario]);

  async function buscarServicosProximos(lat, lng) {
    setCarregandoServicos(true);
    setErroServicos("");

    try {
      const response = await api.get("/mapa/servicos-proximos", {
        params: {
          lat,
          lng,
          raio: RAIO_BUSCA_METROS,
        },
      });

      setServicosProximos(response.data);
    } catch (error) {
      console.error(error);
      setErroServicos("Erro ao buscar hospitais e farmácias próximos.");
    } finally {
      setCarregandoServicos(false);
    }
  }

  function localizarUsuario() {
    setErroServicos("");

    if (!navigator.geolocation) {
      setErroServicos("Seu navegador não suporta geolocalização.");
      return;
    }

    setCarregandoServicos(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        const posicao = [lat, lng];

        setLocalizacaoUsuario(posicao);

        await buscarServicosProximos(lat, lng);
      },
      () => {
        setCarregandoServicos(false);
        setErroServicos(
          "Não foi possível obter sua localização. Verifique a permissão do navegador."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  }

  const totalAtivos = abrigos.filter((a) => a.status === "ATIVO").length;
  const totalLotados = abrigos.filter((a) => a.status === "LOTADO").length;
  const totalManutencao = abrigos.filter(
    (a) => a.status === "MANUTENCAO"
  ).length;

  const totalHospitais = servicosProximos.filter(
    (s) => s.tipo === "Hospital"
  ).length;

  const totalFarmacias = servicosProximos.filter(
    (s) => s.tipo === "Farmácia"
  ).length;

  if (carregando) return <p>Carregando mapa operacional...</p>;
  if (erro) return <p className="error-message">{erro}</p>;

  return (
    <div className="mapa-page">
      <div className="page-header">
        <div>
          <h2>Mapa Operacional</h2>
          <p>
            Visualização georreferenciada dos abrigos, hospitais e farmácias
            próximos.
          </p>
        </div>

        <button
          className="btn-localizacao"
          onClick={localizarUsuario}
          disabled={carregandoServicos}
        >
          {carregandoServicos
            ? "Atualizando localização..."
            : "Atualizar minha localização"}
        </button>
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

        <div>
          <span>Serviços próximos</span>
          <strong>{servicosProximos.length}</strong>
        </div>
      </div>

      <div className="mapa-legenda">
        <span>
          <i className="legenda-dot ativo"></i> Ativo
        </span>
        <span>
          <i className="legenda-dot lotado"></i> Lotado
        </span>
        <span>
          <i className="legenda-dot manutencao"></i> Manutenção
        </span>
        <span>
          <i className="legenda-dot inativo"></i> Inativo
        </span>
        <span>
          <i className="legenda-dot usuario"></i> Minha localização
        </span>
        <span>
          <i className="legenda-dot hospital"></i> Hospital
        </span>
        <span>
          <i className="legenda-dot farmacia"></i> Farmácia
        </span>
      </div>

      {erroServicos && <p className="error-message">{erroServicos}</p>}

      {abrigos.length === 0 && !localizacaoUsuario ? (
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

            {localizacaoUsuario && (
              <>
                <CentralizarMapa posicao={localizacaoUsuario} zoom={14} />

                <Marker position={localizacaoUsuario} icon={criarIconeUsuario()}>
                  <Popup>
                    <strong>Você está aqui</strong>
                  </Popup>
                </Marker>
              </>
            )}

            {servicosProximos.map((servico) => (
              <Marker
                key={servico.id}
                position={[servico.lat, servico.lng]}
                icon={criarIconeServico(servico.tipo)}
              >
                <Popup>
                  <div className="popup-abrigo">
                    <div
                      className={`popup-status ${servico.tipo === "Hospital" ? "lotado" : "ativo"
                        }`}
                    >
                      {servico.tipo}
                    </div>

                    <h4>{servico.nome}</h4>

                    <div className="popup-info">
                      <p>
                        <strong>Endereço:</strong>
                        <span>{servico.endereco}</span>
                      </p>

                      <p>
                        <strong>Distância:</strong>
                        <span>{servico.distanciaKm.toFixed(2)} km</span>
                      </p>
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}

            {abrigos.map((abrigo) => (
              <Marker
                key={abrigo.id}
                position={[Number(abrigo.latitude), Number(abrigo.longitude)]}
                icon={criarIconeAbrigo(abrigo)}
              >
                <Popup>
                  <div className="popup-abrigo">
                    <div
                      className={`popup-status ${abrigo.status?.toLowerCase()}`}
                    >
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

      {servicosProximos.length > 0 && (
        <div className="servicos-proximos-card">
          <h3>Hospitais e farmácias próximos</h3>

          <p>
            Foram encontrados {totalHospitais} hospitais e {totalFarmacias}{" "}
            farmácias em um raio aproximado de {RAIO_BUSCA_METROS / 1000} km.
          </p>

          <div className="servicos-lista">
            {servicosProximos.slice(0, 10).map((servico) => (
              <div key={`lista-${servico.id}`} className="servico-item">
                <strong>{servico.nome}</strong>
                <span>{servico.tipo}</span>
                <small>{servico.distanciaKm.toFixed(2)} km de distância</small>
              </div>
            ))}
          </div>
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