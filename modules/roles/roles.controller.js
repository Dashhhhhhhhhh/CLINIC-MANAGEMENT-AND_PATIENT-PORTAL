const { createRoleService, getAllRolesService, getRoleByIdService, updateRoleService, toggleRoleStatusService, getRoleService, } = require("./roles.service");

async function createRoleController(req, res) {
  try {
    const { role_name, description } = req.body;

    const result = await createRoleService(
      role_name,
      description,
      active
    );

    if (!result.success) return res.status(404).json(result);

    return res.status(201).json(result);

  } catch (err) {
    console.error("Error creating role:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Role already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
}
async function getAllRolesController(req, res) {
  try {
    const { active } = req.query;

    const result = await getAllRolesService();

    return res.status(200).json(result);

  } catch (err) {
    console.error("Error fetching roles:", err);
    return res.status(500).json({ success: false,error: "Internal server error" });
  }
}

async function getRoleByIdController (req,res) {

  try {
    const { role_id } = req.params;

    const result = await getRoleByIdService(role_id);

    if (!result.success) return res.status(404).json(result);

    return res.status(200).json(result);

  } catch (err) {
    console.error("Error in getRolesbyIdController:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updateRoleController(req, res) {
  try {

    const { role_id } = req.params;
    const { updateField } = req.body;

    const result = await updateRoleService(role_id, updateField);

    if(!result.success) return res.status(404).json(result);
    
    return res.status(200).json(result);

  } catch (err) {
    console.error("Error in updateRolesController:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error."
    });
  }
}

async function toggleRoleStatusController (req, res) {
    try {
        const { id } = req.params;
        const { active } = req.body;

        const result = await toggleRoleStatusService(id, active);

        if(!result.success) return res.status(404).json(result);

        return res.status(200).json(result);

    } catch (err) {
        console.error("Error in toggleRoleStatus:", err);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}


async function getRoleController (req, res) {

  try {

    const result = await getRoleService();

    if (!result.success) return res.status(404).json(result);

    return res.status(200).json(result);
    
  } catch (error) {
    console.error("Error in getAvailableController:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}


module.exports = {
    createRoleController,
    getAllRolesController,
    getRoleByIdController,
    updateRoleController,
    toggleRoleStatusController,
    getRoleController
};