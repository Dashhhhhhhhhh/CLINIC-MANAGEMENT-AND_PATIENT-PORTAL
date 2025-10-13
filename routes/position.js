const express = require('express');
const router = express.Router();

const {
    createPositionController,
    getAllPositionsController,
    getPositionByIdController,
    updatePositionController,
    togglePositionStatusController
} = require('../controllers/positionController');

router.post('/', createPositionController);

router.get('/', getAllPositionsController);
router.get('/:id', getPositionByIdController);


router.patch('/:id', updatePositionController);
router.patch('/:id/status', togglePositionStatusController);

module.exports = router;