const { registerStaffService, getAllStaffService, getStaffByIdService, toggleStaffStatusService, updateStaffService } = require('./staff.service');

async function registerStaffController(req, res) {
  try {
    const {
      user_id,
      first_name,
      middle_initial,
      last_name,
      position_id,
      employee_number,
      contact_number,
      active
    } = req.body;

    const result = await registerStaffService(
      user_id,
      first_name,
      middle_initial,
      last_name,
      position_id,
      employee_number,
      contact_number,
      active
    );

    if (!result.success) return res.status(400).json(result);

    return res.status(201).json(result);

  } catch (err) {
    console.error("Error creating staff:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Staff already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
}

async function getAllStaffController(req, res) {
  try {
   
    const result = await getAllStaffService();

    return res.status(200).json(result);

  } catch (err) {
    console.error("Error in getAllDcotorsController:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getStaffByIdController(req, res) {
  try {
    const { id } = req.params;

    const result = await getStaffByIdService(id);

    if (!result.success) return res.status(404).json(result);

    return res.status(200).json(result);

  } catch (err) {
    console.error("Error retrieving staff by ID:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updateStaffController(req, res) {
  try {
    const { staff_id } = req.params;

    const updateField = req.body;

    const result = await updateStaffService(staff_id, updateField);

    if(!result.success) return res.status(404).json(result)

    return res.status(200).json(result);   

  } catch (err) {
    console.error("Error updating staff:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Staff already exists.",
      });
    }

    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function toggleStaffStatusController (req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;


    const result = await toggleStaffStatusService(id, active);

    if (!result.success) return res.status(400).json(result);    

    return res.status(200).json(result);


  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = {
  registerStaffController,
  getAllStaffController,
  getStaffByIdController,
  updateStaffController,
  toggleStaffStatusController
};
