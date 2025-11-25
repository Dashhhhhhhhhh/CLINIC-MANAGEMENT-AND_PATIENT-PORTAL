const { isValidUUID } = require('../../utils/security');
const { Hematology, getHematologyResultById } = require('./hematology.model');
const { Result } = require('../results/result.model');
const { formatToPh } = require('../../utils/datetime');

async function createHematologyService(result_id, data) {
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

  resultField.other = data.other ?? null;
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

  const allowedFields = [
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
  ];

  const decimalPattern = /^\d{1,4}(\.\d{1,2})?$/;

  const update = {};

  for (const field of allowedFields) {
    let value = updateField[field];

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

    update[field] = numericValue;
  }

  if (update.others) {
    if (update.others.length < 5 || update.others.length > 255) {
      return {
        success: false,
        message: 'Other should not be less than 5 and be greater than 255 characters.',
      };
    }
  }
  if (Object.keys(update).length === 0) {
    return { success: false, error: 'No fields provided to update.' };
  }

  const updateHematology = await Hematology.update(update, {
    where: { hematology_id },
  });

  const refreshedHematology = await Hematology.findByPk(hematology_id);

  if (!refreshedHematology) return { success: false, error: 'Hematology not found' };

  const plain = refreshedHematology.get({ plain: true });
  plain.created_at = formatToPh(plain.created_at);
  plain.updated_at = formatToPh(plain.updated_at);

  return {
    success: true,
    message: 'Hematology updated successfully.',
    data: plain,
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

module.exports = {
  createHematologyService,
  getlAllHematologyResultService,
  getHematologyResultByIdService,
  updateHematologyResultService,
  toggleDeleteHematologyResultService,
};
