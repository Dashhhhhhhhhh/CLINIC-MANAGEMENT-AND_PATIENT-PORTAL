const jwt = require('jsonwebtoken');
const { Staff } = require('../modules/staff/staff.model');
const { Role } = require('../modules/roles/roles.model');

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Access token missing' });
  }

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, async (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    req.user = user;

    //Check user role from DB

    if (req.user.role_id === null || req.user.role_id === undefined) {
      return next();
    }

    const role = await Role.findByPk(req.user.role_id);

    if (!role) {
      return res.status(403).json({ error: 'Invalid role' });
    }

    if (role.role_name.toLowerCase() === 'staff') {
      const staffRecord = await Staff.findOne({
        where: { user_id: req.user.id },
      });

      if (!staffRecord) {
        return res.status(403).json({ error: 'Forbidden ID.' });
      }
      req.staff = staffRecord;
    }

    next();
  });
}

module.exports = authenticateJWT;
