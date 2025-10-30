const express = require('express');
const router = express.Router();

const {
    registerDoctorController,
    getAllDoctorController,
    updateDoctorsController,
    getDoctorByIdController,
    toggleDoctorStatusController

} = require('../controllers/doctorController');

router.post('/', registerDoctorController);
router.get('/', getAllDoctorController);


router.get('/:id', getDoctorByIdController);
router.patch('/:id', updateDoctorsController);

router.patch('/:id/status', toggleDoctorStatusController);


module.exports = router;

