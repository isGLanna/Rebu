const { ObservabilityController } = require('../controllers/observabilityController');
const { Router } = require('express');

const route = new Router();

route.get('/', async (req, res) => await ObservabilityController.getMetrics(req, res));

module.exports = route;