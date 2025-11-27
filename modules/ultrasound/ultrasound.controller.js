const { formatToPh } = require('../../utils/datetime');
const {
  createUltrasoundService,
  getAllUltrasoundService,
  getUltrasoundByIdService,
  uptdateUltrasoundResultService,
  toggleDeleteUltrasoundResultService,
} = require('./ultrasound.service');

async function createUltrasoundController(req, res) {
  try {
    const {
      result_id,
      ultrasound_type,
      history,
      comparison,
      technique,
      findings,
      impression,
      remarks,
    } = req.body;

    const ultrasound = await createUltrasoundService(result_id, {
      ultrasound_type,
      history,
      comparison,
      technique,
      findings,
      impression,
      remarks,
    });

    const data = ultrasound.data;

    data.created_at = formatToPh(data.created_at);
    data.updated_at = formatToPh(data.updated_at);

    return res.status(201).json({
      ...ultrasound,
      data: data,
    });
  } catch (error) {
    console.error('Error ultrasound ultrasound result:', error.message);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);
    return res.status(500).json({
      success: false,
      error: 'Server error while creating ultrasound result.',
    });
  }
}

async function getAllUltrasoundController(req, res) {
  try {
    const { is_deleted } = req.query;
    const ultrasound = await getAllUltrasoundService(is_deleted);

    if (!ultrasound.success) {
      return res.status(400).json(ultrasound);
    }

    ultrasound.data = ultrasound.data.map(data => ({
      ...data,
      created_at: formatToPh(data.created_at),
      updated_at: formatToPh(data.updated_at),
    }));

    return res.status(200).json({
      ...ultrasound,
      data: ultrasound.data,
    });
  } catch (err) {
    console.error('Error fetching ultrasound results.', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function getUltrasoundByIdController(req, res) {
  try {
    const { ultrasound_id } = req.params;

    const ultrasound = await getUltrasoundByIdService(ultrasound_id);

    if (!ultrasound.success) return res.status(404).json(ultrasound);

    const data = ultrasound.data;
    data.created_at = formatToPh(data.created_at);
    data.updated_at = formatToPh(data.updated_at);

    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error('Error in getting ultrasound result by ID:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function uptdateUltrasoundResultController(req, res) {
  try {
    const { ultrasound_id } = req.params;
    const updateField = req.body;

    const ultrasound = await uptdateUltrasoundResultService(ultrasound_id, updateField);

    if (!ultrasound.success) {
      if (ultrasound.message === 'Ultrasound not found.') {
        return res.status(404).json(ultrasound);
      }
      return res.status(400).json(ultrasound);
    }

    return res.status(200).json(ultrasound);
  } catch (err) {
    console.error('Error in update Ultrasound controller', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
}

async function toggleDeleteUltrasoundResultController(req, res) {
  try {
    const { ultrasound_id } = req.params;
    const { is_deleted } = req.query;
    const ultrasound = await toggleDeleteUltrasoundResultService(ultrasound_id, is_deleted);

    if (!ultrasound.success) {
      return res.status(400).json(ultrasound);
    }

    const formatted = ultrasound.data;
    formatted.created_at = formatToPh(formatted.created_at);
    formatted.updated_at = formatToPh(formatted.updated_at);

    return res.status(200).json({
      ...ultrasound,
      data: formatted,
    });
  } catch (err) {
    console.error('Error in toggleDeleteUltrasoundResultController:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = {
  createUltrasoundController,
  getAllUltrasoundController,
  getUltrasoundByIdController,
  uptdateUltrasoundResultController,
  toggleDeleteUltrasoundResultController,
};
