const express = require('express');
const router = express.Router();
const proveedorController = require('../controllers/proveedorController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, proveedorController.getAll);
router.get('/:id', verificarToken, proveedorController.getById);
router.post('/', verificarToken, soloAdmin, proveedorController.create);
router.put('/:id', verificarToken, soloAdmin, proveedorController.update);
router.delete('/:id', verificarToken, soloAdmin, proveedorController.delete);

module.exports = router;