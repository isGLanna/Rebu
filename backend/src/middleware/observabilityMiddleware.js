const { statusGauge, httpRequestCounter } = require('../utils/metrics.js');

class ObservabilityMiddleware {
  static async recordMetrics(req, res, next) {
    // Após a resposta ser enviada, incrementa o contador das informações da requisição
    res.on('finish', () => {
      httpRequestCounter.inc({ method: req.method, route: req.path, status_code: res.statusCode });
    })
    
    next();
  }
}

module.exports = { ObservabilityMiddleware };