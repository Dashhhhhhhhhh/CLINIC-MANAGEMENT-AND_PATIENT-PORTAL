const express = require('express');
const router = express.Router();
const {
  createXrayController,
  getallXrayController,
  getXrayByIdController,
  updateXrayResultController,
  toggleDeleteXrayResultController,
} = require('./xray.controller');

router.post('/', createXrayController);
router.get('/', getallXrayController);
router.get('/:xray_id', getXrayByIdController);
router.patch('/:xray_id', updateXrayResultController);
router.patch('/:xray_id/toggle-delete', toggleDeleteXrayResultController);

module.exports = router;
