const { isValidUUID } = require("../utils/security");
const { Position, createPosition, getAllPositions, getPositionById, updatePosition, togglePositionStatus} = require('../models/positionModel');


async function createPositionController(req, res) {
  try {
    const { position_name } = req.body;

    if (!position_name || !position_name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Position name is required."
      });
    }

    const cleanedPositionName = position_name.trim();

    if (cleanedPositionName.length > 50) {
      return res.status(400).json({ success: false, error: "Position name must not exceed 50 characters." });
    }


    const lettersOnlyRegex = /^[a-zA-Z\s]+$/;
    if (!lettersOnlyRegex.test(cleanedPositionName)) {
      return res.status(400).json({ success: false, error: "Position name must contain only letters and spaces." });
    }

    const position = await createPosition({
      position_name: cleanedPositionName
  });

    return res.status(200).json({
      success: true,
      message: "Position created successfully",
      position
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getAllPositionsController(req, res) {
  try {
    const { active } = req.query;

    const parsedActive =
      active === "true" ? true :
      active === "false" ? false : undefined;

    const positions = await getAllPositions(parsedActive);

    return res.status(200).json({
      success: true,
      count: positions.length,
      positions
    });

  } catch (err) {
    console.error("Error fetching positions:", err);
    return res.status(500).json({ success: false,error: "Internal server error" });
  }
}


async function getPositionByIdController(req, res) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
    return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const position = await getPositionById(id);

    if (!position) {
      return res.status(404).json({ success: false, error: "Position not found" });
    }

    return res.status(200).json({ success: true, position });

  } catch (err) {
    console.error("Error in getPositionByIdController:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updatePositionController(req, res) {
  try {
    const { id } = req.params;
    let update = {};

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const allowedFields = ['position_name', 'active'];
    const lettersOnlyRegex = /^[a-zA-Z\s]+$/;

    for (const key of allowedFields) {
      const value = req.body[key];

      if (value === undefined || value === null) {
        continue;
      }

      if (typeof value === 'string') {
        const trimmed = value.trim();

        if (key === 'position_name') {
          if (trimmed.length > 50) {
            return res.status(400).json({
              success: false,
              error: "Position name must not exceed 50 characters."
            });
          }

          if (!lettersOnlyRegex.test(trimmed)) {
            return res.status(400).json({
              success: false,
              error: "Position name must contain only letters and spaces."
            });
          }

          update[key] = trimmed;
        } else if (key === 'active') {
          if (trimmed !== 'true' && trimmed !== 'false') {
            return res.status(400).json({
              success: false,
              error: "Invalid value for active. Must be true or false."
            });
          }

          update[key] = trimmed === 'true';
        }
      } else if (typeof value === 'boolean' && key === 'active') {
        update[key] = value;
      } else {
        return res.status(400).json({
          success: false,
          error: `${key} has an invalid type.`
        });
      }
    }

        if (Object.keys(update).length === 0) {
            return res.status(400).json({ success: false, error: "No fields to update" });
        }
        
        const position = await updatePosition(id, update);
        
        if (!position) {
            return res.status(404).json({ success: false, error: "Position not found" });
        }
        
        return res.status(200).json({ success: true, position });
        
    

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

        if (!isValidUUID(id)) {
            return res.status(400).json({ success: false, error: "Invalid UUID" });
        }

        if (typeof active !== "boolean") {
            return res.status(400).json({ success: false, error: "Active status must be boolean." });
        }

        const position = await togglePositionStatus(id, active);

        if (!position) {
            return res.status(404).json({ success: false, error: "Position not found." });
        }

        return res.status(200).json({
            success: true,
            message: position.active 
                ? "Position reactivated." 
                : "Position deactivated.",
            position,
        });

    } catch (err) {
        console.error("Error in togglePositionStatusController:", err);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}


module.exports = { 
    createPositionController,
    getAllPositionsController,
    getPositionByIdController,
    updatePositionController,
    togglePositionStatusController
};

