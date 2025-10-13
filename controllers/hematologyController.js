const { isValidUUID } = require("../utils/security");
const { Hematology, createHematologyResult, getAllHematologyResult, getHematologyResultById, updateHematologyResult, toggleDeleteHematologyResult } = require("../models/hematologyModel");

async function createHematologyResultController(req, res) {
  try {
    const { 
      result_id,
      hemoglobin,
      hematocrit,
      rbc_count,
      wbc_count,
      platelet_count,
      mcv,
      mch,
      mchc,
      neutrophils,
      lymphocytes,
      monocytes,
      eosinophils,
      basophils,
      other
    } = req.body;

    if (!result_id || !isValidUUID(result_id)) {
      return res.status(400).json({ message: "Invalid or missing result_id" });
    }

    const allowedFields = [
      'hemoglobin', 'hematocrit', 'rbc_count', 'wbc_count', 'platelet_count',
      'mcv', 'mch', 'mchc', 'neutrophils', 'lymphocytes', 'monocytes',
      'eosinophils', 'basophils'
    ];

    const decimalPattern = /^\d{1,4}(\.\d{1,2})?$/;
    const resultField = {};

    for (const field of allowedFields) {
      let value = req.body[field];
      if (value === undefined || value === null) continue;

      let trimmed = value;
      if (typeof value === 'string') {
        trimmed = value.trim();
      }

      if (trimmed && (isNaN(Number(trimmed)) || !decimalPattern.test(trimmed))) {
        return res.status(400).json({
          success: false,
          error: `${field} must be a valid number with up to 4 digits before the decimal and up to 2 digits after.`
        });
      }

      resultField[field] = trimmed;
    }

    const hematologyResult = await createHematologyResult({
      result_id,
      ...resultField,
      other
    });

    const newHematologyResult = hematologyResult.get({ plain: true });

    return res.status(201).json({
      success: true,
      message: "Hematology result created.",
      result: newHematologyResult,
    });

  } catch (error) {
    console.error("Error creating hematology result:", error.message);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);
    return res.status(500).json({
      success: false,
      error: "Server error while creating hematology result."
    });
  }
}

async function getlAllHematologyResultController(req, res){ 
    try {

        const hematologyResults = await getAllHematologyResult();
    
        return res.status(200).json({
            success: true,
            count: hematologyResults.length,
            hematologyResults
        });

  } catch (err) {
    console.error("Error fetching hematology results:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getHematologyResultByIdController(req, res) {
    try {

    const {id } = req.params;

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const hematology = await getHematologyResultById(id);

    if (!hematology) {
      return res.status(404).json({ success: false, error: "Hematology result not found" });
    }

    return res.status(200).json({ success: true, hematology });

  } catch (err) {
    console.error("Error in getting hematology result by ID:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updateHematologyResultController(req, res) {
    try {

    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const allowedFields = [
      'hemoglobin', 'hematocrit', 'rbc_count', 'wbc_count', 'platelet_count',
      'mcv', 'mch', 'mchc', 'neutrophils', 'lymphocytes', 'monocytes',
      'eosinophils', 'basophils'
    ];

    const decimalPattern = /^\d{1,4}(\.\d{1,2})?$/;
    const update = {};

    for (const field of allowedFields) {
      let value = req.body[field];
      if (value === undefined || value === null) continue;

      let trimmed = value;
      if (typeof value === 'string') {
        trimmed = value.trim();
      }

      if (trimmed && (isNaN(Number(trimmed)) || !decimalPattern.test(trimmed))) {
        return res.status(400).json({
          success: false,
          error: `${field} must be a valid number with up to 4 digits before the decimal and up to 2 digits after.`
        });
      }

      update[field] = trimmed;
    }

    if (Object.keys(update).length === 0) {
        return res.status(400).json({ success: false, error: "No fields provided for update." });
    }

    const updatedHematology = await updateHematologyResult(id, update);

    if (!updatedHematology) {
        return res.status(404).json({ success: false, error: "Hematology result not found." });
    }

    return res.status(200).json ({
        success: true,
        message: "Hematology result updated successfully.",
        updatedHematology
    });

  } catch (err) {
    console.error("Error in updateHematologyResultController", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error."
    });
  }
}

async function toggleDeleteHematologyResultController(req, res) {
  try {

    const { id } = req.params;

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const result = await toggleDeleteHematologyResult(id);

    if (!result) {
        return res.status(400).json({ success: false, error: "Result not found" });
    }

    return res.status(200).json({ 
        success: true,
        message: result.is_deleted
            ? "Result deleted."
            : "Result restored.",
        result,
    });

  } catch (err) {
    console.error("Error in toggleDeleteHematologyResultController:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}



module.exports = {
    createHematologyResultController,
    getlAllHematologyResultController,
    getHematologyResultByIdController,
    updateHematologyResultController,
    toggleDeleteHematologyResultController
}
