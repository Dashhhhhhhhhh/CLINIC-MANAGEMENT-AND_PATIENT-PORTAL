const express = require('express');
const router = express.Router();

const {
  createUrinalysisController,
  getAllUrinalysisResultController,
  getAllUrinalysisByIdController,
  updateUrinalysisResultController,
  toggleUrinalysisStatusController,
} = require('./urinalysis.controller');

router.post('/', createUrinalysisController);

router.get('/', getAllUrinalysisResultController);

router.get('/:urinalysis_id', getAllUrinalysisByIdController);

router.patch('/:urinalysis_id', updateUrinalysisResultController);

router.patch('/:urinalysis_id/toggle-delete', toggleUrinalysisStatusController);

module.exports = router;
