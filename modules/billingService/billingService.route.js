const express = require('express');
const router = express.Router();

const {
    createBillingServiceController,
    getAllBillingServiceController,
    getBillingServiceByIdController,
    updateServiceController,
    toggleDeleteServiceController
} = require('../billing/billingServiceController');

router.post('/', createBillingServiceController);
router.get('/', getAllBillingServiceController);
router.get('/:id', getBillingServiceByIdController);
router.patch('/:id',updateServiceController );
router.patch('/:id/toggle-delete', toggleDeleteServiceController);

module.exports = router;
