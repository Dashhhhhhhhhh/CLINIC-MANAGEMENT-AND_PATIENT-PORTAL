
const express = require('express');
const router = express.Router();

const { 
  getAllUsersController,  
  getUsersIdController, 
  updateUsersController, 
  toggleUserStatusController 
} = require('./user.controller');

router.get('/', getAllUsersController);

router.get('/:id', getUsersIdController);

router.patch('/:id', updateUsersController);

router.patch('/:id/status', toggleUserStatusController);

module.exports = router;
