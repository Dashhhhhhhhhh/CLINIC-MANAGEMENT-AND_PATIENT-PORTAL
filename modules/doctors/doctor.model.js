const sequelize = require('../../db');
const { DataTypes } = require('sequelize');
const { Role } = require('../roles/roles.model');
const { User } = require('../users/user.model');
const { Specialization } = require('../specialization/specialization.model');

const Doctor = sequelize.define(
  'Doctor',
  {
    doctor_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    first_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    middle_initial: {
      type: DataTypes.STRING(1),
      allowNull: true,
    },
    last_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    license_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    contact_number: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'doctors',
    schema: 'users_table',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

async function createDoctor(data) {
  return await Doctor.create({
    first_name: data.first_name,
    middle_initial: data.middle_initial,
    last_name: data.last_name,
    license_number: data.license_number,
    contact_number: data.contact_number,
    specialization_id: data.specialization_id,
    user_id: data.user_id,
    active: data.active ?? true,
  });
}

async function getAllDoctors(active, specialization) {
  const where = {};
  if (typeof active === 'boolean') where.active = active;
  if (specialization) where.specialization_id = specialization;

  return await Doctor.findAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'username', 'active'],
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_id', 'role_name', 'description'],
          },
        ],
      },
      {
        model: Specialization,
        as: 'specialization',
        attributes: ['specialization_id', 'specialization_name', 'description'],
      },
    ],
    attributes: [
      'doctor_id',
      'first_name',
      'middle_initial',
      'last_name',
      'license_number',
      'contact_number',
      'specialization_id',
      'active',
    ],
  });
}

async function getDoctorById(id) {
  return await Doctor.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['id', 'email', 'username', 'active'],
        include: [
          {
            model: Role,
            as: 'role',
            attributes: ['role_id', 'role_name', 'description'],
          },
        ],
      },
      {
        model: Specialization,
        as: 'specialization',
        attributes: ['specialization_id', 'specialization_name', 'description'],
      },
    ],
    attributes: [
      'doctor_id',
      'first_name',
      'middle_initial',
      'last_name',
      'license_number',
      'contact_number',
      'specialization_id',
      'active',
    ],
  });
}

async function updateDoctor(id, updateFields) {
  const [updatedCount] = await Doctor.update(updateFields, {
    where: { doctor_id: id },
  });

  if (!updatedCount) return null;

  return await Doctor.findByPk(id, {
    include: [
      {
        model: Specialization,
        as: 'specialization',
        attributes: ['specialization_id', 'specialization_name'],
      },
    ],
    attributes: [
      'doctor_id',
      'first_name',
      'middle_initial',
      'last_name',
      'license_number',
      'contact_number',
      'specialization_id',
      'active',
    ],
  });
}

async function toggleDoctorStatus(id, activeStatus) {
  const doctor = await Doctor.findByPk(id);
  if (!doctor) return null;

  doctor.active = activeStatus;
  await doctor.save();
  return doctor;
}

module.exports = {
  Doctor,
  createDoctor,
  getAllDoctors,
  updateDoctor,
  getDoctorById,
  toggleDoctorStatus,
};
