const {
  createResultService,
  getAllResultService,
  getResultByIdService,
  updateResultService,
  toggleResultDeleteService,
} = require('./result.service');
const { formatToPh } = require('../../utils/datetime');
const { format } = require('sequelize/lib/utils');
const { Result } = require('../results/result.model');

async function createResultController(req, res) {
  try {
    const { patient_id, test_type_id, billing_item_id, result_data, status } = req.body;

    const created_by = req.staff?.staff_id;

    if (!created_by) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Staff not authenticated',
      });
    }

    const result = await createResultService(
      patient_id,
      created_by,
      test_type_id,
      billing_item_id,
      result_data,
      status
    );

    if (!result.success) return res.status(400).json(result);

    const data = result.data;

    data.created_at = formatToPh(data.created_at);
    data.updated_at = formatToPh(data.updated_at);

    return res.status(201).json({
      ...result,
      data: data,
    });
  } catch (error) {
    console.error('Error creating result:', error.message);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);
    return res.status(500).json({
      success: false,
      error: 'Server error while creating result.',
    });
  }
}

async function getAllResultController(req, res) {
  try {
    const { is_deleted } = req.query;

    const result = await getAllResultService(is_deleted);

    result.data = result.data.map(data => ({
      ...data,
      created_at: formatToPh(data.created_at),
      updated_at: formatToPh(data.updated_at),
    }));

    return res.status(200).json({
      ...result,
      data: result.data,
    });
  } catch (err) {
    console.error('Error fetching results:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function getResultByIdController(req, res) {
  try {
    const { result_id } = req.params;

    const result = await getResultByIdService(result_id);

    if (!result.success)
      return res.status(404).json({ success: false, message: 'Result not found. ' });

    const data = result.data;
    data.created_at = formatToPh(data.created_at);
    data.updated_at = formatToPh(data.updated_at);

    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (error) {
    console.error('Error fetching bill:', error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    return res.status(500).json({
      success: false,
      error: 'Server error while fetching bill',
    });
  }
}

async function updateResultController(req, res) {
  try {
    const { result_id } = req.params;
    const updateField = req.body;

    const result = await updateResultService(result_id, updateField);

    if (!result.success) {
      if (result.message === 'Result not found.') {
        return res.status(404).json(result);
      }
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in updateResultController:', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
}

async function toggleResultDeleteController(req, res) {
  try {
    const { result_id } = req.params;
    const { is_deleted } = req.body;

    const result = await toggleResultDeleteService(result_id, is_deleted);

    if (!result.success) {
      if (result.message === 'Result not found.') {
        return res.status(404).json(result);
      }

      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in toggleResultDeletedController:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = {
  createResultController,
  getAllResultController,
  getResultByIdController,
  updateResultController,
  toggleResultDeleteController,
};
