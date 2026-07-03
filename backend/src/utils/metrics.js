const { Registry, Counter, collectDefaultMetrics } = require('prom-client');

const register = new Registry();

collectDefaultMetrics({ register });

const httpRequestCounter = new Counter({
  name: 'http_request_total',
  help: 'Total de requisições HTTP recebidas',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
})

module.exports = { httpRequestCounter, register };