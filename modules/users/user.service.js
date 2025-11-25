const { hashPassword, generateToken, comparePassword } = require('../../utils/security');
const { Role } = require('../roles/roles.model');
const { User } = require('./user.model');
const { Op } = require('sequelize');
const { isValidUUID } = require('../../utils/security');
const { Doctor } = require('../doctors/doctor.model');
const { Staff } = require('../staff/staff.model');

async function registerAuthService(email, username, password, gender, role_id) {
  if (!email || !username || !password || !gender || !role_id) {
    return { success: false, message: 'All fields are required.' };
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return {
      success: false,
      message:
        'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
    };
  }

  const role = await Role.findByPk(role_id);
  if (!role) {
    return { success: false, message: 'Invalid role ID. Role does not exist.' };
  }

  const validGenders = ['male', 'female'];
  if (gender && !validGenders.includes(gender.toLowerCase())) {
    return { success: false, message: 'Invalid gender' };
  }

  const cleanedEmail = email.trim().toLowerCase();
  const cleanedUsername = username.trim();
  const cleanedGender = gender.trim().toLowerCase();

  const password_hash = await hashPassword(password);

  const existingUser = await User.findOne({
    where: {
      [Op.or]: [{ email: cleanedEmail }, { username: cleanedUsername }],
    },
  });

  if (existingUser) {
    if (existingUser.email === cleanedEmail)
      return { success: false, message: 'Email already exists' };
    if (existingUser.username === cleanedUsername)
      return { success: false, message: 'Username already exists' };
  }

  const user = await User.create({
    email: cleanedEmail,
    username: cleanedUsername,
    password_hash,
    gender: cleanedGender,
    role_id: role.role_id,
  });

  return {
    success: true,
    message: 'User registered successfully',
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      password_hash: user.password_hash,
      gender: user.gender,
      role_id: user.role_id,
      active: user.active,
    },
  };
}

async function loginAuthService(username, password) {
  if (!username || !password)
    return { success: false, message: 'Username and password are required.' };

  const cleanedUsername = username.trim().toLowerCase();

  const user = await User.findOne({
    where: { username: cleanedUsername },
  });

  if (!user) {
    return { success: false, message: 'User not found.' };
  }

  if (!user.active) {
    return { success: false, message: 'User account is inactive.' };
  }

  const validPassword = await comparePassword(password, user.password_hash);
  if (!validPassword) {
    return { success: false, message: 'Invalid username or password.' };
  }

  const token = generateToken({ id: user.id, role_id: user.role_id });

  return {
    success: true,
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      role_id: user.role_id,
      active: user.active,
    },
    token,
  };
}

async function getAllUsersService(active, role_id) {
  const whereClause = {};

  if (active !== undefined) whereClause.active = active;
  if (role_id !== undefined) whereClause.role_id = role_id;

  const result = await User.findAll({
    where: whereClause,
    attributes: ['id', 'email', 'username', 'gender', 'active', 'created_at'],
    include: [
      {
        model: Role,
        as: 'role',
        attributes: ['role_id', 'role_name'],
      },
    ],
  });

  return {
    success: true,
    count: result.length,
    users: result.map(user => user.get({ plain: true })),
  };
}

async function getUsersByIdService(id) {
  if (!isValidUUID(id)) {
    return { success: false, message: 'Invalid id' };
  }

  const user = await User.findByPk(id, {
    include: [{ model: Role, as: 'role', attributes: ['role_name'] }],
  });

  if (!user) return { success: false, message: 'User not found.' };

  const cleanUser = user.get({ plain: true });

  delete cleanUser.password_hash;

  return {
    success: true,
    user: cleanUser,
  };
}

async function updateUsersService(id, updateField) {
  if (!isValidUUID(id)) {
    return { success: false, message: "Invalid user's Id" };
  }

  const existingUser = await User.findOne({ where: { id: id } });

  if (!existingUser) return { success: false, message: 'User not found.' };

  const update = {};

  const allowFields = ['email', 'username', 'role_id', 'gender'];

  for (const field of allowFields) {
    let value = updateField[field];
    if (value === undefined || value === null) continue;

    let trimmed;

    if (typeof value === 'string') {
      trimmed = value.trim();
    } else if (typeof value === 'number') {
      if (isNaN(value) || value < 0) continue;
      trimmed = value;
    } else if (typeof value === 'boolean') {
      trimmed = value;
    } else {
      continue;
    }

    update[field] = trimmed;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (update.email && !emailRegex.test(update.email))
    return { success: false, message: 'Invalid email format.' };

  if (update.username && update.username.length < 3)
    return { success: false, message: 'Username must be at least 3 characters.' };

  const validGenders = ['male', 'female'];
  if (update.gender && !validGenders.includes(update.gender))
    return { success: false, message: 'Invalid gender value.' };

  if (update.role_id) {
    const roleId = await Role.findOne({ where: { role_id: update.role_id } });
    if (!roleId) return { success: false, message: 'Role not found.' };
  }
  if (!update || Object.keys(update).length === 0)
    return { success: false, message: 'No fields provided to update' };

  const updateUser = await User.update(update, {
    where: { id: id },
  });

  const refreshedUser = await User.findOne({ where: { id: id } });

  return {
    success: true,
    message: 'User updated Succesfully',
    updateUser: refreshedUser.get({ plain: true }),
  };
}

async function toggleUserStatusService(id, active) {
  if (!isValidUUID(id)) return { success: false, message: 'Invalid user id.' };

  const user = await User.findOne({ where: { id: id } });

  if (!user) return { success: false, message: 'User not found.' };

  if (user.active === active) {
    return {
      success: false,
      message: active ? 'User is already active.' : 'User is already inactive',
    };
  }

  user.active = !user.active;
  await user.save();

  const cleanUser = user.get({ plain: true });
  delete cleanUser.password_hash;

  return {
    success: true,
    message: user.active ? 'User activated successfully.' : 'User deactivated successfully.',
    user: cleanUser,
  };
}

async function getAvailableRoleService() {
  const avaibleRole = await Role.findAll();

  return {
    success: true,
    role: avaibleRole,
  };
}

module.exports = {
  registerAuthService,
  loginAuthService,
  getAllUsersService,
  getUsersByIdService,
  updateUsersService,
  toggleUserStatusService,
  getAvailableRoleService,
};
