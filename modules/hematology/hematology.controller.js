const {
  createHematologyService,
  getlAllHematologyResultService,
  getHematologyResultByIdService,
  updateHematologyResultService,
  toggleDeleteHematologyResultService,
} = require('./hematology.service');
const { formatToPh } = require('../../utils/datetime');
const { format } = require('sequelize/lib/utils');

async function createHematologyResultController(req, res) {
  try {
    const {
      result_id,
      hemoglobin,
      hematocrit,
      rbc_count,
      wbc_count,
      platelet_count,
      mcv,
      mch,
      mchc,
      neutrophils,
      lymphocytes,
      monocytes,
      eosinophils,
      basophils,
      other,
    } = req.body;

    const hematology = await createHematologyService(
      result_id,
      hemoglobin,
      hematocrit,
      rbc_count,
      wbc_count,
      platelet_count,
      mcv,
      mch,
      mchc,
      neutrophils,
      lymphocytes,
      monocytes,
      eosinophils,
      basophils,
      other
    );

    if (!hematology.success) return res.status(400).json(hematology);

    const data = hematology.data;

    data.created_at = formatToPh(data.created_at);
    data.updated_at = formatToPh(data.updated_at);

    return res.status(201).json({
      ...hematology,
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

async function getlAllHematologyResultController(req, res) {
  try {
    const { hematology_id } = req.params;
    const { is_deleted } = req.query;
    const hematology = await getlAllHematologyResultService(hematology_id, is_deleted);

    if (!hematology.success) {
      return res.status(400).json(hematology);
    }

    hematology.data = hematology.data.map(data => ({
      ...data,
      created_at: formatToPh(data.created_at),
      updated_at: formatToPh(data.updated_at),
    }));

    return res.status(200).json({
      ...hematology,
      data: hematology.data,
    });
  } catch (err) {
    console.error('Error fetching hematology results:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function getHematologyResultByIdController(req, res) {
  try {
    const { hematology_id } = req.params;

    const hematology = await getHematologyResultByIdService(hematology_id);

    if (!hematology.success) return res.status(404).json(hematology);

    const data = hematology.data;
    data.created_at = formatToPh(data.created_at);
    data.updated_at = formatToPh(data.updated_at);

    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error('Error in getting hematology result by ID:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function updateHematologyResultController(req, res) {
  try {
    const { hematology_id } = req.params;
    const updateField = req.body;

    const hematology = await updateHematologyResultService(hematology_id, updateField);

    if (!hematology.success) {
      if (hematology.message === 'hematology not found.') {
        return res.status(404).json(hematology);
      }
      return res.status(400).json(hematology);
    }

    return res.status(200).json(hematology);
  } catch (err) {
    console.error('Error in updateHematologyResultController', err);
    return res.status(500).json({
      success: false,
      error: 'Internal server error.',
    });
  }
}

async function toggleDeleteHematologyResultController(req, res) {
  try {
    const { hematology_id } = req.params;
    const { is_deleted } = req.body;

    const hematology = await toggleDeleteHematologyResultService(hematology_id, is_deleted);

    if (!hematology.success) {
      if (hematology.message === 'Hematology not found.') {
        return res.status(404).json(hematology);
      }
      return res.status(400).json(hematology);
    }

    return res.status(200).json(hematology);
  } catch (err) {
    console.error('Error in toggleDeleteHematologyResultController:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = {
  createHematologyResultController,
  getlAllHematologyResultController,
  getHematologyResultByIdController,
  updateHematologyResultController,
  toggleDeleteHematologyResultController,
};
