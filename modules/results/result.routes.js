const express = require('express');
const router = express.Router();
const authenticateJWT = require('../../middleware/authMiddleware');

const {
  createResultController,
  getAllResultController,
  getResultByIdController,
  updateResultController,
  toggleResultDeleteController,
} = require('../results/result.controller');
const uploadResultReport = require('../../middleware/uploadResultReporter');
const resultController = require('./result.controller');

router.post('/', authenticateJWT, createResultController);
router.get('/', authenticateJWT, getAllResultController);
router.get('/:result_id', authenticateJWT, getResultByIdController);
router.patch('/:result_id', authenticateJWT, updateResultController);
router.patch('/:result_id/status', authenticateJWT, toggleResultDeleteController);
router.post(
  '/:result_id/report',
  authenticateJWT,
  uploadResultReport.single('file'),
  resultController.uploadResultReport
);

module.exports = router;
