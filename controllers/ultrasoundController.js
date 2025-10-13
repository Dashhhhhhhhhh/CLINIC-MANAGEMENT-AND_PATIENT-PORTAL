const { isValidUUID } = require("../utils/security");
const { Ultrasound, createUltrasound, getAllUltrasound ,getUltrasoundById, updateUltrasoundResult, toggleDeleteUltrasoundResult } = require("../models/ultrasoundModel");

async function createUltrasoundController(req, res) {
    try {

        const { 
            result_id, 
            ultrasound_type, 
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

    if (!ultrasound_type || typeof ultrasound_type !== "string" || !ultrasound_type.trim()) {
        return res.status(400).json({ success: false, error: "Ultrasound  type is required" });
    }

    const cleanData = {
        result_id: result_id.trim(),
        ultrasound_type: ultrasound_type.trim().toLowerCase(),
        history: history?.trim() || null,
        comparison: comparison?.trim() || null,
        technique: technique?.trim() || null,
        findings: findings?.trim() || null,
        impression: impression?.trim() || null,
        remarks: remarks?.trim() || null,
    };

    const ultrasoundResult = await createUltrasound(cleanData);
    const newUltrasoundResult = ultrasoundResult.get({ plain: true });

   
    return res.status(201).json({ 
        success: true,
        message: "Ultrasound result created successfully.",
        result: newUltrasoundResult
    });

  } catch (error) {
    console.error("Error ultrasound ultrasound result:", error.message);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);
    return res.status(500).json({
      success: false,
      error: "Server error while creating ultrasound result."
    });
  }
}

async function getAllUltrasoundController(req, res) {
    try {

        const ultrasoundResults  = await getAllUltrasound();
    
        return res.status(200).json({
            success: true,
            count: ultrasoundResults.length ,
            ultrasoundResults 
        });

  } catch (err) {
    console.error("Error fetching ultrasound results.", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getUltrasoundByIdController (req, res) {
    try {


    const {id } = req.params;

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const ultrasound = await getUltrasoundById(id);

    if (!ultrasound) {
      return res.status(404).json({ success: false, error: "ultrasound result not found" });
    }

    return res.status(200).json({ success: true, ultrasound });



  } catch (err) {
    console.error("Error in getting ultrasound result by ID:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function uptdateUltrasoundResultController (req, res) {
    try {    
    
    const { id } =  req.params;
    
        if (!isValidUUID(id)) {
          return res.status(400).json({ success: false, error: "Invalid UUID" });
        }
    
        const update = {};

        const allowedFields = [
            'ultrasound_id',
            'result_id',
            'ultrasound_type',
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

    const uptdateUltrasound = await updateUltrasoundResult(id, update);

    if (!uptdateUltrasound) {
      return res.status(400).json({ success: false, error: "Ultrasound result not found" });
    }

    return res.status(200).json({
        success: true,
        message: "Ultrasound result updated.",
        uptdateUltrasound
    });


  } catch (err) {
    console.error("Error in update Ultrasound controller", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error."
    });
  }
}

async function  toggleDeleteUltrasoundResultController (req, res) {
    try {

    const { id } = req.params;

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const result = await toggleDeleteUltrasoundResult(id);

    if (!result) {
      return res.status(400).json({ success: false, error: "Result not found."});
    }

    return res.status(200).json({
      success: true,
      message: result.is_deleted ? "Result deleted." : "Result restored.",
      result,
    });

  } catch (err) {
    console.error("Error in toggleDeleteUltrasoundResultController:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = { 
    Ultrasound,
    createUltrasoundController,
    getAllUltrasoundController,
    getUltrasoundByIdController, 
    uptdateUltrasoundResultController,
    toggleDeleteUltrasoundResultController
};