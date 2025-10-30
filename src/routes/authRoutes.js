const express = require('express');
const { registerAuthController, loginAuthController } = require('../controllers/authController');

const router = express.Router();

router.post('/register', registerAuthController);

router.post('/login', loginAuthController);


module.exports = router;