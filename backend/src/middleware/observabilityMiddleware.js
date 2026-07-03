const { statusGauge, httpRequestCounter } = require('../utils/metrics.js');

class ObservabilityMiddleware {
  static async recordMetrics(req, res, next) {
    // Calcula a família de status
    const statusFamily = (res.statusCode % 100) * 100;

    // Após a resposta ser enviada no controlador, incrementa o contador das informações da requisição
    res.on('finish', () => {
      httpRequestCounter.inc({ method: req.method, route: req.path, status_code: statusFamily });
    })
    
    next();
  }
}

module.exports = { ObservabilityMiddleware };