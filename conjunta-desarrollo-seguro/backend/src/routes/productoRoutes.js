const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const multer = require('multer');
const uploadMemoria = multer({ storage: multer.memoryStorage() });

router.get('/', verificarToken, productoController.getAll);
router.get('/siguiente-sku', verificarToken, productoController.siguienteSku);
router.get('/eliminados', verificarToken, soloAdmin, productoController.getEliminados);
router.post('/imagen', verificarToken, upload.single('imagen'), productoController.subirImagen);
router.post('/carga-masiva', verificarToken, soloAdmin, uploadMemoria.single('archivo'), productoController.cargaMasiva);
router.get('/:id', verificarToken, productoController.getById);
router.post('/', verificarToken, productoController.create);
router.put('/:id', verificarToken, productoController.update);
router.delete('/:id', verificarToken, soloAdmin, productoController.delete);
router.patch('/:id/restaurar', verificarToken, soloAdmin, productoController.restaurar);
router.get('/:id/historial-precios', verificarToken, productoController.getHistorialPrecios);

module.exports = router;