const { createSpecializationService, getAllSpecializationService, getSpecializationByIdService, updateSpecializationService, toggleSpecializationStatusService, getSpecializationService } = require('./specialization.service');

async function createSpecializationController(req, res) {
  try {
    const { specialization_name, description, active } = req.body;

    const result = await createSpecializationService(
        specialization_name,
        description,
        active
    );

    if(!result.success) return res.status(400).json(result);

    return res.status(201).json(result);


  } catch (err) {
    console.error("Error creating doctor:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Specialization already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
}

async function getAllSpecializationController(req, res) {
    try {

        const { active } = req.query;

        const result = await getAllSpecializationService();

        return res.status(200).json(result);

  } catch (err) {
    console.error("Error in getAllDcotorsController:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getSpecializationByIdController(req, res) {
    try {

        const { id  } = req.params;

        const result = await getSpecializationByIdService(id);

        if(!result.success) return res.status(404).json(result);

        return res.status(200).json(result);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }   
}

async function updateSpecializataionController (req, res) {
    try {

        const { id } = req.params;
        const updateField = req.body;


        const result = await updateSpecializationService(id, updateField);

        if(!result.success) return res.status(404).json(result);

        return res.status(200).json(result);
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }   
}

async function toggleSpecializationStatusController(req, res) {
    try {
        const { id } = req.params;
        const { active } = req.body;

        const result = await toggleSpecializationStatusService(id, active);

        if(!result.success) return res.status(404).json(result);

        return res.status(200).json(result);


    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}


async function getSpecializationController (req, res) {
  try {

    const result = await getSpecializationService();

    if (!result.success) return res.status(404).json(result);

    return res.status(200).json(result);
    
  } catch (error) {
    console.error("Error in getAvailableController:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { 
    createSpecializationController,
    getAllSpecializationController,
    getSpecializationByIdController,
    updateSpecializataionController,
    toggleSpecializationStatusController,
    getSpecializationController
};