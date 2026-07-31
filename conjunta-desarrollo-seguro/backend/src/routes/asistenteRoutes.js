const express = require('express');
const router = express.Router();
const asistenteController = require('../controllers/asistenteController');
const { verificarToken } = require('../middlewares/authMiddleware');

router.post('/preguntar', verificarToken, asistenteController.preguntar);

module.exports = router;