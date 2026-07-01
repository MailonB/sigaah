const express = require("express");

const router = express.Router();

const RAIO_PADRAO_METROS = 3000;

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

router.get("/servicos-proximos", async (req, res) => {
    try {
        const lat = Number(req.query.lat);
        const lng = Number(req.query.lng);
        const raio = Number(req.query.raio || RAIO_PADRAO_METROS);

        if (!lat || !lng) {
            return res.status(400).json({
                erro: "Latitude e longitude são obrigatórias.",
            });
        }

        const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"hospital|pharmacy"](around:${raio},${lat},${lng});
        way["amenity"~"hospital|pharmacy"](around:${raio},${lat},${lng});
        relation["amenity"~"hospital|pharmacy"](around:${raio},${lat},${lng});

        node["healthcare"~"hospital|pharmacy"](around:${raio},${lat},${lng});
        way["healthcare"~"hospital|pharmacy"](around:${raio},${lat},${lng});
        relation["healthcare"~"hospital|pharmacy"](around:${raio},${lat},${lng});
      );
      out center tags;
    `;

        const response = await fetch("https://overpass-api.de/api/interpreter", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
                "User-Agent": "SIGAAH-TCC/1.0",
            },
            body: new URLSearchParams({
                data: query,
            }),
        });

        if (!response.ok) {
            return res.status(response.status).json({
                erro: "Erro ao consultar a Overpass API.",
                status: response.status,
            });
        }

        const data = await response.json();

        const resultado = data.elements
            .map((item) => {
                const itemLat = item.lat || item.center?.lat;
                const itemLng = item.lon || item.center?.lon;

                if (!itemLat || !itemLng) return null;

                const tipoBase = item.tags?.amenity || item.tags?.healthcare;
                const tipo = tipoBase === "hospital" ? "Hospital" : "Farmácia";

                return {
                    id: `${item.type}-${item.id}`,
                    nome: item.tags?.name || `${tipo} sem nome cadastrado`,
                    tipo,
                    endereco: montarEndereco(item.tags),
                    lat: itemLat,
                    lng: itemLng,
                    distanciaKm: calcularDistanciaKm(lat, lng, itemLat, itemLng),
                };
            })
            .filter(Boolean);

        const resultadoSemDuplicados = Array.from(
            new Map(resultado.map((item) => [item.id, item])).values()
        ).sort((a, b) => a.distanciaKm - b.distanciaKm);

        return res.json(resultadoSemDuplicados);
    } catch (error) {
        console.error(error);

        return res.status(500).json({
            erro: "Erro ao buscar hospitais e farmácias próximos.",
        });
    }
});

module.exports = router;