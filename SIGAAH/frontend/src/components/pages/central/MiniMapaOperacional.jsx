import { useEffect, useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import api from "../../../services/api";
import { listarAbrigos } from "../../../services/abrigoService";

const POSICAO_PADRAO = [-27.2423, -50.2189]; // Santa Catarina

function MiniMapaOperacional() {
    const [abrigos, setAbrigos] = useState([]);
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarDados() {
            try {
                const [abrigosResponse, ocupacaoResponse] = await Promise.all([
                    listarAbrigos(),
                    api.get("/dashboard/ocupacao-abrigos"),
                ]);

                const ocupacaoMap = new Map(
                    ocupacaoResponse.data.map((item) => [item.id, item])
                );

                const dados = abrigosResponse.data
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

                setAbrigos(dados);
            } catch (error) {
                setErro("Erro ao carregar mini mapa operacional.");
            } finally {
                setCarregando(false);
            }
        }

        carregarDados();
    }, []);

    const centroMapa = useMemo(() => {
        if (abrigos.length > 0) {
            return [Number(abrigos[0].latitude), Number(abrigos[0].longitude)];
        }

        return POSICAO_PADRAO;
    }, [abrigos]);

    if (carregando) {
        return (
            <section className="central-panel">
                <h3>🗺️ Mapa Operacional</h3>
                <p>Carregando localização dos abrigos...</p>
            </section>
        );
    }

    if (erro) {
        return (
            <section className="central-panel">
                <h3>🗺️ Mapa Operacional</h3>
                <p className="error-message">{erro}</p>
            </section>
        );
    }

    return (
        <section className="central-panel mini-mapa-panel">
            <div className="mini-mapa-header">
                <div>
                    <h3>🗺️ Mapa Operacional dos Abrigos</h3>
                    <p>Localização e situação operacional dos abrigos cadastrados.</p>
                </div>

                <div className="mini-mapa-total">
                    <span>Abrigos no mapa</span>
                    <strong>{abrigos.length}</strong>
                </div>
            </div>

            <div className="mini-mapa-legenda">
                <span><i className="legenda-dot ativo"></i> Normal</span>
                <span><i className="legenda-dot alerta"></i> Atenção</span>
                <span><i className="legenda-dot lotado"></i> Crítico</span>
                <span><i className="legenda-dot manutencao"></i> Manutenção</span>
                <span><i className="legenda-dot inativo"></i> Inativo</span>
            </div>

            {abrigos.length === 0 ? (
                <div className="mini-mapa-vazio">
                    Nenhum abrigo com latitude e longitude cadastrado.
                </div>
            ) : (
                <MapContainer
                    center={centroMapa}
                    zoom={8}
                    className="mini-mapa-leaflet"
                >
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
                                <div className="mini-popup">
                                    <strong>{abrigo.nome}</strong>

                                    <p>
                                        <b>Status:</b> {traduzirStatus(abrigo.status)}
                                    </p>

                                    <p>
                                        <b>Ocupação:</b>{" "}
                                        {abrigo.percentualOcupacao ?? 0}%
                                    </p>

                                    <p>
                                        <b>Pessoas:</b>{" "}
                                        {abrigo.ocupados ?? 0}/{abrigo.capacidade}
                                    </p>

                                    <p>
                                        <b>Vagas:</b>{" "}
                                        {abrigo.vagasDisponiveis ?? abrigo.capacidade}
                                    </p>

                                    <p>
                                        <b>Responsável:</b>{" "}
                                        {abrigo.responsavel || "Não informado"}
                                    </p>

                                    <p>
                                        <b>Cidade:</b>{" "}
                                        {abrigo.cidade}
                                        {abrigo.uf ? `/${abrigo.uf}` : ""}
                                    </p>
                                </div>
                            </Popup>
                        </Marker>
                    ))}
                </MapContainer>
            )}
        </section>
    );
}

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
        width:20px;
        height:20px;
        border-radius:50%;
        border:3px solid white;
        box-shadow:0 2px 8px rgba(0,0,0,0.35);
      "></div>
    `,
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -12],
    });
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

export default MiniMapaOperacional;