
const express = require('express');
const router = express.Router();

const { 
  registerAuthController,
  getAllUsersController,  
  getUsersIdController, 
  updateUsersController, 
  toggleUserStatusController,
  getAvailableRoleController
} = require('./user.controller');

router.post('/register', registerAuthController);

router.get('/available', getAvailableRoleController);
router.get('/', getAllUsersController);
router.get('/:id', getUsersIdController);

router.patch('/:id', updateUsersController);
router.patch('/:id/status', toggleUserStatusController);

module.exports = router;
