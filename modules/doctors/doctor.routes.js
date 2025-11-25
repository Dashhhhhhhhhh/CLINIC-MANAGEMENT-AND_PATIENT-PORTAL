const express = require('express');
const router = express.Router();

const {
  registerDoctorController,
  getAllDoctorController,
  updateDoctorsController,
  getDoctorByIdController,
  toggleDoctorStatusController,
  getAvailableDoctorUsersController,
} = require('./doctor.controller');

router.post('/', registerDoctorController);
router.get('/', getAllDoctorController);

router.get('/available-users', getAvailableDoctorUsersController);

router.get('/:doctor_id', getDoctorByIdController);
router.patch('/:id', updateDoctorsController);

router.patch('/:id/status', toggleDoctorStatusController);

module.exports = router;
