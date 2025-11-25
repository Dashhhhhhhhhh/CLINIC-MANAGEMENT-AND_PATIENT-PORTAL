const express = require('express');
const router = express.Router();
const {
  createUltrasoundController,
  getAllUltrasoundController,
  getUltrasoundByIdController,
  uptdateUltrasoundResultController,
  toggleDeleteUltrasoundResultController,
} = require('../controllers/ultrasoundController');

router.post('/', createUltrasoundController);
router.get('/', getAllUltrasoundController);
router.get('/:id', getUltrasoundByIdController);
router.patch('/:id', uptdateUltrasoundResultController);
router.patch('/:id/toggle-delete', toggleDeleteUltrasoundResultController);

module.exports = router;
