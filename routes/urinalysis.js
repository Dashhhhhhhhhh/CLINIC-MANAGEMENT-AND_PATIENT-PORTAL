const express = require('express');
const router = express.Router();

const {
  createUrinalysisController,
  getAllUrinalysisResultController,
  getAllUrinalysisByIdController,
  updateUrinalysisResultController,
  toggleDeletedUrinalysisResultController,
} = require('../controllers/urinalysisController');

router.post('/', createUrinalysisController);

router.get('/', getAllUrinalysisResultController);

router.get('/:id', getAllUrinalysisByIdController);

router.patch('/:id', updateUrinalysisResultController);

router.patch('/:id/toggle-delete', toggleDeletedUrinalysisResultController);

module.exports = router;
