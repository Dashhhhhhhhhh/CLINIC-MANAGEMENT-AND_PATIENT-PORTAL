const { DataTypes, DATE } = require('sequelize');
const sequelize = require('../../db');
const { Result } = require('../results/result.model');

const Hematology = sequelize.define(
  'Hematology',
  {
    hematology_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    result_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      references: {
        model: 'results',
        key: 'result_id',
      },
    },
    hemoglobin: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    hematocrit: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    rbc_count: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    wbc_count: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    platelet_count: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    mcv: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    mch: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    mchc: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    neutrophils: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    lymphocytes: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    monocytes: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    eosinophils: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    basophils: {
      type: DataTypes.DECIMAL(6, 2),
      allowNull: true,
    },
    others: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
  },
  {
    tableName: 'hematology',
    schema: 'lab_results',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

async function createHematologyResult(data) {
  return await Hematology.create({
    result_id: data.result_id,
    hemoglobin: data.hemoglobin,
    hematocrit: data.hematocrit,
    rbc_count: data.rbc_count,
    wbc_count: data.wbc_count,
    platelet_count: data.platelet_count,
    mcv: data.mcv,
    mch: data.mch,
    mchc: data.mchc,
    neutrophils: data.neutrophils,
    lymphocytes: data.lymphocytes,
    monocytes: data.monocytes,
    eosinophils: data.eosinophils,
    basophils: data.basophils,
    others: data.others,
  });
}

async function getAllHematologyResult() {
  return await Hematology.findAll({
    attributes: [
      'hematology_id',
      'result_id',
      'hemoglobin',
      'hematocrit',
      'rbc_count',
      'wbc_count',
      'platelet_count',
      'mcv',
      'mch',
      'mchc',
      'neutrophils',
      'lymphocytes',
      'monocytes',
      'eosinophils',
      'basophils',
      'others',
      'created_at',
      'updated_at',
    ],
    order: [['created_at', 'Desc']],
  });
}

async function getHematologyResultById(id) {
  return await Hematology.findOne({
    where: { result_id: id },
    attributes: [
      'hematology_id',
      'result_id',
      'hemoglobin',
      'hematocrit',
      'rbc_count',
      'wbc_count',
      'platelet_count',
      'mcv',
      'mch',
      'mchc',
      'neutrophils',
      'lymphocytes',
      'monocytes',
      'eosinophils',
      'basophils',
      'others',
      'created_at',
      'updated_at',
    ],
  });
}

async function updateHematologyResult(id, updateFields) {
  if (!updateFields || Object.keys(updateFields).length === 0) return null;
  const [updateCount] = await Hematology.update(updateFields, {
    where: { result_id: id },
  });

  if (!updateCount) return null;

  return await Hematology.findOne({
    where: { result_id: id },
    attributes: [
      'hematology_id',
      'result_id',
      'hemoglobin',
      'hematocrit',
      'rbc_count',
      'wbc_count',
      'platelet_count',
      'mcv',
      'mch',
      'mchc',
      'neutrophils',
      'lymphocytes',
      'monocytes',
      'eosinophils',
      'basophils',
      'others',
      'created_at',
      'updated_at',
    ],
  });
}

async function toggleDeleteHematologyResult(id, deleteStatus) {
  const hematology = await Hematology.findOne({
    where: { result_id: id },
    include: { model: Result, attributes: ['result_id', 'is_deleted'] },
  });

  if (!hematology) return null;

  const newDeleteStatus = !hematology.Result.is_deleted;

  await Result.update(
    { is_deleted: newDeleteStatus },
    { where: { result_id: hematology.result_id } }
  );

  hematology.Result.is_deleted = newDeleteStatus;
  return hematology;
}

module.exports = {
  Hematology,
  createHematologyResult,
  getAllHematologyResult,
  getHematologyResultById,
  updateHematologyResult,
  toggleDeleteHematologyResult,
};
