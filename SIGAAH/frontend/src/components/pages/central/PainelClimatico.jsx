import { useEffect, useState } from "react";
import { listarAbrigos } from "../../../services/abrigoService";


function PainelClimatico() {
    const [clima, setClima] = useState(null);
    const [localManual, setLocalManual] = useState("");
    const [erro, setErro] = useState("");
    const [carregando, setCarregando] = useState(true);
    const [usouLocalManual, setUsouLocalManual] = useState(false);
    const [abrigos, setAbrigos] = useState([]);
    const [abrigoSelecionadoId, setAbrigoSelecionadoId] = useState("");

    useEffect(() => {
        carregarAbrigosParaSelecao();
        iniciarMonitoramentoClimatico();
    }, []);

    async function carregarAbrigosParaSelecao() {
        try {
            const response = await listarAbrigos();

            const abrigosComLocalizacao = response.data.filter(
                (abrigo) => abrigo.latitude && abrigo.longitude
            );

            setAbrigos(abrigosComLocalizacao);

            if (abrigosComLocalizacao.length > 0) {
                setAbrigoSelecionadoId(String(abrigosComLocalizacao[0].id));
            }
        } catch (error) {
            console.error("Erro ao carregar abrigos para seleção", error);
        }
    }

    async function iniciarMonitoramentoClimatico() {
        setCarregando(true);
        setErro("");

        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    await buscarClima({
                        latitude,
                        longitude,
                        origem: "Sua localização atual",
                    });
                },
                async () => {
                    setErro(
                        "Localização do navegador não permitida. Informe uma cidade para monitorar ou use um abrigo cadastrado."
                    );
                    setCarregando(false);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 8000,
                    maximumAge: 60000,
                }
            );
        } else {
            setErro(
                "Seu navegador não permite localização automática. Informe uma cidade para monitorar ou use um abrigo cadastrado."
            );
            setCarregando(false);
        }
    }

    async function buscarPorCidade(e) {
        e.preventDefault();

        const termo = localManual.trim();

        if (!termo) {
            setErro("Informe uma cidade. Exemplo: Rio do Sul");
            return;
        }

        try {
            setCarregando(true);
            setErro("");

            const url =
                `https://geocoding-api.open-meteo.com/v1/search` +
                `?name=${encodeURIComponent(termo)}` +
                `&count=5` +
                `&language=pt` +
                `&format=json` +
                `&countryCode=BR`;

            const response = await fetch(url);
            const dados = await response.json();

            if (!dados.results || dados.results.length === 0) {
                setErro("Local não encontrado. Tente informar cidade e estado, exemplo: Rio do Sul SC.");
                setCarregando(false);
                return;
            }

            const resultadoSC =
                dados.results.find((item) => item.admin1 === "Santa Catarina") ||
                dados.results[0];

            setUsouLocalManual(true);

            await buscarClima({
                latitude: resultadoSC.latitude,
                longitude: resultadoSC.longitude,
                origem: `Local informado: ${resultadoSC.name}`,
                cidade: resultadoSC.name,
                uf: resultadoSC.admin1,
            });
        } catch (error) {
            setErro("Erro ao buscar o local informado.");
            setCarregando(false);
        }
    }

    async function buscarClimaPorAbrigo() {
        try {
            setCarregando(true);
            setErro("");

            let listaAbrigos = abrigos;

            if (listaAbrigos.length === 0) {
                const response = await listarAbrigos();

                listaAbrigos = response.data.filter(
                    (abrigo) => abrigo.latitude && abrigo.longitude
                );

                setAbrigos(listaAbrigos);
            }

            if (listaAbrigos.length === 0) {
                setErro(
                    "Nenhum abrigo possui latitude/longitude cadastrada para consulta climática."
                );
                setCarregando(false);
                return;
            }

            const abrigoSelecionado =
                listaAbrigos.find(
                    (abrigo) => String(abrigo.id) === String(abrigoSelecionadoId)
                ) || listaAbrigos[0];

            setUsouLocalManual(false);

            await buscarClima({
                latitude: abrigoSelecionado.latitude,
                longitude: abrigoSelecionado.longitude,
                origem: `Abrigo: ${abrigoSelecionado.nome}`,
                cidade: abrigoSelecionado.cidade,
                uf: abrigoSelecionado.uf,
            });
        } catch (error) {
            setErro("Erro ao buscar localização dos abrigos.");
            setCarregando(false);
        }
    }

    async function buscarClima({ latitude, longitude, origem, cidade, uf }) {
        try {
            const url =
                `https://api.open-meteo.com/v1/forecast` +
                `?latitude=${latitude}` +
                `&longitude=${longitude}` +
                `&current=temperature_2m,relative_humidity_2m,precipitation,rain,weather_code,wind_speed_10m,wind_gusts_10m` +
                `&daily=precipitation_sum,precipitation_probability_max` +
                `&forecast_days=1` +
                `&timezone=auto`;

            const response = await fetch(url);
            const dados = await response.json();

            const chuvaHoje = Number(dados.daily?.precipitation_sum?.[0] || 0);
            const probabilidadeChuva = Number(
                dados.daily?.precipitation_probability_max?.[0] || 0
            );
            const vento = Number(dados.current?.wind_speed_10m || 0);
            const rajada = Number(dados.current?.wind_gusts_10m || 0);

            setClima({
                origem,
                cidade,
                uf,
                temperatura: dados.current?.temperature_2m,
                umidade: dados.current?.relative_humidity_2m,
                precipitacaoAtual: dados.current?.precipitation,
                chuvaHoje,
                probabilidadeChuva,
                vento,
                rajada,
                codigoTempo: dados.current?.weather_code,
                risco: calcularRisco(chuvaHoje, probabilidadeChuva, rajada),
                atualizadoEm: dados.current?.time,
            });
        } catch (error) {
            setErro("Erro ao consultar dados meteorológicos.");
        } finally {
            setCarregando(false);
        }
    }

    return (
        <section className={`central-panel painel-climatico ${clima?.risco?.classe || ""}`}>
            <div className="clima-header">
                <div>
                    <h3>🌦 Monitoramento Climático</h3>
                    <p>
                        {clima
                            ? clima.origem
                            : "Informe uma cidade ou use a localização de um abrigo."}
                    </p>

                    {clima?.cidade && (
                        <small>
                            {clima.cidade}
                            {clima.uf ? ` - ${clima.uf}` : ""}
                        </small>
                    )}
                </div>

                {clima?.risco && (
                    <div className={`clima-risco ${clima.risco.classe}`}>
                        {clima.risco.texto}
                    </div>
                )}
            </div>

            <form className="clima-form" onSubmit={buscarPorCidade}>
                <input
                    type="text"
                    placeholder="Ex: Rio do Sul, Blumenau, Itajaí..."
                    value={localManual}
                    onChange={(e) => setLocalManual(e.target.value)}
                />

                <button type="submit" className="btn-primary" disabled={carregando}>
                    Monitorar local
                </button>

                <select
                    value={abrigoSelecionadoId}
                    onChange={(e) => setAbrigoSelecionadoId(e.target.value)}
                    disabled={carregando || abrigos.length === 0}
                >
                    {abrigos.length === 0 ? (
                        <option value="">Nenhum abrigo com localização</option>
                    ) : (
                        abrigos.map((abrigo) => (
                            <option key={abrigo.id} value={abrigo.id}>
                                {abrigo.nome} - {abrigo.cidade}
                            </option>
                        ))
                    )}
                </select>

                <button
                    type="button"
                    className="btn-secondary"
                    onClick={buscarClimaPorAbrigo}
                    disabled={carregando || abrigos.length === 0}
                >
                    Monitorar abrigo
                </button>

                <button
                    type="button"
                    className="btn-secondary"
                    onClick={iniciarMonitoramentoClimatico}
                    disabled={carregando}
                >
                    Usar minha localização
                </button>
            </form>

            {erro && <p className="error-message">{erro}</p>}

            {carregando && <p>Buscando dados meteorológicos...</p>}

            {!carregando && clima && (
                <>
                    <div className="clima-grid">
                        <div>
                            <span>Temperatura</span>
                            <strong>{formatarNumero(clima.temperatura)}°C</strong>
                        </div>

                        <div>
                            <span>Umidade</span>
                            <strong>{formatarNumero(clima.umidade)}%</strong>
                        </div>

                        <div>
                            <span>Chuva hoje</span>
                            <strong>{formatarNumero(clima.chuvaHoje)} mm</strong>
                        </div>

                        <div>
                            <span>Prob. chuva</span>
                            <strong>{formatarNumero(clima.probabilidadeChuva)}%</strong>
                        </div>

                        <div>
                            <span>Vento</span>
                            <strong>{formatarNumero(clima.vento)} km/h</strong>
                        </div>

                        <div>
                            <span>Rajadas</span>
                            <strong>{formatarNumero(clima.rajada)} km/h</strong>
                        </div>
                    </div>

                    <div className="clima-descricao">
                        <strong>{traduzirCodigoTempo(clima.codigoTempo)}</strong>
                        <p>{clima.risco.descricao}</p>

                        {usouLocalManual && (
                            <small>
                                Local monitorado informado manualmente pelo usuário.
                            </small>
                        )}
                    </div>
                </>
            )}
        </section>
    );
}

function calcularRisco(chuvaHoje, probabilidadeChuva, rajada) {
    if (chuvaHoje >= 50 || rajada >= 70) {
        return {
            texto: "CRÍTICO",
            classe: "risco-critico",
            descricao:
                "Condição climática crítica. Recomenda-se atenção máxima aos abrigos, estoques e solicitações emergenciais.",
        };
    }

    if (chuvaHoje >= 25 || probabilidadeChuva >= 70 || rajada >= 45) {
        return {
            texto: "ATENÇÃO",
            classe: "risco-alerta",
            descricao:
                "Condição de atenção. Recomenda-se acompanhar a evolução do clima e preparar recursos preventivamente.",
        };
    }

    return {
        texto: "NORMAL",
        classe: "risco-normal",
        descricao:
            "Sem indicativo climático crítico no momento para a região consultada.",
    };
}

function traduzirCodigoTempo(codigo) {
    const codigos = {
        0: "Céu limpo",
        1: "Predominantemente limpo",
        2: "Parcialmente nublado",
        3: "Nublado",
        45: "Neblina",
        48: "Neblina com geada",
        51: "Garoa fraca",
        53: "Garoa moderada",
        55: "Garoa intensa",
        61: "Chuva fraca",
        63: "Chuva moderada",
        65: "Chuva forte",
        80: "Pancadas de chuva fracas",
        81: "Pancadas de chuva moderadas",
        82: "Pancadas de chuva fortes",
        95: "Tempestade",
    };

    return codigos[codigo] || "Condição climática não classificada";
}

function formatarNumero(valor) {
    if (valor === null || valor === undefined) return "-";
    return Number(valor).toFixed(1).replace(".", ",");
}

export default PainelClimatico;