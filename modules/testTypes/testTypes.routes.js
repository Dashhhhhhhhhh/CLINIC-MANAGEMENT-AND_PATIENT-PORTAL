const express = require('express');
const router = express.Router();

const {
  createTestTypeController,
  getAllTestTypeController,
  getTestTypesByIdController,
  updateTestTypeController,
  toggleTestTypeStatusController,
} = require('../testTypes/testTypes.controller');

router.post('/', createTestTypeController);

router.get('/', getAllTestTypeController);

router.get('/:id', getTestTypesByIdController);
router.patch('/:id', updateTestTypeController);

router.patch('/:id/status', toggleTestTypeStatusController);

module.exports = router;
