const { createPositionService, getAllPositionsService, getPositionByIdService, updatePositionService, togglePositionStatusService, getAvailablePositionService} = require('./position.service');


async function createPositionController(req, res) {
  try {
    const { position_name, active } = req.body;

    const result = await createPositionService(
      position_name,
      active
    )

    if (!result.success) return res.status(400).json(result);

    return res.status(200).json(result);

  } catch (err) {
    console.error("Error creating staff:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Position already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
}

async function getAllPositionsController(req, res) {
  try {

    const result = await getAllPositionsService();

    return res.status(200).json(result);

  } catch (err) {
    console.error("Error fetching positions:", err);
    return res.status(500).json({ success: false,error: "Internal server error" });
  }
}


async function getPositionByIdController(req, res) {
  try {
    const { id } = req.params;

    const result = await getPositionByIdService();

    if (!result.success) return res.status(404).json(result);

    return res.status(200).json(result);

  } catch (err) {
    console.error("Error in getPositionByIdController:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updatePositionController(req, res) {
  try {
    
    const { id } = req.params;
  
    const updateField = req.body;

    const result = await updatePositionService(id, updateField);

    if(!result.success) return res.status(404).json(result)

    return res.status(200).json(result);   

  } catch (err) {
    console.error("Error in updatePositionController:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error."
    });
  }
} 

async function togglePositionStatusController(req, res) {
    try {
        const { id } = req.params;
        const { active } = req.body;

      const result = await togglePositionStatusService(id, active);

      if (!result.success) return res.status(400).json(result);    

      return res.status(200).json(result);

    } catch (err) {
        console.error("Error in togglePositionStatusController:", err);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

async function getAvailablePositionController(req, res) {
  try {

  const result = await getAvailablePositionService();

    if (!result.success) return res.status(404).json(result);

    return res.status(200).json(result);
    
  } catch (error) {
    console.error("Error in getAvailableController:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = { 
    createPositionController,
    getAllPositionsController,
    getPositionByIdController,
    updatePositionController,
    togglePositionStatusController,
    getAvailablePositionController
};

