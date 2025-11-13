const express = require('express');
const router = express.Router();

const {
    createPositionController,
    getAllPositionsController,
    getPositionByIdController,
    updatePositionController,
    togglePositionStatusController,
    getAvailablePositionController
} = require('./position.controller');

router.post('/', createPositionController)

router.get('/', getAllPositionsController);
router.get('/available', getAvailablePositionController);
router.get('/:id', getPositionByIdController);


router.patch('/:id', updatePositionController);
router.patch('/:id/status', togglePositionStatusController);

module.exports = router;