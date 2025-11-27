const express = require('express');
const router = express.Router();
const {
  createUltrasoundController,
  getAllUltrasoundController,
  getUltrasoundByIdController,
  uptdateUltrasoundResultController,
  toggleDeleteUltrasoundResultController,
} = require('./ultrasound.controller');

router.post('/', createUltrasoundController);
router.get('/', getAllUltrasoundController);
router.get('/:ultrasound_id', getUltrasoundByIdController);
router.patch('/:ultrasound_id', uptdateUltrasoundResultController);
router.patch('/:ultrasound_id/toggle-delete', toggleDeleteUltrasoundResultController);

module.exports = router;
