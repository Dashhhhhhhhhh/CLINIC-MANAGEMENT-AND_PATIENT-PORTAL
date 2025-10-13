const { DataTypes, DATE } = require("sequelize");
const sequelize = require("../db");

const Result = sequelize.define(
  "Result",
  {
    result_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    patient_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: { tableName: "patients", schema: "users_table" },
        key: "patient_id",
      },
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: { tableName: "staff", schema: "users_table" },
        key: "staff_id",
      },
    },
    test_type_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: { tableName: "test_types", schema: "lab_results" },
        key: "test_type_id",
      },
    },
    result_data: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: "Pending",
    },
    initial_result_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: { tableName: "staff", schema: "users_table" },
          key: "staff_id",
        }
    },
    initial_result_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    final_result_by: {
      type: DataTypes.UUID,
      allownull: true,
        references: {
          model: { tableName: "staff", schema: "users_table" },
          key: "staff_id",
        }
    },
    final_result_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: "results",
    schema: "lab_results",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

async function createResult(data) {
    
    return await Result.create ({
        patient_id: data.patient_id,
        created_by: data.created_by,
        result_data: data.result_data,
        status: data.status,
        test_type_id: data.test_type_id,
        initial_result_at: data.initial_result_at,
        initial_result_by: data.initial_result_by,
        final_result_at: data.final_result_at,
        final_result_by: data.final_result_by
    });
}

async function getAllResult(showDeleted) {
  const where = {};

  if (typeof showDeleted === "boolean") where.is_deleted = showDeleted;
  else where.is_deleted = false;

  return await Result.findAll({
    where,
    attributes: [
      'result_id',
      'patient_id',
      'created_by',
      'result_data',
      'status',
      'test_type_id',
      'initial_result_at',
      'initial_result_by',
      'final_result_at',
      'final_result_by'
    ],

    order: [["created_at", "DESC"]],
  });
}


async function getResultById(id) {
  return await Result.findByPk(id, {
  attributes: [
    'result_id',
    'patient_id',
    'created_by',
    'result_data',
    'status',
    'test_type_id',
    'initial_result_at',
    'initial_result_by',
    'final_result_at',
    'final_result_by'
  ],
  });
}


async function updateResult(id, updateFields) {
  const [updateCount] = await Result.update(updateFields, {
    where: { result_id: id },
  });

  if (!updateCount) return null;

  return await Result.findByPk(id, {
  attributes: [
    'result_id',
    'patient_id',
    'created_by',
    'result_data',
    'status',
    'test_type_id',
    'initial_result_at',
    'initial_result_by',
    'final_result_at',
    'final_result_by'
  ],
  });
}

async function toggleResultDeleted(id, isDeletedStatus) {
  const result = await Result.findByPk(id);
  if (!result) return null;

  result.is_deleted = isDeletedStatus;
  await result.save();

  return result;
}

module.exports = { 
    Result,
    createResult,
    getAllResult,
    getResultById,
    updateResult,
    toggleResultDeleted
 };
