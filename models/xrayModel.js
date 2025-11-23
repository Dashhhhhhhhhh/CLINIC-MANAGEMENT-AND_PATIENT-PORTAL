const { DataTypes } = require("sequelize");
const  sequelize = require("../db");
const { Result } = require("../modules/results/result.model");

const Xray = sequelize.define(
  "Xray",
  {
    xray_id: {
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
    xray_type: {
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
    tableName: "xray",
    schema: "lab_results",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

async function createXray(data) {
  
  return await Xray.create({
    result_id: data.result_id,
    xray_type: data.xray_type,
    history: data.history,
    comparison: data.comparison,
    technique: data.technique,
    findings: data.findings,
    impression: data.impression,
    remarks: data.remarks,
  })
}

async function getAllXray() {

  return await Xray.findAll({
    attributes: [
      'xray_id',
      'result_id',
      'xray_type',
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

async function getXrayById(id) {
  
  return await Xray.findOne({
    where: { result_id: id},
    attributes: [
      'xray_id',
      'result_id',
      'xray_type',
      'history',
      'comparison',
      'technique',
      'findings',
      'impression',
      'remarks',
    ],
  })
}

async function updateXrayResult(id, updateFields) {

    if (!updateFields || Object.keys(updateFields).length === 0) return null;
    const [updateCount] = await Xray.update(updateFields, {
        where: { result_id: id },
    });

    if (!updateCount) return null;

    return await Xray.findOne({
      where: {result_id: id },
      attributes: [
        'xray_id',
        'result_id',
        'xray_type',
        'history',
        'comparison',
        'technique',
        'findings',
        'impression',
        'remarks',
      ],
    })
}

async function toggleDeleteXrayResult(id) {
 
  const xray = await Xray.findOne({ 
    where: { result_id: id },
    include: { model: Result, attributes: [ "result_id", "is_deleted"]},
    }); 

  if (!xray) return null;

  const newDeleteStatus = !xray.Result.is_deleted;

  await Result.update({ is_deleted: newDeleteStatus },
    { where: { result_id: xray.result_id } }
  );

  xray.Result.is_deleted = newDeleteStatus;
  return xray;
}



module.exports = { 
  Xray,
  createXray,
  getAllXray,
  getXrayById,
  updateXrayResult,
  toggleDeleteXrayResult
};
