const express = require('express');
const router = express.Router();

const {
    createResultController,getAllResultController, getResultByIdController,updateResultController, toggleResultDeletedController
} = require('../controllers/resultController');


router.post('/', createResultController);
router.get('/', getAllResultController);
router.get('/:id', getResultByIdController);
router.patch('/:id', updateResultController)
router.patch('/:id/status', toggleResultDeletedController);


module.exports = router;
