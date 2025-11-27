const { isValidUUID } = require('../../utils/security');
const { Ultrasound, updateUltrasoundResult } = require('./ultrasound.model');
const { Result } = require('../results/result.model');
const { formatToPh } = require('../../utils/datetime');

async function createUltrasoundService(result_id, data) {
  if (!result_id || !isValidUUID(result_id)) {
    return { success: false, message: 'Invalid or missing result_id' };
  }

  const allowedFields = [
    'ultrasound_type',
    'history',
    'comparison',
    'technique',
    'findings',
    'impression',
    'remarks',
  ];

  const resultField = {};

  for (const field of allowedFields) {
    let value = data[field];

    if (value === undefined || value === null) continue;

    const strValue = String(value).trim();

    if (strValue === '') {
      resultField[field] = null;
      continue;
    }
    resultField[field] = strValue;
  }

  if (resultField.ultrasound_type && resultField.ultrasound_type.length > 50) {
    return { success: false, message: 'Ultrasound type must be 50 characters or less.' };
  }

  if (resultField.comparison && resultField.comparison.length > 250) {
    return { success: false, message: 'Comparison must be 250 characters or less.' };
  }

  resultField.result_id = result_id;

  const ultrasound = await Ultrasound.create(resultField);

  return {
    success: true,
    data: ultrasound,
  };
}

async function getAllUltrasoundService(is_deleted) {
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

  const ultrasound = await Ultrasound.findAll({
    where: whereClause,
    attributes: [
      'ultrasound_id',
      'ultrasound_type',
      'history',
      'comparison',
      'technique',
      'findings',
      'impression',
      'remarks',
      'is_deleted',
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
    count: ultrasound.length,
    data: ultrasound.map(ultrasounds => ultrasounds.get({ plain: true })),
  };
}

async function getUltrasoundByIdService(ultrasound_id) {
  if (!isValidUUID(ultrasound_id)) return { success: false, message: 'Invalid ultrasound ID.' };

  const ultrasound = await Ultrasound.findByPk(ultrasound_id, {
    attributes: [
      'ultrasound_id',
      'ultrasound_type',
      'history',
      'comparison',
      'technique',
      'findings',
      'impression',
      'remarks',
      'is_deleted',
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

  if (!ultrasound) return { success: false, message: 'Ultrasound result not found.' };

  return {
    success: true,
    data: ultrasound.get({ plain: true }),
  };
}

async function uptdateUltrasoundResultService(ultrasound_id, updateField) {
  if (!isValidUUID(ultrasound_id)) return { success: false, message: 'Invalid ultrasound ID.' };

  const allowedFields = [
    'ultrasound_type',
    'history',
    'comparison',
    'technique',
    'findings',
    'impression',
    'remarks',
    'is_deleted',
    'created_at',
    'updated_at',
  ];

  const update = {};

  for (const field of allowedFields) {
    let value = updateField[field];

    if (value === undefined || value === null) continue;

    const strValue = String(value).trim();

    if (strValue === '') {
      update[field] = null;
      continue;
    }
    update[field] = strValue;
  }

  if (update.ultrasound_type && update.ultrasound_type.length > 50) {
    return { success: false, message: 'xray_type must be 50 characters or less.' };
  }

  if (update.technique && update.technique.length > 250) {
    return { success: false, message: 'technique must be 250 characters or less.' };
  }

  if (Object.keys(update).length === 0) {
    return { success: false, error: 'No fields provided to update.' };
  }

  const updateUltrasound = await Ultrasound.update(update, {
    where: { ultrasound_id },
  });

  const refreshedUltrasound = await Ultrasound.findByPk(ultrasound_id);

  if (!refreshedUltrasound) return { success: false, message: 'Ultrasound not found.' };

  const plain = refreshedUltrasound.get({ plain: true });
  plain.created_at = formatToPh(plain.created_at);
  plain.updated_at = formatToPh(plain.updated_at);

  return {
    success: true,
    message: 'Ultrasound update successfully.',
    data: plain,
  };
}

async function toggleDeleteUltrasoundResultService(ultrasound_id, is_deleted) {
  if (!isValidUUID(ultrasound_id)) {
    return { success: false, message: 'Invalid ultrasound ID.' };
  }
  const ultrasound = await Ultrasound.findOne({ where: { ultrasound_id } });

  if (!ultrasound) return { success: false, message: 'Ultrasound not found.' };

  const parsedDelete =
    is_deleted === true || is_deleted === 'true'
      ? true
      : is_deleted === false || is_deleted === 'false'
        ? false
        : null;

  if (parsedDelete === null)
    return { success: false, message: 'Invalid is_deleted value. Must be true or false.' };

  if (ultrasound.is_deleted === parsedDelete) {
    return {
      success: false,
      message: parsedDelete
        ? 'Ultrasound result is already deleted'
        : 'Ultrasound result is already active',
    };
  }

  ultrasound.is_deleted = parsedDelete;
  await ultrasound.save();

  return {
    success: true,
    message: parsedDelete ? 'Ultrasound deleted.' : 'Ultrasound restored.',
    data: ultrasound.get({ plain: true }),
  };
}

module.exports = {
  createUltrasoundService,
  getAllUltrasoundService,
  getUltrasoundByIdService,
  uptdateUltrasoundResultService,
  toggleDeleteUltrasoundResultService,
};
