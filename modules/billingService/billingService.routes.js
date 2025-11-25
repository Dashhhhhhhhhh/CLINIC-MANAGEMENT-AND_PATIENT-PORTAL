const express = require('express');
const router = express.Router();

const {
  createBillingServiceController,
  getAllBillingServiceController,
  getBillingServiceByIdController,
  updateServiceController,
  toggleDeleteServiceController,
} = require('../billingService/billingService.controller');

router.post('/', createBillingServiceController);
router.get('/', getAllBillingServiceController);
router.get('/:service_id', getBillingServiceByIdController);
router.patch('/:service_id', updateServiceController);
router.patch('/:service_id/toggle-delete', toggleDeleteServiceController);

module.exports = router;
