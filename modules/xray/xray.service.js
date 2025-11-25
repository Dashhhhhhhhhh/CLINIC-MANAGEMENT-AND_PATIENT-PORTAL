const { isValidUUID } = require('../../utils/security');
const {
  Xray,
  createXray,
  getAllXray,
  getXrayById,
  updateXrayResult,
  toggleDeleteXrayResult,
} = require('./xray.model');
const { Result } = require('../results/result.model');
const { where } = require('sequelize');
const { formatToPh } = require('../../utils/datetime');

async function createXrayService(result_id, data) {
  if (!result_id || !isValidUUID(result_id)) {
    return { success: false, message: 'Invalid or missing result_id' };
  }

  const allowedFields = [
    'xray_type',
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

  if (resultField.xray_type && resultField.xray_type.length > 50) {
    return { success: false, message: 'xray_type must be 50 characters or less.' };
  }

  if (resultField.technique && resultField.technique.length > 250) {
    return { success: false, message: 'technique must be 250 characters or less.' };
  }

  resultField.result_id = result_id;

  const xray = await Xray.create(resultField);

  return {
    success: true,
    data: xray,
  };
}

async function getallXrayService(is_deleted) {
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

  const xray = await Xray.findAll({
    where: whereClause,
    attributes: [
      'xray_id',
      'xray_type',
      'history',
      'comparison',
      'technique',
      'findings',
      'impression',
      'remarks',
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
    count: xray.length,
    data: xray.map(xrays => xrays.get({ plain: true })),
  };
}

async function getXrayByIdService(xray_id) {
  if (!isValidUUID(xray_id)) return { success: false, message: 'Invalid xray ID.' };

  const xray = await Xray.findByPk(xray_id, {
    attributes: [
      'xray_id',
      'xray_type',
      'history',
      'comparison',
      'technique',
      'findings',
      'impression',
      'remarks',
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

  if (!xray) return { success: false, message: 'Xray result not found.' };

  return {
    success: true,
    data: xray.get({ plain: true }),
  };
}

async function updateXrayResultService(xray_id, updateField) {
  if (!isValidUUID(xray_id)) {
    return { success: false, message: 'Invalid xray ID.' };
  }

  const allowedFields = [
    'xray_type',
    'history',
    'comparison',
    'technique',
    'findings',
    'impression',
    'remarks',
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

  if (update.xray_type && update.xray_type.length > 50) {
    return { success: false, message: 'xray_type must be 50 characters or less.' };
  }

  if (update.technique && update.technique.length > 250) {
    return { success: false, message: 'technique must be 250 characters or less.' };
  }

  if (Object.keys(update).length === 0) {
    return { success: false, error: 'No fields provided to update.' };
  }

  const updateXray = await Xray.update(update, {
    where: { xray_id },
  });

  const refreshedXray = await Xray.findByPk(xray_id);

  if (!refreshedXray) return { success: false, message: 'Xray not found.' };

  const plain = refreshedXray.get({ plain: true });
  plain.created_at = formatToPh(plain.created_at);
  plain.updated_at = formatToPh(plain.updated_at);

  return {
    success: true,
    message: 'Xray updated successfully',
    data: plain,
  };
}

async function toggleDeleteXrayResultService(xray_id, is_deleted) {
  if (!isValidUUID(xray_id)) {
    return { success: false, message: 'Invalid xray ID.' };
  }
  const xray = await Xray.findOne({ where: { xray_id } });

  if (!xray) return { success: false, message: 'X-ray not found.' };

  const parsedDelete =
    is_deleted === true || is_deleted === 'true'
      ? true
      : is_deleted === false || is_deleted === 'false'
        ? false
        : null;

  if (parsedDelete === null)
    return { success: false, message: 'Invalid is_deleted value. Must be true or false.' };

  if (xray.is_deleted === parsedDelete) {
    return {
      success: false,
      message: parsedDelete ? 'Xray result is already deleted' : 'Xray result is already active',
    };
  }

  xray.is_deleted = parsedDelete;
  await xray.save();

  return {
    success: true,
    message: parsedDelete ? 'Xray deleted.' : 'Xray restored.',
    data: xray.get({ plain: true }),
  };
}

module.exports = {
  createXrayService,
  getallXrayService,
  getXrayByIdService,
  updateXrayResultService,
  toggleDeleteXrayResultService,
};
