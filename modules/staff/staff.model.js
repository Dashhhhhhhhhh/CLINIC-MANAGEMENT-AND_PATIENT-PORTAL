const sequelize = require('../../db');
const { DataTypes } = require('sequelize');
const { Position } = require('../positions/position.model');
const { User } = require('../users/user.model');

const Staff = sequelize.define(
  'Staff',
  {
    staff_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    first_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    middle_initial: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    employee_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    contact_number: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    position_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'staff',
    schema: 'users_table',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

async function createStaff(data) {
  return await Staff.create({
    first_name: data.first_name,
    middle_initial: data.middle_initial || null,
    last_name: data.last_name,
    employee_number: data.employee_number,
    contact_number: data.contact_number || null,
    user_id: data.user_id,
    position_id: data.position_id,
    active: data.active ?? true,
  });
}

async function getAllStaff(active, position_id) {
  const where = {};
  if (typeof active === 'boolean') where.active = active;
  if (position_id) where.position_id = position_id;

  return await Staff.findAll({
    where,
    include: [
      {
        model: Position,
        as: 'position',
        attributes: ['position_id', 'position_name'],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email'],
      },
    ],
    attributes: [
      'staff_id',
      'first_name',
      'middle_initial',
      'last_name',
      'employee_number',
      'contact_number',
      'active',
    ],
    order: [['created_at', 'DESC']],
  });
}

async function getStaffById(id) {
  return await Staff.findByPk(id, {
    include: [
      {
        model: Position,
        as: 'position',
        attributes: ['position_id', 'position_name'],
      },
      {
        model: User,
        as: 'user',
        attributes: ['id', 'username', 'email'],
      },
    ],
    attributes: [
      'staff_id',
      'first_name',
      'middle_initial',
      'last_name',
      'employee_number',
      'contact_number',
      'active',
    ],
  });
}

async function updateStaff(id, updateFields) {
  const [updatedCount] = await Staff.update(updateFields, { where: { staff_id: id } });
  if (!updatedCount) return null;

  return await getStaffById(id);
}

async function toggleStaffStatus(id, activeStatus) {
  const staff = await Staff.findByPk(id);
  if (!staff) return null;

  staff.active = activeStatus;
  await staff.save();
  return staff;
}

module.exports = {
  Staff,
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  toggleStaffStatus,
};
