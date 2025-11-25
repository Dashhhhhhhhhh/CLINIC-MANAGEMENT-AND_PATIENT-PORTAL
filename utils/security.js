const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const { validate } = require('uuid');

function generateToken({ id, role_id }) {
  return jwt.sign({ id, role_id }, process.env.JWT_SECRET, { expiresIn: '1hr' });
}

async function hashPassword(password) {
  return await bcrypt.hash(password, saltRounds);
}

async function comparePassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

function isValidUUID(id) {
  return validate(id);
}

module.exports = {
  generateToken,
  hashPassword,
  comparePassword,
  isValidUUID,
};
