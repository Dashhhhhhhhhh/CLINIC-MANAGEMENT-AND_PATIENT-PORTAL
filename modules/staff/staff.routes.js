const express = require('express');
const router = express.Router();

const {
  registerStaffController,
  getAllStaffController,
  getStaffByIdController,
  updateStaffController,
  toggleStaffStatusController,
  getAvailableStaffUsersController
} = require('./staff.controller');

router.post('/', registerStaffController);

router.get('/', getAllStaffController);

router.get("/available-users", getAvailableStaffUsersController);

router.get('/:id', getStaffByIdController);

router.patch("/:staff_id", updateStaffController);

router.patch('/:id/status', toggleStaffStatusController);

module.exports = router;
