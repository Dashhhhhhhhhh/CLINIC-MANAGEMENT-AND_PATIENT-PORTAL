const express = require('express');
const { loginAuthController } = require('../users/auth.controller');

const router = express.Router();

router.post('/login', loginAuthController);


module.exports = router;