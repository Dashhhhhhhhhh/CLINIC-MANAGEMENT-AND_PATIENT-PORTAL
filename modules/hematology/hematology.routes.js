const express = require('express');
const router = express.Router();

const {
  createHematologyResultController,
  getlAllHematologyResultController,
  getHematologyResultByIdController,
  updateHematologyResultController,
  toggleDeleteHematologyResultController,
} = require('./hematology.controller');

router.post('/', createHematologyResultController);

router.get('/', getlAllHematologyResultController);

router.get('/:hematology_id', getHematologyResultByIdController);

router.patch('/:hematology_id', updateHematologyResultController);

router.patch('/:hematology_id/toggle-delete', toggleDeleteHematologyResultController);

module.exports = router;
