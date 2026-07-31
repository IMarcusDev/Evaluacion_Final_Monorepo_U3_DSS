const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verificarToken } = require('../middlewares/authMiddleware');
const loginLimiter = require('../middlewares/rateLimitMiddleware');

router.post('/register', authController.register);
router.post('/login', loginLimiter, authController.login);
router.get('/perfil', verificarToken, authController.miPerfil);
router.put('/perfil', verificarToken, authController.actualizarPerfil);

module.exports = router;