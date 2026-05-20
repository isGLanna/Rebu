const corridaService = require("../services/corridaService");

async function solicitarCorrida(req, res) {
  const { origem } = req.body;

  const destino = Array.isArray(req.body.destinos)
    ? req.body.destinos.at(-1)
    : req.body.destino;

  const passageiroId = req.usuario.id;

  if (req.usuario.tipo !== "passageiro") {
    return res.status(403).json({
      erro: "Apenas passageiros podem solicitar corridas"
    });
  }

  if (!origem || !destino) {
    return res.status(400).json({
      erro: "Origem e destino são obrigatórios"
    });
  }

  try {
    const corrida = await corridaService.criarCorrida(
      passageiroId,
      origem,
      destino
    );

    res.status(201).json({
      mensagem: "Corrida solicitada com sucesso",
      corrida
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao solicitar corrida" });
  }
}

async function aceitarCorrida(req, res) {
  const corridaId = req.params.id;
  const motoristaId = req.usuario.id;

  if (req.usuario.tipo !== "motorista") {
    return res.status(403).json({ erro: "Apenas motoristas podem aceitar corridas" });
  }

  try {
    const corrida = await corridaService.aceitarCorrida(corridaId, motoristaId);

    if (corrida && corrida.erro) {
      return res.status(409).json({ erro: corrida.erro });
    }

    if (!corrida) {
      return res.status(404).json({ erro: "Corrida não encontrada ou já aceita" });
    }

    res.json({
      mensagem: "Corrida aceita com sucesso",
      corrida
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao aceitar corrida" });
  }
}

async function finalizarCorrida(req, res) {
  const corridaId = req.params.id;
  const motoristaId = req.usuario.id;

  if (req.usuario.tipo !== "motorista") {
    return res.status(403).json({ erro: "Apenas motoristas podem finalizar corridas" });
  }

  try {
    const corrida = await corridaService.finalizarCorrida(corridaId, motoristaId);

    if (!corrida) {
      return res.status(404).json({
        erro: "Corrida não encontrada, não pertence a esse motorista ou ainda não foi aceita"
      });
    }

    res.json({
      mensagem: "Corrida finalizada com sucesso",
      corrida
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao finalizar corrida" });
  }
}

async function buscarCorridaPorId(req, res) {
  const corridaId = req.params.id;

  try {
    const corrida = await corridaService.buscarCorridaPorId(corridaId);

    if (!corrida) {
      return res.status(404).json({ erro: "Corrida não encontrada" });
    }

    res.json({
      id: corrida.id,
      passageiro_id: corrida.passageiro_id,
      origem: corrida.origem,
      destino: corrida.destino,
      status: corrida.status,
      valor: corrida.valor,
      distancia_km: corrida.distancia_km,
      duracao_min: corrida.duracao_min,
      data_hora: corrida.data_hora,
      motorista: corrida.motorista_id
        ? {
            id: corrida.motorista_id,
            nome: corrida.motorista_nome,
            email: corrida.motorista_email
          }
        : null
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar corrida" });
  }
}

async function listarMinhasCorridas(req, res) {
  const passageiroId = req.usuario.id;

  if (req.usuario.tipo !== "passageiro") {
    return res.status(403).json({
      erro: "Apenas passageiros podem listar suas corridas"
    });
  }

  try {
    const corridas = await corridaService.listarMinhasCorridas(passageiroId);
    res.json(corridas);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao listar corridas" });
  }
}

async function listarCorridasPendentes(req, res) {
  if (req.usuario.tipo !== "motorista") {
    return res.status(403).json({ erro: "Apenas motoristas podem ver corridas pendentes" });
  }

  try {
    const corridas = await corridaService.listarCorridasPendentes();
    res.json(corridas);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao listar corridas pendentes" });
  }
}

module.exports = {
  solicitarCorrida,
  aceitarCorrida,
  finalizarCorrida,
  buscarCorridaPorId,
  listarMinhasCorridas,
  listarCorridasPendentes
};