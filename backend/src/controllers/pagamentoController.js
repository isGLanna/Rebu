const pagamentoService = require("../services/pagamentoService");

async function pagarCorrida(req, res) {
  const { corridaId, metodo } = req.body;
  const passageiroId = req.usuario.id;

  const metodosValidos = ["pix", "cartao", "dinheiro"];

  if (!corridaId || !metodo) {
    return res.status(400).json({ erro: "corridaId e metodo são obrigatórios" });
  }

  if (!metodosValidos.includes(metodo)) {
    return res.status(400).json({
      erro: "Método de pagamento inválido. Use: pix, cartao ou dinheiro"
    });
  }

  try {
    const pagamento = await pagamentoService.pagarCorrida(
      corridaId,
      passageiroId,
      metodo
    );

    if (!pagamento) {
      return res.status(404).json({
        erro: "Corrida não encontrada, não finalizada ou não pertence a esse passageiro"
      });
    }

    res.status(201).json({
      mensagem: "Pagamento realizado com sucesso",
      pagamento
    });
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao realizar pagamento" });
  }
}

async function buscarPagamentoPorCorrida(req, res) {
  const corridaId = req.params.corridaId;

  try {
    const pagamento = await pagamentoService.buscarPagamentoPorCorrida(corridaId);

    if (!pagamento) {
      return res.status(404).json({ erro: "Pagamento não encontrado" });
    }

    res.json(pagamento);
  } catch (erro) {
    console.error(erro);
    res.status(500).json({ erro: "Erro ao buscar pagamento" });
  }
}

module.exports = {
  pagarCorrida,
  buscarPagamentoPorCorrida
};