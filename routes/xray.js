const express = require("express");
const router = express.Router();
const {
  createXrayController,
  getallXrayController,
  getXrayByIdController,
  updateXrayResultController,
  toggleDeleteXrayResultController,
} = require("../controllers/xrayController");

router.post("/", createXrayController);
router.get("/", getallXrayController);
router.get("/:id", getXrayByIdController);
router.patch("/:id", updateXrayResultController);
router.patch("/:id/toggle-delete", toggleDeleteXrayResultController);

module.exports = router;
