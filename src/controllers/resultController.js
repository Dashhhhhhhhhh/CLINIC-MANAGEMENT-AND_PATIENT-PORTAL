const { isValidUUID } = require("../utils/security");
const { Result, createResult, getAllResult, getResultById, updateResult, toggleResultDeleted } = require("../models/resultModel");
const { Patient } = require("../models/patientModel");

async function createResultController (req, res) {
    try {

      const {
        patient_id,
        created_by,
        result_data,
        status,
        test_type_id,
        initial_result_at,
        initial_result_by,
        final_result_at,
        final_result_by
      } = req.body;

    if (!patient_id || !isValidUUID(patient_id)) {
      return res.status(400).json({ message: "Invalid or missing patient_id" });
    }

    if (!created_by || !isValidUUID(created_by)) {
      return res.status(400).json({ message: "Invalid or missing created_by id" });
    }

    if (!test_type_id || !isValidUUID(test_type_id)) {
      return res.status(400).json({ message: "Invalid or missing test_type_id" });
    }

    if (typeof result_data !== "object" || Array.isArray(result_data) || Object.keys(result_data).length === 0 ){
      return res.status(400).json({ message: "Invalid or empty result data." });
    }

    const allowedStatus = ["Pending", "Reviewed", "Approved", "Completed"];
    
    if (status && !allowedStatus.includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value." });
    }

    const patient = await Patient.findByPk(patient_id);
    
    if (!patient) return res.status(404).json({ success: false, message: "Patient not found." });

    const newResult = await createResult({
      patient_id,
      created_by,
      result_data,
      status,
      test_type_id,
      initial_result_at,
      initial_result_by,
      final_result_at,
      final_result_by
    });

    return res.status(201).json({ 
      message: "Result created successfully.",
      result: newResult
    })

  } catch (error) {
    console.error("Error creating result:", error.message);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);
    return res.status(500).json({
      success: false,
      error: "Server error while creating result."
    });
  }
}

async function getAllResultController(req, res) {
  try {
    const { is_deleted } = req.query;

    const parsedDeleted =
      is_deleted === "true" ? true :
      is_deleted === "false" ? false : undefined;

    const results = await getAllResult(parsedDeleted);

    return res.status(200).json({
      success: true,
      count: results.length,
      results,
    });

  } catch (err) {
    console.error("Error fetching results:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getResultByIdController(req, res) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, message: "Invalid UUID" });
    }

    const result = await getResultById(id);

    if (!result) {
      return res.status(404).json({ success: false, error: "Result not found" });
    }

    return res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("Error in getResultByIdController:", err.message);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updateResultController(req, res) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const validStatuses = ["Pending", "Reviewed", "Approved", "Completed"];
    const allowedFields = [
      "initial_result_by",
      "initial_result_at",
      "final_result_at",
      "final_result_by",
      "result_data",
      "status",
      "is_deleted"
    ];

    const update = {};

    for (const key of allowedFields) {
      const value = req.body[key];

      if (value === undefined || value === null) continue;

      if (key === "result_data") {
        if (typeof value !== "object" || Array.isArray(value)) {
          return res.status(400).json({ message: "Invalid result_data format" });
        }
        update[key] = value;
        continue;
      }

      if (key === "initial_result_at" || key === "final_result_at") {
        const dateValue = typeof value === "string" ? value.trim() : value;
        if (isNaN(Date.parse(dateValue))) {
          return res.status(400).json({ message: `Invalid ${key} date` });
        }
        update[key] = new Date(dateValue);
        continue;
      }

      if (key === "is_deleted") {
        if (typeof value === "boolean") {
          update[key] = value;
        } else if (value === "true" || value === "false") {
          update[key] = value === "true";
        } else {
          return res.status(400).json({
            message: "Invalid value for is_deleted. Must be true or false."
          });
        }
        continue;
      }

      if (typeof value === "string") {
        const trimmed = value.trim();

        if ((key === "initial_result_by" || key === "final_result_by") && !isValidUUID(trimmed)) {
          return res.status(400).json({ message: `Invalid ${key} ID` });
        }

        if (key === "status" && !validStatuses.includes(trimmed)) {
          return res.status(400).json({ message: "Invalid status value" });
        }

        update[key] = trimmed;
      } else {
        return res.status(400).json({
          success: false,
          error: `${key} has an invalid type.`
        });
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields to update." });
    }

    const result = await updateResult(id, update);

    return res.status(200).json({
      success: true,
      message: "Result updated successfully.",
      result
    });

  } catch (err) {
    console.error("Error in updateResultController:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error."
    });
  }
}

async function toggleResultDeletedController(req, res) {
  try {
    const { id } = req.params;
    const { is_deleted } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    if (typeof is_deleted !== "boolean") {
      return res.status(400).json({ success: false, error: "is_deleted must be boolean." });
    }

    const result = await toggleResultDeleted(id, is_deleted);

    if (!result) {
      return res.status(404).json({ success: false, error: "Result not found." });
    }

    return res.status(200).json({
      success: true,
      message: result.is_deleted
        ? "Result marked as deleted."
        : "Result restored.",
      result,
    });

  } catch (err) {
    console.error("Error in toggleResultDeletedController:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = {
  createResultController,
  getAllResultController,
  getResultByIdController,
  updateResultController,
  toggleResultDeletedController
} 