const sequelize = require('../../db');
const { DataTypes } = require('sequelize');

const BillingService = sequelize.define(
  'BillingService',
  {
    service_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    service_name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allownull: true,
    },
    default_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    tableName: 'billing_service',
    schema: 'billing_table',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

async function createBillingService(data) {
  return await BillingService.create({
    service_id: data.service_id,
    service_name: data.service_name,
    description: data.description,
    default_price: data.default_price,
    category: data.category,
  });
}

async function getAllBillingService() {
  return await BillingService.findAll({
    attributes: ['service_id', 'service_name', 'description', 'default_price', 'category'],
    order: [['created_at', 'DESC']],
  });
}

async function getBillingServiceById(id) {
  return await BillingService.findOne({
    where: { service_id: id },
    attributes: ['service_id', 'service_name', 'description', 'default_price', 'category'],
  });
}

async function updateService(id, updateFields) {
  if (!updateFields || Object.keys(updateFields).length == 0) return null;

  const [updateCount] = await BillingService.update(updateFields, {
    where: { service_id: id },
  });

  if (!updateCount) return null;

  return await BillingService.findOne({
    where: { service_id: id },
    attributes: ['service_id', 'service_name', 'description', 'default_price', 'category'],
  });
}

async function toggleDeleteService(id, updated_by) {
  const service = await BillingService.findOne({
    where: { service_id: id },
    attributes: ['service_id', 'is_deleted'],
  });

  if (!service) return null;

  const newDeleteStatus = !service.is_deleted;

  await BillingService.update(
    { is_deleted: newDeleteStatus, updated_by: updated_by, updated_at: new Date() },
    { where: { service_id: id } }
  );

  service.is_deleted = newDeleteStatus;
  return service;
}

module.exports = {
  BillingService,
  createBillingService,
  getAllBillingService,
  getBillingServiceById,
  updateService,
  toggleDeleteService,
};
