const {
  registerAuthService,
  getAllUsersService,
  getUsersByIdService,
  updateUsersService,
  toggleUserStatusService,
  getAvailableRoleService,
} = require('./user.service');

async function registerAuthController(req, res) {
  try {
    const { email, username, password, gender, role_id } = req.body;

    const result = await registerAuthService(email, username, password, gender, role_id);

    if (!result.success) return res.status(400).json(result);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error creating user:', error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    if (error.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        error: 'Email or username already exists.',
      });
    }

    return res.status(500).json({
      success: false,
      error: 'Server error while creating user',
    });
  }
}

async function getAllUsersController(req, res) {
  try {
    const { page, limit, search, active, role_id, sortBy, sortOrder } = req.query;

    let parsedActive;
    const activeNorm = typeof active === 'string' ? active.toLowerCase() : active;

    if (activeNorm === 'true' || activeNorm === '1') parsedActive = true;
    else if (activeNorm === 'false' || activeNorm === '0') parsedActive = false;
    else parsedActive = undefined;

    const roleIdNorm = typeof role_id === 'string' && role_id.trim() === '' ? undefined : role_id;
    const searchNorm = typeof search === 'string' ? search.trim() : '';

    const result = await getAllUsersService({
      page,
      limit,
      search: searchNorm,
      active: parsedActive,
      role_id: roleIdNorm,
      sortBy,
      sortOrder,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in getAllUsersController:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

async function getUsersIdController(req, res) {
  try {
    const { id } = req.params;

    const result = await getUsersByIdService(id);

    if (!result.success) return res.status(404).json(result);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching user:', error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    return res.status(500).json({
      success: false,
      error: 'Server error while fetching user',
    });
  }
}

async function updateUsersController(req, res) {
  try {
    const { id } = req.params;

    const updateField = req.body;

    const result = await updateUsersService(id, updateField);

    if (!result.success) return res.status(404).json(result);

    return res.status(200).json(result);
  } catch (err) {
    console.error('Error updating user:', err);

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(409).json({
        success: false,
        error: 'Email or username already exists.',
      });
    }

    return res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}

async function toggleUserStatusController(req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (typeof active === 'string') active = active.toLowerCase() === 'true';

    const result = await toggleUserStatusService(id, active);

    if (!result.success) return res.status(400).json(result);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

async function getAvailableRoleController(req, res) {
  try {
    const result = await getAvailableRoleService();

    if (!result.success) return res.status(404).json(result);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error in getAvailableController:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
}

module.exports = {
  registerAuthController,
  getAllUsersController,
  getUsersIdController,
  updateUsersController,
  toggleUserStatusController,
  getAvailableRoleController,
};
