const express = require('express');
const router = express.Router();

const {
  registerStaffController,
  getAllStaffController,
  getStaffByIdController,
  updateStaffController,
  toggleStaffStatusController
} = require('../controllers/staffController');

router.post('/', registerStaffController);

router.get('/', getAllStaffController);

router.get('/:id', getStaffByIdController);

router.patch('/:id', updateStaffController);

router.patch('/:id/status', toggleStaffStatusController);

module.exports = router;
