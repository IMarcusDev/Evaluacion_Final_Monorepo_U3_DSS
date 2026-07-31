const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, soloAdmin, usuarioController.getAll);
router.post('/', verificarToken, soloAdmin, usuarioController.create);
router.put('/:id', verificarToken, soloAdmin, usuarioController.update);
router.patch('/:id/activo', verificarToken, soloAdmin, usuarioController.toggleActivo);

module.exports = router;