const express = require('express');
const router = express.Router();

const {
    createSpecializationController, getAllSpecializationController, getSpecializationByIdController, updateSpecializataionController, toggleSpecializationStatusController
} = require('../controllers/specializationController');



router.post('/', createSpecializationController);
router.get('/', getAllSpecializationController);
router.get('/:id', getSpecializationByIdController);
router.patch('/:id', updateSpecializataionController);
router.patch('/:id/status', toggleSpecializationStatusController);

module.exports = router;