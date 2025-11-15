const { registerPatientService, getAllPatientsService, getPatientByIdService, updatePatientService, togglePatientStatusService, getAvailablePatientsUsersService } = require('./patients.service');

async function registerPatientController (req, res) { 
    try {

    const {
      user_id,
      patient_id,
      first_name,
      middle_initial,
      last_name,
      birthdate,
      contact_number,
      medical_history,
      conditions,
      building_number,
      street_name,
      barangay_subdivision,
      city_municipality,
      province,
      postal_code,
      country,
      active
     } = req.body;

  console.log("REQ BODY:", req.body);

    const result = await registerPatientService(
        user_id,
        patient_id,
        first_name,
        middle_initial,
        last_name,
        birthdate,
        contact_number,
        medical_history,
        conditions,
        building_number,
        street_name,
        barangay_subdivision,
        city_municipality,
        province,
        postal_code,
        country,
        active
    );

    if (!result.success) return res.status(400).json(result)

    return res.status(201).json(result);

  } catch (err) {
    console.error("Error creating Patient:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Patient already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
}

async function getAllPatientsController(req, res) {
  try {
    const result = await getAllPatientsService();

    return res.status(200).json(result);

  } catch (err) {
    console.error("Error in getAllPatientsController:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getPatientByIdController (req, res) {
    try {

        const { id } = req.params;

        const result = await getPatientByIdService(id);

        if (!result.success) return res.status(404).json(result);

        return res.status(200).json(result);

  } catch (err) {
    console.error("Error retrieving patient by ID:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updatePatientController (req, res) {
    try {

        const { patient_id } = req.params;

        const updateField = req.body;

        const result = await updatePatientService(patient_id, updateField);

        return res.status(200).json(result);

  } catch (err) {
    console.error("Error updating patient:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Staff already exists.",
      });
    }

    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function togglePatientStatusController(req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    const result = await togglePatientStatusService(id, active);

    if (!result.success) return res.status(400).json (result);

    return res.status(200).json(result);



  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getAvailablePatientUsersController (req, res) {
  try {
    const result = await getAvailablePatientsUsersService();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
}

module.exports = {
    registerPatientController,
    getPatientByIdController,
    getAllPatientsController,
    updatePatientController,
    togglePatientStatusController,
    getAvailablePatientUsersController
};