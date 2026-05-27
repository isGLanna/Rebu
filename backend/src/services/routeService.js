const axios = require("axios");

// Busca uma rota real na OpenRouteService usando coordenadas
async function buscarRota(origem, destino) {
  try {
    const resposta = await axios.post(
      "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
      {
        coordinates: [
          [origem.longitude, origem.latitude],
          [destino.longitude, destino.latitude]
        ]
      },
      {
        headers: {
          Authorization: process.env.ORS_API_KEY,
          "Content-Type": "application/json"
        }
      }
    );

    // A OpenRouteService retorna coordenadas em formato GeoJSON:
    // [longitude, latitude]
    const coordenadasGeoJSON = resposta.data.features[0].geometry.coordinates;

    // O mapa do front geralmente usa:
    // { latitude, longitude }
    const coordenadasFormatadas = coordenadasGeoJSON.map(
      ([longitude, latitude]) => ({
        latitude,
        longitude
      })
    );

    return coordenadasFormatadas;

  } catch (erro) {
    console.error("Erro ao buscar rota na OpenRouteService:", erro.response?.data || erro.message);

    throw new Error("Erro ao buscar rota.");
  }
}

module.exports = {
  buscarRota
};