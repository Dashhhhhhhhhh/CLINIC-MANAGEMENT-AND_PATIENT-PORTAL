const { getAllUsersService, getUsersByIdService, updateUsersService, toggleUserStatusService } = require('./user.service');

async function getAllUsersController(req, res) {
    try {

        const result = await getAllUsersService();
        
        return res.status(200).json({
            success: true,
            User: result
        });

    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

async function getUsersIdController(req, res) {
    try {

    const { id } = req.params;

    const result = await getUsersByIdService(id);
    
    if(!result.success) return res.status(404).json(result);
  
    return res.status(200).json(result);


  } catch (error) {
    console.error("Error creating bill:", error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    return res.status(500).json({
      success: false,
      error: "Server error while creating bill"
    });
  }
}

async function updateUsersController(req, res) {
  try {
    const { id } = req.params;

    const updateField = req.body;

    const result = await updateUsersService (id, updateField);

    if(!result.success) return res.status(404).json(result);


    return res.status(200).json(result);

  } catch (err) {
    console.error("Error updating user:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Email or username already exists.",
      });
    }

    return res.status(500).json({ success: false, error: "Internal server error." });
  }
}


async function toggleUserStatusController(req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const result = await toggleUserStatusService(id ,active);

        if (!result.success) {
            return res.status(400).json(result);
        }     

        return res.status(200).json({ 
            success: true,
            message: result.message,
            data: result.data
         });

    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

module.exports = {
  getAllUsersController,
  getUsersIdController,
  updateUsersController,
  toggleUserStatusController,
};
