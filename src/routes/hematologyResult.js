const express = require('express');
const router = express.Router();

const {
    createHematologyResultController,
    getlAllHematologyResultController,
    getHematologyResultByIdController,
    updateHematologyResultController,
    toggleDeleteHematologyResultController
} = require('../controllers/hematologyController');

router.post('/', createHematologyResultController);

router.get('/', getlAllHematologyResultController);

router.get('/:id', getHematologyResultByIdController);

router.patch('/:id', updateHematologyResultController);

router.patch('/:id/toggle-delete', toggleDeleteHematologyResultController);

module.exports = router;
