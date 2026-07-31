const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/metricas', verificarToken, dashboardController.getMetricas);
router.get('/alertas', verificarToken, dashboardController.getAlertas);
router.get('/sin-movimiento', verificarToken, dashboardController.getSinMovimiento);
router.get('/valor-por-categoria', verificarToken, dashboardController.getValorPorCategoria);

module.exports = router;