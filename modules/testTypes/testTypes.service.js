const { isValidUUID } = require('../../utils/security');
const { TestTypes } = require('../testTypes/testTypes.model');
const { Op, fn, col, where } = require('sequelize');

async function createTestTypeService(test_type_name, description, active) {
  const cleanedTestTypeName = test_type_name.trim();
  const cleanedDescription = description ? description.trim() : null;

  if (cleanedTestTypeName.length < 2 || cleanedTestTypeName.length > 100) {
    return {
      success: false,
      message: 'Test type name must be atleast 2 characters and must not exceed 100.',
    };
  }

  if (cleanedDescription && cleanedDescription.length > 255) {
    return { success: false, message: 'Description must not exceed 255 characters.' };
  }

  let isActive = true;
  if (active !== undefined) {
    if (active === true || active === 'true') isActive = true;
    else if (active === false || active === 'false') isActive = false;
    else return { success: false, message: 'Active must be true or false.' };
  }

  const existingTestType = await TestTypes.findOne({
    where: Sequelize.where(fn('LOWER', col('test_type_name')), cleanedTestTypeName.toLowerCase()),
  });

  if (existingTestType) return { success: false, message: 'Test type already exists.' };

  const testType = await TestTypes.create({
    test_type_name: cleanedTestTypeName,
    description: cleanedDescription,
    active: isActive,
  });

  return {
    success: true,
    message: 'Test-type created successfully.',
    data: testType,
  };
}

async function getAllTestTypeService(active) {
  const whereClause = {};

  if (active !== undefined) {
    if (active === 'true' || active === true) {
      whereClause.active = true;
    } else if (active === 'false' || active === false) {
      whereClause.active = false;
    } else {
      return {
        success: false,
        message: "Invalid 'active' value. Must be true or false.",
      };
    }
  }

  const result = await TestTypes.findAll({
    where: whereClause,
    attributes: ['test_type_id', 'test_type_name', 'description', 'active'],
  });

  return {
    success: true,
    count: result.length,
    data: result.map(type => type.get({ plain: true })),
  };
}

async function getTestTypesByIdService(test_type_id) {
  if (!isValidUUID(test_type_id)) return { success: false, message: 'Invalid test type ID.' };

  const testType = await TestTypes.findByPk(test_type_id);

  if (!testType) return { success: false, message: 'Test type not found.' };

  return {
    success: true,
    data: testType.get({ plain: true }),
  };
}

async function updateTestTypeService(test_type_id, updateField) {
  if (!isValidUUID(test_type_id)) return { success: false, message: 'Invalid test type ID.' };

  const existingTestType = await TestTypes.findOne({ where: { test_type_id: test_type_id } });

  if (!existingTestType) return { success: false, message: 'Test type not found.' };

  const update = {};

  const allowedFields = ['test_type_name', 'description'];

  for (const field of allowedFields) {
    let value = updateField[field];
    if (value === null || value === undefined) continue;

    let trimmed;

    if (typeof value === 'string') {
      trimmed = value.trim();
    } else if (typeof value === 'number') {
      if (isNaN(value) || value < 0) continue;
      trimmed = value;
    } else if (typeof value === 'boolean') {
      trimmed = value;
    } else {
      continue;
    }

    update[field] = trimmed;
  }

  if (update.test_type_name) {
    const lowerName = update.test_type_name.toLowerCase();

    const duplicate = await TestTypes.findOne({
      where: Sequelize.where(Sequelize.fn('LOWER', Sequelize.col('test_type_name')), lowerName),
    });

    if (duplicate && duplicate.test_type_id !== test_type_id) {
      return { success: false, message: 'Test type name already exists.' };
    }
  }

  if (update.description) {
    if (update.description && update.description.length > 255) {
      return { success: false, message: 'Description must not exceed 255 characters.' };
    }
  }

  if (Object.keys(update).length === 0)
    return { success: false, message: 'No fields provided to update.' };

  const testTypes = await TestTypes.update(update, {
    where: { test_type_id: test_type_id },
  });

  const refreshTestType = await TestTypes.findOne({ where: { test_type_id: test_type_id } });

  return {
    success: true,
    message: 'Test-type updated successfully.',
    data: refreshTestType.get({ plain: true }),
  };
}

async function toggleTestTypeStatusService(test_type_id, active) {
  if (!isValidUUID(test_type_id)) return { success: false, message: 'Invalid test type ID.' };

  const testType = await TestTypes.findOne({ where: { test_type_id: test_type_id } });

  if (!testType) return { success: false, message: 'Test type not found.' };

  const parsedActive =
    active === true || active === 'true'
      ? true
      : active === false || active === 'false'
        ? false
        : null;

  if (parsedActive === null)
    return { success: false, message: 'Invalid active value. Must be true or false.' };

  if (testType.active === parsedActive) {
    return {
      success: false,
      message: active ? 'Test-type is already active' : 'Test-type is already inactive',
    };
  }

  testType.active = parsedActivete;
  await testType.save();

  return {
    success: true,
    message: testType.active ? 'Test-type activated.' : 'Test-type deactivated',
    data: testType.get({ plain: true }),
  };
}

module.exports = {
  createTestTypeService,
  getAllTestTypeService,
  getTestTypesByIdService,
  updateTestTypeService,
  toggleTestTypeStatusService,
};
