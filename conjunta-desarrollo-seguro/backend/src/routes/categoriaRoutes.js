const express = require('express');
const router = express.Router();
const categoriaController = require('../controllers/categoriaController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.get('/', verificarToken, categoriaController.getAll);
router.get('/:id', verificarToken, categoriaController.getById);
router.post('/', verificarToken, soloAdmin, categoriaController.create);
router.put('/:id', verificarToken, soloAdmin, categoriaController.update);
router.delete('/:id', verificarToken, soloAdmin, categoriaController.delete);

module.exports = router;