const express = require('express');
const router = express.Router();
const movimientoController = require('../controllers/movimientoController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, movimientoController.getAll);
router.get('/producto/:producto_id', verificarToken, movimientoController.getByProducto);
router.post('/', verificarToken, movimientoController.registrar);

module.exports = router;