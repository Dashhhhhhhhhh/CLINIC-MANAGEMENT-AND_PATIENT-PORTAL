const { DataTypes } = require("sequelize");
const  sequelize = require("../db");
const { Result } = require("../modules/results/result.model");

const Ultrasound = sequelize.define(
  "Ultrasound",
  {
    ultrasound_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    result_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "results",
        key: "result_id",
      },
    },
    ultrasound_type: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    history: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    comparison: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    technique: {
      type: DataTypes.STRING(250),
      allowNull: true,
    },
    findings: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    impression: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    remarks: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    },
  },
  {
    tableName: "ultrasound",
    schema: "lab_results",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

async function createUltrasound(data) {
  
  return await Ultrasound.create({
    result_id: data.result_id,
    ultrasound_type: data.ultrasound_type,
    history: data.history,
    comparison: data.comparison,
    technique: data.technique,
    findings: data.findings,
    impression: data.impression,
    remarks: data.remarks,
    });
}

async function getAllUltrasound() {

  return await Ultrasound.findAll({
    attributes: [
      'ultrasound_id',
      'result_id',
      'ultrasound_type',
      'history',
      'comparison',
      'technique',
      'findings',
      'impression',
      'remarks',
    ],
    order: [["created_at", "Desc"]],
  })
}

async function getUltrasoundById(id) {
  
  return await Ultrasound.findOne({
    where: { result_id: id},
    attributes: [
      'ultrasound_id',
      'result_id',
      'ultrasound_type',
      'history',
      'comparison',
      'technique',
      'findings',
      'impression',
      'remarks',
    ],
  })
}

async function updateUltrasoundResult(id, updateFields) {

    if (!updateFields || Object.keys(updateFields).length === 0) return null;
    const [updateCount] = await Ultrasound.update(updateFields, {
        where: { result_id: id },
    });

    if (!updateCount) return null;

    return await Ultrasound.findOne({
        where: { result_id: id},
        attributes: [
        'ultrasound_id',
        'result_id',
        'ultrasound_type',
        'history',
        'comparison',
        'technique',
        'findings',
        'impression',
        'remarks',
      ],
    })
}

async function toggleDeleteUltrasoundResult(id) {
 
  const ultrasound = await Ultrasound.findOne({ 
    where: { result_id: id },
    include: { model: Result, attributes: [ "result_id", "is_deleted"]},
    }); 

  if (!ultrasound) return null;

  const newDeleteStatus = !ultrasound.Result.is_deleted;

  await Result.update({ is_deleted: newDeleteStatus },
    { where: { result_id: ultrasound.result_id } }
  );

  ultrasound.Result.is_deleted = newDeleteStatus;
  return ultrasound;
}



module.exports = { 
  Ultrasound,
  createUltrasound,
  getAllUltrasound,
  getUltrasoundById,
  updateUltrasoundResult,
  toggleDeleteUltrasoundResult
};
