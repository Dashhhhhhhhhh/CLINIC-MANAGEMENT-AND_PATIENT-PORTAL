const { isValidUUID } = require('../../utils/security');
const { Hematology, getHematologyResultById } = require('./hematology.model');
const { Result } = require('../results/result.model');
const { formatToPh } = require('../../utils/datetime');

async function createHematologyService(result_id, data) {
  data = data || {};

  if (!result_id || !isValidUUID(result_id)) {
    return { success: false, message: 'Invalid or missing result_id' };
  }

  const allowedFields = [
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
  ];

  const decimalPattern = /^\d{1,4}(\.\d{1,2})?$/;

  const resultField = {};

  for (const field of allowedFields) {
    let value = data[field];

    if (value === undefined || value === null) continue;

    const strValue = String(value).trim();

    if (!decimalPattern.test(strValue)) {
      return {
        success: false,
        message: `${field} must be a valid number with up to 4 digits before the decimal and up to 2 digits after.`,
      };
    }

    const numericValue = Number(strValue);

    if (numericValue < 0) {
      return {
        success: false,
        message: `${field} must be positive.`,
      };
    }

    resultField[field] = numericValue;
  }

  resultField.others = data.others ?? null;
  resultField.result_id = result_id;

  const hematology = await Hematology.create(resultField);

  return {
    success: true,
    data: hematology,
  };
}

async function getlAllHematologyResultService(is_deleted) {
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

  const hematology = await Hematology.findAll({
    where: whereClause,
    attributes: [
      'hematology_id',
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
      'created_at',
      'updated_at',
      'others',
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
    count: hematology.length,
    data: hematology.map(hematologys => hematologys.get({ plain: true })),
  };
}

async function getHematologyResultByIdService(hematology_id) {
  if (!isValidUUID(hematology_id)) return { success: false, message: 'Invalid hematology ID.' };

  const hematology = await Hematology.findByPk(hematology_id, {
    attributes: [
      'hematology_id',
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

  if (!hematology) return { success: false, message: 'Hematology result not found.' };
  return {
    success: true,
    data: hematology.get({ plain: true }),
  };
}

async function updateHematologyResultService(hematology_id, updateField) {
  if (!isValidUUID(hematology_id)) {
    return { success: false, error: 'Invalid hematology ID.' };
  }

  const numericFields = [
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
  ];

  const decimalPattern = /^\d{1,4}(\.\d{1,2})?$/;

  const update = {};

  // Validate numeric fields ONLY
  for (const field of numericFields) {
    let value = updateField[field];

    if (value === undefined || value === null || value === '') continue;

    const strValue = String(value).trim();

    if (!decimalPattern.test(strValue)) {
      return {
        success: false,
        error: `${field} has invalid numeric format.`,
      };
    }

    const numericValue = Number(strValue);

    if (numericValue < 0) {
      return {
        success: false,
        error: `${field} must be positive.`,
      };
    }

    update[field] = numericValue;
  }

  if (updateField.others !== undefined && updateField.others !== '') {
    update.others = String(updateField.others).trim();
  }

  if (Object.keys(update).length === 0) {
    return { success: false, error: 'No valid fields provided to update.' };
  }

  const [affectedRows] = await Hematology.update(update, {
    where: { hematology_id },
  });

  if (affectedRows === 0) {
    return { success: false, error: 'Hematology record not found.' };
  }

  const refreshedHematology = await Hematology.findByPk(hematology_id);

  if (!refreshedHematology) {
    return { success: false, error: 'Hematology not found after update.' };
  }
  const result = await Result.findByPk(refreshedHematology.result_id);

  if (!result) {
    return { success: false, error: 'Hematology not found after update.' };
  }

  const hematologySnapshot = {
    hemoglobin: refreshedHematology.hemoglobin,
    hematocrit: refreshedHematology.hematocrit,
    rbc: refreshedHematology.rbc_count,
    wbc: refreshedHematology.wbc_count,
    platelet_count: refreshedHematology.platelet_count,
    mch: refreshedHematology.mch,
    mchc: refreshedHematology.mchc,
    mcv: refreshedHematology.mcv,
    neutrophils: refreshedHematology.neutrophils,
    lymphocytes: refreshedHematology.lymphocytes,
    monocytes: refreshedHematology.monocytes,
    eosinophils: refreshedHematology.eosinophils,
    basophils: refreshedHematology.basophils,
    others: refreshedHematology.others,
  };

  const existingData = result.result_data || {};

  const newResultData = {
    ...existingData,
    hematology: hematologySnapshot,
  };

  result.result_data = newResultData;

  await result.save();
  return {
    success: true,
    message: 'Hematology updated Successfully.',
    data: result.get({ plain: true }),
  };
}

async function toggleDeleteHematologyResultService(hematology_id, is_deleted) {
  if (!isValidUUID(hematology_id)) return { success: false, message: 'Invalid hematology ID.' };

  const hematology = await Hematology.findOne({ where: { hematology_id } });

  if (!hematology) return { success: false, message: 'Hematology not found.' };

  const parsedDelete =
    is_deleted === true || is_deleted === 'true'
      ? true
      : is_deleted === false || is_deleted === 'false'
        ? false
        : null;

  if (parsedDelete === null)
    return { success: false, message: 'Invalid is_deleted value. Must be true or false.' };

  if (hematology.is_deleted === parsedDelete) {
    return {
      success: false,
      message: parsedDelete
        ? 'Hematology result is already deleted'
        : 'Hematology result is already active',
    };
  }

  hematology.is_deleted = parsedDelete;
  await hematology.save();

  return {
    success: true,
    message: parsedDelete ? 'Hematology deleted.' : 'Hematology restored.',
    data: hematology.get({ plain: true }),
  };
}

async function getHematologyByResultIdService(result_id) {
  if (!isValidUUID(result_id)) return { success: false, message: 'Invalid result ID.' };

  const result = await Hematology.findOne({ where: { result_id } });

  if (!result) return { success: false, message: 'Result ID not found.' };

  return {
    success: true,
    data: result.get({ plain: true }),
  };
}

module.exports = {
  createHematologyService,
  getlAllHematologyResultService,
  getHematologyResultByIdService,
  updateHematologyResultService,
  toggleDeleteHematologyResultService,
  getHematologyByResultIdService,
};
