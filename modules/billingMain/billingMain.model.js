const sequelize = require('../../db');
const { DataTypes } = require('sequelize');

const Billing = sequelize.define(
  'Billing',
  {
    billing_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: { tableName: 'patients', schema: 'users_table' },
        key: 'patient_id',
      },
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    payment_status: {
      type: DataTypes.ENUM('pending', 'paid', 'partially_paid'),
      defaultValue: 'pending',
      allowNull: false,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: { tableName: 'users', schema: 'users_table' },
        key: 'id',
      },
    },
    updated_by: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    finalized_by: {
      type: DataTypes.UUID,
      allownull: true,
    },
    finalized_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: 'billing',
    schema: 'billing_table',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

async function createBilling(data) {
  return await Billing.create({
    patient_id: data.patient_id,
    total_amount: data.total_amount,
    payment_status: data.payment_status,
    created_by: data.created_by,
  });
}

async function getAllBilling() {
  return await Billing.findAll({
    attributes: ['billing_id', 'patient_id', 'payment_status', 'total_amount'],
    order: [['created_at', 'DESC']],
  });
}

async function getBillingById(id) {
  return await Billing.findOne({
    where: { billing_id: id },
    attributes: ['billing_id', 'patient_id', 'payment_status', 'total_amount'],
  });
}

async function getBillingByPatientId(id) {
  return await Billing.findAll({
    where: { patient_id: id },
    attributes: ['billing_id', 'patient_id', 'payment_status', 'total_amount'],
  });
}

async function updateBilling(id, updateFields) {
  if (!updateFields || Object.keys(updateFields).length === 0) return null;

  const [updateCount] = await Billing.update(updateFields, {
    where: { billing_id: id },
  });

  if (!updateCount) return null;

  return await Billing.findOne({
    where: { billing_id: id },
    attributes: ['patient_id', 'payment_status', 'total_amount'],
  });
}

async function toggleDeletebilling(id, updated_by) {
  const billing = await Billing.findOne({
    where: { billing_id: id },
    attributes: ['billing_id', 'is_deleted'],
  });

  if (!billing) return null;

  const newDeleteStatus = !billing.is_deleted;

  await Billing.update(
    { is_deleted: newDeleteStatus, updated_by: updated_by, updated_at: new Date() },
    { where: { billing_id: billing.billing_id } }
  );

  billing.is_deleted = newDeleteStatus;
  return billing;
}

module.exports = {
  Billing,
  createBilling,
  getAllBilling,
  getBillingById,
  getBillingByPatientId,
  updateBilling,
  toggleDeletebilling,
};
