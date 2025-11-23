const express = require('express');
const router = express.Router();
const authenticateJWT = require("../../middleware/authMiddleware");


const {
    createResultController,getAllResultController, getResultByIdController,updateResultController, toggleResultDeleteController
} = require('../results/result.controller');


router.post('/',authenticateJWT, createResultController);
router.get('/',authenticateJWT,  getAllResultController);
router.get('/:result_id',authenticateJWT, getResultByIdController);
router.patch('/:result_id',authenticateJWT, updateResultController)
router.patch('/:result_id/status',authenticateJWT, toggleResultDeleteController);


module.exports = router;
