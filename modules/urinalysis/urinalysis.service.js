const { Result } = require('../results/result.model');
const { isValidUUID } = require('../../utils/security');
const { Urinalysis } = require('../urinalysis/urinalysis.model');
const { formatToPh } = require('../../utils/datetime');
const { format } = require('sequelize/lib/utils');

async function createUrinalysisService(result_id, data) {
  if (!result_id || !isValidUUID(result_id)) {
    return { success: false, message: 'Invalid or missing result_id' };
  }

  const allowedFields = [
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
    'ph_level',
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
  ];

  const numericFields = ['specific_gravity'];

  const resultField = {};

  for (const field of allowedFields) {
    let value = data[field];

    if (value === undefined || value === null) continue;

    const strValue = String(value).trim();

    if (strValue === '') {
      resultField[field] = null;
      continue;
    }
    if (numericFields.includes(field)) {
      resultField[field] = parseFloat(strValue);
      continue;
    }

    resultField.result_id = result_id;

    const urinalysis = await Urinalysis.create(resultField);

    return {
      success: true,
      data: urinalysis,
    };
  }
}

async function getAllUrinalysisResultService(is_deleted) {
  const whereClause = {};

  if (is_deleted !== undefined) {
    if (is_deleted === 'true' || is_deleted === true) {
      whereClause.is_deleted = true;
    } else if (is_deleted === 'false' || is_deleted === false) {
      whereClause.is_deleted = false;
    } else {
      return {
        success: false,
        message: 'Invalid `is_deleted` value. Must be true or false.',
      };
    }
  }

  const urinalysis = await Urinalysis.findAll({
    where: whereClause,
    attributes: [
      'urinalysis_id',
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
      'created_at',
      'updated_at',
    ],
    include: [
      {
        model: Result,
        attributes: [
          'result_id',
          'patient_id',
          'test_type_id',
          'status',
          'created_at',
          'updated_at',
        ],
      },
    ],
  });

  return {
    success: true,
    count: urinalysis.length,
    data: urinalysis.map(urinal => urinal.get({ plain: true })),
  };
}

async function getAllUrinalysisByIdService(urinalysis_id, is_deleted) {
  if (!isValidUUID(urinalysis_id)) return { success: false, message: 'Invalid urinalysis ID.' };

  const urinalysis = await Urinalysis.findByPk(urinalysis_id, {
    attributes: [
      'urinalysis_id',
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
      'created_at',
      'updated_at',
    ],
    include: [
      {
        model: Result,
        attributes: [
          'result_id',
          'patient_id',
          'test_type_id',
          'status',
          'created_at',
          'updated_at',
        ],
      },
    ],
  });

  if (!urinalysis) return { success: true, message: 'Urinalysis not found.' };

  return {
    success: true,
    data: urinalysis.get({ plain: true }),
  };
}

async function updateUrinalysisResultService(urinalysis_id, updateField) {
  if (!isValidUUID(urinalysis_id)) return { success: false, message: 'Invalid urinalysis ID.' };

  const allowedFields = [
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
  ];

  const update = {};

  const numericFields = ['specific_gravity'];

  for (const field of allowedFields) {
    let value = updateField[field];

    if (value === undefined || value === null) continue;

    const strValue = String(value).trim();

    if (strValue === '') {
      update[field] = null;
      continue;
    }
    if (numericFields.includes(field)) {
      update[field] = parseFloat(strValue);
      continue;
    }

    update[field] = strValue;
  }

  if (Object.keys(update).length === 0) {
    return { success: false, error: 'No fields provided to update.' };
  }

  const updateUrinalysis = await Urinalysis.update(update, {
    where: { urinalysis_id },
  });

  const refreshUrinalysis = await Urinalysis.findByPk(urinalysis_id);

  if (!refreshUrinalysis) return { success: false, message: 'Urinalysis not found' };

  const plain = refreshUrinalysis.get({ plain: true });
  plain.created_at = formatToPh(plain.created_at);
  plain.updated_at = formatToPh(plain.updated_at);

  return {
    success: true,
    message: 'Urinalysis update successfully.',
    data: plain,
  };
}

async function toggleUrinalysisStatusService(urinalysis_id, is_deleted) {
  if (!isValidUUID(urinalysis_id)) return { success: false, message: 'Invalid urinalysis ID.' };

  const urinalysis = await Urinalysis.findOne({ where: { urinalysis_id } });

  if (!urinalysis) return { success: false, message: 'Urinalysis not found' };

  const parsedDelete =
    is_deleted === true || is_deleted === 'true'
      ? true
      : is_deleted === false || is_deleted === 'false'
        ? false
        : null;

  if (parsedDelete === null)
    return { success: false, message: 'Invalid is_deleted value. Must be true or false.' };

  if (urinalysis.is_deleted === parsedDelete) {
    return {
      success: false,
      message: parsedDelete
        ? 'Urinalysis result is already deleted'
        : 'Urinalysis result is already active',
    };
  }

  urinalysis.is_deleted = parsedDelete;
  await urinalysis.save();

  return {
    success: true,
    message: parsedDelete ? 'Urinalysis deleted.' : 'Urinalysis restored.',
    data: urinalysis.get({ plain: true }),
  };
}

module.exports = {
  createUrinalysisService,
  getAllUrinalysisResultService,
  getAllUrinalysisByIdService,
  updateUrinalysisResultService,
  toggleUrinalysisStatusService,
};
