const sequelize = require('../../db');
const { DataTypes } = require('sequelize');

const Specialization = sequelize.define(
  'Specialization',
  {
    specialization_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    specialization_name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  },
  {
    tableName: 'specializations',
    schema: 'public',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

async function createSpecialization(data) {
  return await Specialization.create({
    specialization_name: data.specialization_name,
    description: data.description,
    active: data.active ?? true,
  });
}

async function getAllSpecialization(active) {
  const where = {};
  if (typeof active === 'boolean') where.active = active;

  return await Specialization.findAll({
    where,
    attributes: ['specialization_id', 'specialization_name', 'description', 'active'],
    order: [['specialization_name', 'ASC']],
  });
}

async function getSpecializationById(id) {
  return await Specialization.findByPk(id, {
    attributes: ['specialization_id', 'specialization_name', 'description', 'active'],
  });
}

async function updateSpecialization(id, updateFields) {
  const [updatedCount] = await Specialization.update(updateFields, {
    where: { specialization_id: id },
  });

  if (!updatedCount) return null;
  return await Specialization.findByPk(id, {
    attributes: ['specialization_id', 'specialization_name', 'description', 'active'],
  });
}

async function toggleSpecializationStatus(id, activeStatus) {
  const specialization = await Specialization.findByPk(id);
  if (!specialization) return null;

  specialization.active = activeStatus;
  await specialization.save();
  return specialization;
}

module.exports = {
  Specialization,
  createSpecialization,
  getAllSpecialization,
  getSpecializationById,
  updateSpecialization,
  toggleSpecializationStatus,
};
