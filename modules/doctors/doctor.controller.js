const { registerDoctorService, getAllDoctorService, getDoctorByIdService, updateDoctorService, toggleDoctorStatusService } = require('./doctor.service');


async function registerDoctorController(req, res) {

  try {
    const {
      user_id,
      first_name,
      middle_initial,
      last_name,
      license_number,
      contact_number,
      specialization_id,
      active,
    } = req.body;



    const result = await registerDoctorService(
      user_id,
      first_name,
      middle_initial,
      last_name,
      license_number,
      contact_number,
      specialization_id,
      active
    );

    if (!result.success) return res.status(400).json(result);

    return res.status(201).json(result);

  } catch (err) {
    console.error("Error creating doctor:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Doctor already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
}


async function getAllDoctorController(req, res) {
  try {

    const result = await getAllDoctorService();

    return res.status(200).json(result);

  } catch (err) {
    console.error("Error in getAllDcotorsController:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getDoctorByIdController(req, res) {
  try {
    const { doctor_id } = req.params;

    const result = await getDoctorByIdService(doctor_id);

    if (!result.success) return res.status(404).json(result);

    return res.status(200).json(result);

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
}

async function updateDoctorsController(req, res) {
  try {
    const { id } = req.params;
    const  updateField = req.body;

    const result = await updateDoctorService(id, updateField);

    if(!result.success) return res.status(404).json(result)

    return res.status(200).json(result);

  } catch (err) {
    console.error("Error updating doctor:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        message: "Doctor already exists.",
      });
    }

    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}


async function toggleDoctorStatusController(req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const result = await toggleDoctorStatusService(id, active);

    if (!result.success) return res.status(400).json(result);    

    return res.status(200).json(result);

} catch (error) {
  console.error("Error in toggleDoctorStatusController:", error);
  return res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal server error"
  });
}
}




module.exports = {
  registerDoctorController,
  getAllDoctorController,
  updateDoctorsController,
  getDoctorByIdController,
  toggleDoctorStatusController,
};
