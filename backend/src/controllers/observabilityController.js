const { register } = require('../utils/metrics');

class ObservabilityController {
  static async getMetrics(req, res) {
    try {
      const metrics = await register.metrics();

      res.set('Content-Type', register.contentType);
      res.end(metrics)
    } catch (error) {
      res.status(500).send('Erro ao coletar métricas');
    }
  }
}

module.exports = { ObservabilityController };