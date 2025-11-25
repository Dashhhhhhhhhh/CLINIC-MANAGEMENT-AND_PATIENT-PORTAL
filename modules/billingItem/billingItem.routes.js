const express = require('express');
const router = express.Router();

const authenticateJWT = require('../../middleware/authMiddleware');

const {
  createBillingItemController,
  getAllItemController,
  getItemByIdController,
  updateBillingItemController,
  toggleDeletebillingItemController,
} = require('../billingItem/billingItem.controller');

router.post('/', authenticateJWT, createBillingItemController);
router.get('/', authenticateJWT, getAllItemController);

router.get('/:billing_item_id', authenticateJWT, getItemByIdController);
router.patch('/:billing_item_id', authenticateJWT, updateBillingItemController);

router.patch('/:billing_item_id/toggle-delete', authenticateJWT, toggleDeletebillingItemController);

module.exports = router;
