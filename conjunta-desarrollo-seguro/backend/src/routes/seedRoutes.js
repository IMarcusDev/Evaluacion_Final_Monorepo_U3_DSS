const express = require('express');
const router = express.Router();
const seedController = require('../controllers/seedController');
const { verificarToken, soloAdmin } = require('../middlewares/authMiddleware');

router.post('/cargar-demo', verificarToken, soloAdmin, seedController.cargarDemo);

module.exports = router;