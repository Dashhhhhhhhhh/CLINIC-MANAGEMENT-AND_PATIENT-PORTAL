const {
  createResultService,
  getAllResultService,
  getResultByIdService,
  updateResultService,
  toggleResultDeleteService,
  findLatestResultsService,
  getPatientResultService,
  getWorklistResultService,
  getResultsListService,
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
      billing_item_id || null,
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

async function findLatestResultsController(req, res) {
  try {
    const { is_deleted } = req.query;
    const { patient_id } = req.params;

    console.log(req.params.patient_id);

    if (!patient_id) {
      return res.status(400).json({
        success: false,
        message: 'patient_id is required',
      });
    }

    const result = await findLatestResultsService(patient_id, is_deleted);

    result.data = result.data.map(data => ({
      ...data,
      created_at: formatToPh(data.created_at),
      updated_at: formatToPh(data.updated_at),
    }));

    return res.status(200).json({
      ...result,
      data: result.data,
    });
  } catch (error) {
    console.error('Error fetching patient results::', error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    return res.status(500).json({
      success: false,
      error: 'Error fetching patient results:',
    });
  }
}

async function getPatientResultController(req, res) {
  try {
    const { patientId } = req.params;
    const { from, to, page, limit } = req.query;

    const result = await getPatientResultService({
      patient_id: patientId,
      from,
      to,
      page,
      limit,
    });

    if (!result.success) return res.status(400).json(result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('Error fetching patient results:', error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    return res.status(500).json({
      success: false,
      error: 'Error fetching patient results:',
    });
  }
}

const uploadResultReport = async (req, res) => {
  try {
    const { result_id } = req.params;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded',
      });
    }

    const result = await Result.findByPk(result_id);

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Result not found',
      });
    }

    result.report_file_url = `/uploads/results/${req.file.filename}`;
    result.report_file_type = req.file.mimetype.includes('pdf') ? 'pdf' : 'docx';
    result.report_uploaded_at = new Date();
    result.status = 'Completed';

    await result.save();

    res.json({
      success: true,
      message: 'Report uploaded successfully',
      data: {
        result_id: result.result_id,
        report_file_url: result.report_file_url,
        report_file_type: result.report_file_type,
        status: result.status,
      },
    });
  } catch (error) {
    console.error('Upload result report error:', error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

async function getWorklistResultController(req, res) {
  try {
    const { status, test_type_id, page, limit } = req.query;

    const result = await getWorklistResultService({
      status,
      test_type_id,
      page,
      limit,
    });

    if (!result.success) return res.status(400).json(result);

    return res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching worklist results:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function getResultsListController(req, res) {
  try {
    const { page, limit, search, is_deleted, sortBy, sortOrder, test_type_id } = req.query;

    const testTypeNorm =
      typeof test_type_id === 'string' && test_type_id.trim() === '' ? undefined : test_type_id;

    const searchNorm = typeof search === 'string' ? search.trim() : '';

    const result = await getResultsListService({
      page,
      limit,
      search: searchNorm,
      is_deleted,
      test_type_id: testTypeNorm,
      sortBy,
      sortOrder,
    });

    return res.status(200).json(result);
  } catch (err) {
    console.error('Error fetching results list:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = {
  createResultController,
  getAllResultController,
  getResultByIdController,
  updateResultController,
  toggleResultDeleteController,
  findLatestResultsController,
  getPatientResultController,
  uploadResultReport,
  getWorklistResultController,
  getResultsListController,
};
