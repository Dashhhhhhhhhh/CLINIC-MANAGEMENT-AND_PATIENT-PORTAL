const express = require('express');
const router = express.Router();

const {
  createRoleController,
  getAllRolesController,
  getRoleByIdController,
  updateRoleController,
  toggleRoleStatusController,
  getRoleController,
} = require('./roles.controller');

router.post('/', createRoleController);
router.get('/', getAllRolesController);
router.get('/available', getRoleController);
router.get('/:id', getRoleByIdController);
router.patch('/:id', updateRoleController);
router.patch('/:id/status', toggleRoleStatusController);

module.exports = router;
