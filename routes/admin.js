const express = require('express');
const router = express.Router();

const {
    createAdminController,
    getAllAdminController,
    getAdminByIdController,
    updateAdminController,
    toggleAdminStatusController

} = require('../controllers/adminController');

router.post('/', createAdminController);

router.get('/', getAllAdminController);

router.get('/:id', getAdminByIdController);

router.patch('/:id', updateAdminController);

router.patch('/:id/status', toggleAdminStatusController);

module.exports = router;

