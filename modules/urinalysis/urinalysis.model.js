const { DataTypes, DATE } = require('sequelize');
const sequelize = require('../../db');
const { Result } = require('../results/result.model');

const Urinalysis = sequelize.define(
  'Urinalysis',
  {
    urinalysis_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    result_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'results',
        key: 'result_id',
      },
    },

    // Physical
    color: { type: DataTypes.STRING(50), allowNull: true },
    transparency: { type: DataTypes.STRING(50), allowNull: true },

    // Chemical / Macroscopic
    leukocytes: { type: DataTypes.STRING(50), allowNull: true },
    ketone: { type: DataTypes.STRING(50), allowNull: true },
    nitrite: { type: DataTypes.STRING(50), allowNull: true },
    urobilinogen: { type: DataTypes.STRING(50), allowNull: true },
    bilirubin: { type: DataTypes.STRING(50), allowNull: true },
    glucose: { type: DataTypes.STRING(50), allowNull: true },
    protein: { type: DataTypes.STRING(50), allowNull: true },
    specific_gravity: { type: DataTypes.DECIMAL(6, 2), allowNull: true },
    ph: { type: DataTypes.STRING(50), allowNull: true },
    blood: { type: DataTypes.STRING(50), allowNull: true },
    vitamin_c: { type: DataTypes.STRING(50), allowNull: true },
    microalbumin: { type: DataTypes.STRING(50), allowNull: true },
    calcium: { type: DataTypes.STRING(50), allowNull: true },
    ascorbic_acid: { type: DataTypes.STRING(50), allowNull: true },

    // Microscopic
    pus_cells: { type: DataTypes.STRING(50), allowNull: true },
    rbc: { type: DataTypes.STRING(50), allowNull: true },
    epithelial_cells: { type: DataTypes.STRING(50), allowNull: true },
    mucus_threads: { type: DataTypes.STRING(50), allowNull: true },
    bacteria: { type: DataTypes.STRING(50), allowNull: true },
    yeast_cells: { type: DataTypes.STRING(50), allowNull: true },
    hyaline_cast: { type: DataTypes.STRING(50), allowNull: true },
    wbc_cast: { type: DataTypes.STRING(50), allowNull: true },
    rbc_cast: { type: DataTypes.STRING(50), allowNull: true },
    coarse_granular_cast: { type: DataTypes.STRING(50), allowNull: true },
    fine_granular_cast: { type: DataTypes.STRING(50), allowNull: true },
    waxy_cast: { type: DataTypes.STRING(50), allowNull: true },
    other_cast: { type: DataTypes.STRING(50), allowNull: true },
    amorphous_urates: { type: DataTypes.STRING(50), allowNull: true },
    amorphous_phosphates: { type: DataTypes.STRING(50), allowNull: true },
    calcium_oxalate: { type: DataTypes.STRING(50), allowNull: true },
    calcium_carbonate: { type: DataTypes.STRING(50), allowNull: true },
    uric_acid_crystals: { type: DataTypes.STRING(50), allowNull: true },
    triple_phosphates: { type: DataTypes.STRING(50), allowNull: true },
    cystine: { type: DataTypes.STRING(50), allowNull: true },
    clue_cells: { type: DataTypes.STRING(50), allowNull: true },
    trichomonas_vaginalis: { type: DataTypes.STRING(50), allowNull: true },
    renal_cells: { type: DataTypes.STRING(50), allowNull: true },
    pregnancy_tests: { type: DataTypes.STRING(50), allowNull: true },

    // Notes & Flags
    others: { type: DataTypes.TEXT, allowNull: true },
    notes: { type: DataTypes.TEXT, allowNull: true },
    is_deleted: { type: DataTypes.BOOLEAN, allowNull: true },
  },
  {
    tableName: 'urinalysis',
    schema: 'lab_results',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// 🔗 Association
Result.hasOne(Urinalysis, { foreignKey: 'result_id' });
Urinalysis.belongsTo(Result, { foreignKey: 'result_id' });

// 🧩 Controller Functions

async function createUrinalysis(data) {
  return await Urinalysis.create({
    result_id: data.result_id,
    color: data.color,
    transparency: data.transparency,
    leukocytes: data.leukocytes,
    ketone: data.ketone,
    nitrite: data.nitrite,
    urobilinogen: data.urobilinogen,
    bilirubin: data.bilirubin,
    glucose: data.glucose,
    protein: data.protein,
    specific_gravity: data.specific_gravity,
    ph: data.ph,
    blood: data.blood,
    vitamin_c: data.vitamin_c,
    microalbumin: data.microalbumin,
    calcium: data.calcium,
    ascorbic_acid: data.ascorbic_acid,
    pus_cells: data.pus_cells,
    rbc: data.rbc,
    epithelial_cells: data.epithelial_cells,
    mucus_threads: data.mucus_threads,
    bacteria: data.bacteria,
    yeast_cells: data.yeast_cells,
    hyaline_cast: data.hyaline_cast,
    wbc_cast: data.wbc_cast,
    rbc_cast: data.rbc_cast,
    coarse_granular_cast: data.coarse_granular_cast,
    fine_granular_cast: data.fine_granular_cast,
    waxy_cast: data.waxy_cast,
    other_cast: data.other_cast,
    amorphous_urates: data.amorphous_urates,
    amorphous_phosphates: data.amorphous_phosphates,
    calcium_oxalate: data.calcium_oxalate,
    calcium_carbonate: data.calcium_carbonate,
    uric_acid_crystals: data.uric_acid_crystals,
    triple_phosphates: data.triple_phosphates,
    cystine: data.cystine,
    clue_cells: data.clue_cells,
    trichomonas_vaginalis: data.trichomonas_vaginalis,
    renal_cells: data.renal_cells,
    pregnancy_tests: data.pregnancy_tests,
    others: data.others,
    notes: data.notes,
  });
}

async function getAllUrinalysisResult() {
  return await Urinalysis.findAll({
    attributes: { exclude: ['is_deleted'] },
    order: [['created_at', 'DESC']],
  });
}

async function getAllUrinalysisResultbyId(id) {
  return await Urinalysis.findOne({
    where: { result_id: id },
    attributes: { exclude: ['is_deleted'] },
  });
}

async function updateUrinalysisResult(id, updateFields) {
  if (!updateFields || Object.keys(updateFields).length === 0) return null;
  const [updateCount] = await Urinalysis.update(updateFields, {
    where: { result_id: id },
  });

  if (!updateCount) return null;

  return await Urinalysis.findOne({
    where: { result_id: id },
    attributes: [
      'urinalysis_id',
      'result_id',
      'color',
      'transparency',
      'leukocytes',
      'ketone',
      'nitrite',
      'urobilinogen',
      'bilirubin',
      'glucose',
      'protein',
      'specific_gravity',
      'ph',
      'blood',
      'vitamin_c',
      'microalbumin',
      'calcium',
      'ascorbic_acid',
      'pus_cells',
      'rbc',
      'epithelial_cells',
      'mucus_threads',
      'bacteria',
      'yeast_cells',
      'hyaline_cast',
      'wbc_cast',
      'rbc_cast',
      'coarse_granular_cast',
      'fine_granular_cast',
      'waxy_cast',
      'other_cast',
      'amorphous_urates',
      'amorphous_phosphates',
      'calcium_oxalate',
      'calcium_carbonate',
      'uric_acid_crystals',
      'triple_phosphates',
      'cystine',
      'clue_cells',
      'trichomonas_vaginalis',
      'renal_cells',
      'pregnancy_tests',
      'others',
      'notes',
    ],
  });
}

async function toggleDeleteUrinalysisResult(id) {
  const urinalysis = await Urinalysis.findOne({
    where: { result_id: id },
    include: { model: Result, attributes: ['result_id', 'is_deleted'] },
  });

  if (!urinalysis) return null;

  const newDeleteStatus = !urinalysis.Result.is_deleted;

  await Result.update(
    { is_deleted: newDeleteStatus },
    { where: { result_id: urinalysis.result_id } }
  );

  urinalysis.Result.is_deleted = newDeleteStatus;
  return urinalysis;
}

module.exports = {
  Urinalysis,
  createUrinalysis,
  getAllUrinalysisResult,
  getAllUrinalysisResultbyId,
  updateUrinalysisResult,
  toggleDeleteUrinalysisResult,
};
