async function buscarCoordenadas(endereco) {
  const url = `https://api.openrouteservice.org/geocode/search?api_key=${process.env.ORS_API_KEY}&text=${encodeURIComponent(endereco)}`;

  const resposta = await fetch(url);
  const dados = await resposta.json();

  if (!dados.features || dados.features.length === 0) {
    throw new Error("Endereço não encontrado: " + endereco);
  }

  return dados.features[0].geometry.coordinates;
}

async function calcularRota(origem, destino) {
  const origemCoords = await buscarCoordenadas(origem);
  const destinoCoords = await buscarCoordenadas(destino);

  const resposta = await fetch("https://api.openrouteservice.org/v2/directions/driving-car", {
    method: "POST",
    headers: {
      "Authorization": process.env.ORS_API_KEY,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      coordinates: [origemCoords, destinoCoords]
    })
  });

  const dados = await resposta.json();

  if (!dados.routes || dados.routes.length === 0) {
    throw new Error("Não foi possível calcular a rota");
  }

  const resumo = dados.routes[0].summary;

  const distanciaKm = resumo.distance / 1000;
  const duracaoMin = resumo.duration / 60;

  return {
    distanciaKm: Number(distanciaKm.toFixed(2)),
    duracaoMin: Number(duracaoMin.toFixed(2))
  };
}

function calcularValor(distanciaKm) {
  const taxaFixa = 5;
  const valorPorKm = 2.5;

  return Number((taxaFixa + distanciaKm * valorPorKm).toFixed(2));
}

module.exports = {
  calcularRota,
  calcularValor
};