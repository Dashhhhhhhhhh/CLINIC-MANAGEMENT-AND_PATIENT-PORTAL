const {
  registerDoctorService,
  getAllDoctorService,
  getDoctorByIdService,
  updateDoctorService,
  toggleDoctorStatusService,
  getAvailableDoctorUsersService,
} = require('./doctor.service');

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
    console.error('Error creating doctor:', err);

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        error: 'Doctor already exists.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
}

async function getAllDoctorController(req, res) {
  try {
    const { page, limit, search, active, specialization_id, sortBy, sortOrder } = req.query;

    let parsedActive;
    const activeNorm = typeof active === 'string' ? active.toLowerCase() : active;
    if (activeNorm === 'true' || activeNorm === '1') parsedActive = true;
    else if (activeNorm === 'false' || activeNorm === '0') parsedActive = false;
    else parsedActive = undefined;

    const specializationIdNorm =
      typeof specialization_id === 'string' && specialization_id.trim() === ''
        ? undefined
        : specialization_id;

    const searchNorm = typeof search === 'string' ? search.trim() : '';

    const result = await getAllDoctorService({
      page,
      limit,
      search: searchNorm,
      active: parsedActive,
      specialization_id: specializationIdNorm,
      sortBy,
      sortOrder,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in getAllDcotorsController:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
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
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}

async function updateDoctorsController(req, res) {
  try {
    const { id } = req.params;
    const updateField = req.body;

    const result = await updateDoctorService(id, updateField);

    if (!result.success) return res.status(404).json(result);

    return res.status(200).json(result);
  } catch (err) {
    console.error('Error updating doctor:', err);

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        message: 'Doctor already exists.',
      });
    }

    return res.status(500).json({ success: false, error: 'Internal server error' });
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
    console.error('Error in toggleDoctorStatusController:', error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || 'Internal server error',
    });
  }
}

async function getAvailableDoctorUsersController(req, res) {
  try {
    const result = await getAvailableDoctorUsersService();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  registerDoctorController,
  getAllDoctorController,
  updateDoctorsController,
  getDoctorByIdController,
  toggleDoctorStatusController,
  getAvailableDoctorUsersController,
};
