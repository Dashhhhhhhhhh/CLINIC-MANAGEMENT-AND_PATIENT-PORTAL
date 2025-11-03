const express = require('express');
const router = express.Router();

const authenticateJWT = require("../middleware/authMiddleware");

const {
    createBillingItemController,
    getAllItemController,
    getItemByIdController,
    getItemByPatientIdController,
    updateBillingItemController,
    toggleDeletebillingItemController
} = require('../billing/billingItemController');

router.post('/', authenticateJWT, createBillingItemController);
router.get('/', authenticateJWT, getAllItemController);
router.get('/:id', authenticateJWT, getItemByIdController);
router.patch('/:id', authenticateJWT, updateBillingItemController);
router.get("/patient/:patient_id", authenticateJWT, getItemByPatientIdController);
router.patch('/:id/toggle-delete', authenticateJWT, toggleDeletebillingItemController);

module.exports = router;
