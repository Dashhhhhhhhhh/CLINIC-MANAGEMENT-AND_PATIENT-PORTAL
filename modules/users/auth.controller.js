const { loginAuthService } = require('./user.service');

async function loginAuthController(req, res) {
  try {
    const { username, password } = req.body;

    const result = await loginAuthService(username, password);

    if (!result.success) return res.status(400).json(result);

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error logging in:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during login.',
    });
  }
}

module.exports = {
  loginAuthController,
};
