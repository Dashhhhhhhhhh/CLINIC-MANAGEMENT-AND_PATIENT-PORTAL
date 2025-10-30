const { isValidUUID } = require("../utils/security");
const { Xray, createXray, getAllXray ,getXrayById, updateXrayResult, toggleDeleteXrayResult } = require("../models/xrayModel");

async function createXrayController(req, res) {
    try {

        const { 
            result_id, 
            xray_type, 
            history,
            comparison,
            technique,
            findings,
            impression,
            remarks,
        } = req.body;

    if (!result_id || !isValidUUID(result_id)) {
      return res.status(400).json({ message: "Invalid or missing result_id" });
    }

    if (!xray_type || typeof xray_type !== "string" || !xray_type.trim()) {
        return res.status(400).json({ success: false, error: "X-ray type is required" });
    }

    const cleanData = {
        result_id: result_id.trim(),
        xray_type: xray_type.trim().toLowerCase(),
        history: history?.trim() || null,
        comparison: comparison?.trim() || null,
        technique: technique?.trim() || null,
        findings: findings?.trim() || null,
        impression: impression?.trim() || null,
        remarks: remarks?.trim() || null,
    };

    const xrayResult = await createXray(cleanData);
    const newXrayResult = xrayResult.get({ plain: true });

   
    return res.status(201).json({ 
        success: true,
        message: "X-ray result created successfully.",
        result: newXrayResult
    });

  } catch (error) {
    console.error("Error creating x-ray result:", error.message);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);
    return res.status(500).json({
      success: false,
      error: "Server error while creating x-ray result."
    });
  }
}

async function getallXrayController(req, res) {
    try {

        const xrayResult = await getAllXray();
    
        return res.status(200).json({
            success: true,
            count: xrayResult.length,
            xrayResult
        });

  } catch (err) {
    console.error("Error fetching x-ray results:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getXrayByIdController (req, res) {
    try {


    const {id } = req.params;

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const xray = await getXrayById(id);

    if (!xray) {
      return res.status(404).json({ success: false, error: "x-ray result not found" });
    }

    return res.status(200).json({ success: true, xray });



  } catch (err) {
    console.error("Error in getting x-ray result by ID:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updateXrayResultController (req, res) {
    try {    
    
    const { id } =  req.params;
    
        if (!isValidUUID(id)) {
          return res.status(400).json({ success: false, error: "Invalid UUID" });
        }
    
        const update = {};

        const allowedFields = [
            'xray_id',
            'result_id',
            'xray_type',
            'history',
            'comparison',
            'technique',
            'findings',
            'impression',
            'remarks',
        ];

    for (const field of allowedFields) {
        let value = req.body[field];
    
        if (value === null || value === undefined) continue;

        let trimmed =value;

        if (typeof value === 'string') {
            trimmed = value.trim()
        } else if (typeof value === 'number') {
          if (!isNaN(Number(value))) {
            trimmed = value;
          } else {
            continue;
          }
        }
       update[field] = trimmed;   
     }       

    if (Object.keys(update).length === 0) {
        return res.status(400).json({ success: false, error: "No fields provided for update." });
    }

    const updateXray = await updateXrayResult(id, update);

    if (!updateXray) {
      return res.status(400).json({ success: false, error: "X-ray result not found" });
    }

    return res.status(200).json({
        success: true,
        message: "Xray result updated.",
        updateXray
    });


  } catch (err) {
    console.error("Error in update x-ray controller", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error."
    });
  }
}

async function  toggleDeleteXrayResultController (req, res) {
    try {

    const { id } = req.params;

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const result = await toggleDeleteXrayResult(id);

    if (!result) {
      return res.status(400).json({ success: false, error: "Result not found."});
    }

    return res.status(200).json({
      success: true,
      message: result.is_deleted ? "Result deleted." : "Result restored.",
      result,
    });

  } catch (err) {
    console.error("Error in toggleDeleteXrayResultController:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = { 
    Xray,
    createXrayController,
    getallXrayController,
    getXrayByIdController, 
    updateXrayResultController,
    toggleDeleteXrayResultController
};