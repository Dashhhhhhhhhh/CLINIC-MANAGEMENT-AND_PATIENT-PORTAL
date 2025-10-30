const express = require('express');
const router = express.Router();

const {
    createBillingController,
    getAllBillController,
    getBillingByIdController,
    getBillingByPatientIdController,
    toggleDeletebillingController,
    finalizeBillingController
} = require('../billing/billingMainController');

const authMiddleware = require("../middleware/authMiddleware");

router.post('/', authMiddleware, createBillingController);
router.get('/', authMiddleware, getAllBillController);
router.get('/:id', authMiddleware, getBillingByIdController);
router.get("/patient/:patient_id", authMiddleware, getBillingByPatientIdController);
router.patch('/:id/toggle-delete', authMiddleware, toggleDeletebillingController);
router.patch('/:id/finalize', authMiddleware, finalizeBillingController);
module.exports = router;
