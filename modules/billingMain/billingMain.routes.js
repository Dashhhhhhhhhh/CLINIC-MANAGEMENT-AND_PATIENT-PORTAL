const express = require('express');
const router = express.Router();

const {
  createBillingController,
  getAllBillController,
  getBillingByIdController,
  toggleDeletebillingController,
  finalizeBillingController,
  getAvailablePatientsByController,
} = require('../billingMain/billingMain.controller');

const authMiddleware = require('../../middleware/authMiddleware');

router.post('/', authMiddleware, createBillingController);
router.get('/', authMiddleware, getAllBillController);
router.get('/available-patients', getAvailablePatientsByController);
router.get('/:billing_id', authMiddleware, getBillingByIdController);
router.patch('/:billing_id/toggle-delete', authMiddleware, toggleDeletebillingController);
router.patch('/:billing_id/finalize', authMiddleware, finalizeBillingController);

module.exports = router;
