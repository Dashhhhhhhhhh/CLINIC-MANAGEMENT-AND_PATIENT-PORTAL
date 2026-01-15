const express = require('express');
const router = express.Router();

const {
  createHematologyResultController,
  getlAllHematologyResultController,
  getHematologyResultByIdController,
  updateHematologyResultController,
  toggleDeleteHematologyResultController,
  getHematologyByResultIdController,
} = require('./hematology.controller');

router.post('/', createHematologyResultController);

router.get('/', getlAllHematologyResultController);

router.get('/by-result/:result_id', getHematologyByResultIdController);

router.get('/:hematology_id', getHematologyResultByIdController);

router.patch('/:hematology_id', updateHematologyResultController);

router.patch('/:hematology_id/toggle-delete', toggleDeleteHematologyResultController);

module.exports = router;
