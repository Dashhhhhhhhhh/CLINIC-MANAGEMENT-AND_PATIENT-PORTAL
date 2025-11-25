const { formatToPh } = require('../../utils/datetime');
const {
  createXrayService,
  getallXrayService,
  getXrayByIdService,
  updateXrayResultService,
  toggleDeleteXrayResultService,
} = require('./xray.service');

async function createXrayController(req, res) {
  try {
    const { result_id, xray_type, history, comparison, technique, findings, impression, remarks } =
      req.body;

    const xray = await createXrayService(result_id, {
      xray_type,
      history,
      comparison,
      technique,
      findings,
      impression,
      remarks,
    });
    const data = xray.data;

    data.created_at = formatToPh(data.created_at);
    data.updated_at = formatToPh(data.updated_at);

    return res.status(201).json({
      ...xray,
      data: data,
    });
  } catch (error) {
    console.error('Error creating x-ray result:', error.message);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);
    return res.status(500).json({
      success: false,
      error: 'Server error while creating x-ray result.',
    });
  }
}

async function getallXrayController(req, res) {
  try {
    const { is_deleted } = req.query;
    const xray = await getallXrayService(is_deleted);

    if (!xray.success) {
      return res.status(400).json(xray);
    }

    xray.data = xray.data.map(data => ({
      ...data,
      created_at: formatToPh(data.created_at),
      updated_at: formatToPh(data.updated_at),
    }));

    return res.status(200).json({
      ...xray,
      data: xray.data,
    });
  } catch (err) {
    console.error('Error fetching x-ray results:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function getXrayByIdController(req, res) {
  try {
    const { xray_id } = req.params;

    const xray = await getXrayByIdService(xray_id);

    if (!xray.success) return res.status(404).json({ xray });

    const data = xray.data;
    data.created_at = formatToPh(data.created_at);
    data.updated_at = formatToPh(data.updated_at);

    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error('Error in getting x-ray result by ID:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function updateXrayResultController(req, res) {
  try {
    const { xray_id } = req.params;
    const updateField = req.body;

    const xray = await updateXrayResultService(xray_id, updateField);

    if (!xray.success) {
      if (xray.message === 'Xray not found.') {
        return res.status(404).json(xray);
      }
      return res.status(400).json(xray);
    }

    return res.status(200).json(xray);
  } catch (err) {
    console.error('Error in update x-ray controller', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
}

async function toggleDeleteXrayResultController(req, res) {
  try {
    const { xray_id } = req.params;
    const { is_deleted } = req.query;
    const xray = await toggleDeleteXrayResultService(xray_id, is_deleted);

    if (!xray.success) {
      return res.status(400).json(xray);
    }

    const formatted = xray.data;
    formatted.created_at = formatToPh(formatted.created_at);
    formatted.updated_at = formatToPh(formatted.updated_at);

    return res.status(200).json({
      ...xray,
      data: formatted,
    });
  } catch (err) {
    console.error('Error in toggleDeleteXrayResultController:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = {
  createXrayController,
  getallXrayController,
  getXrayByIdController,
  updateXrayResultController,
  toggleDeleteXrayResultController,
};
