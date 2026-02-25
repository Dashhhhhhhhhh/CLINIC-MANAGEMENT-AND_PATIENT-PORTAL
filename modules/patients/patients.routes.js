const express = require('express');
const router = express.Router();

const {
  registerPatientController,
  getPatientByIdController,
  getAllPatientsController,
  updatePatientController,
  togglePatientStatusController,
  getAvailablePatientUsersController,
} = require('./patients.controller');

router.post('/', registerPatientController);

router.get('/', getAllPatientsController);
router.get('/available-users', getAvailablePatientUsersController);

router.get('/:id', getPatientByIdController);

router.patch('/:id/status', togglePatientStatusController);
router.patch('/:patient_id', updatePatientController);

module.exports = router;
