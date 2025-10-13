const express = require('express');
const router = express.Router();

const {
    registerPatientController,
    getPatientByIdController,
    getAllPatientsController,
    updatePatientController,
    togglePatientStatusController
} = require('../controllers/patientController');

router.post('/', registerPatientController);

router.get('/', getAllPatientsController);
router.get('/:id', getPatientByIdController);


router.patch('/:id', updatePatientController);
router.patch('/:id/status', togglePatientStatusController);

module.exports = router;

