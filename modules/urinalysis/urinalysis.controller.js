const { formatToPh } = require('../../utils/datetime');
const {
  createUrinalysisService,
  getAllUrinalysisResultService,
  getAllUrinalysisByIdService,
  updateUrinalysisResultService,
  toggleUrinalysisStatusService,
} = require('./urinalysis.service');

async function createUrinalysisController(req, res) {
  try {
    const {
      result_id,
      color,
      transparency,
      leukocytes,
      ketone,
      nitrite,
      urobilinogen,
      bilirubin,
      glucose,
      protein,
      specific_gravity,
      ph,
      blood,
      vitamin_c,
      microalbumin,
      calcium,
      ascorbic_acid,
      pus_cells,
      rbc,
      epithelial_cells,
      mucus_threads,
      bacteria,
      yeast_cells,
      hyaline_cast,
      wbc_cast,
      rbc_cast,
      coarse_granular_cast,
      fine_granular_cast,
      waxy_cast,
      other_cast,
      amorphous_urates,
      amorphous_phosphates,
      calcium_oxalate,
      calcium_carbonate,
      uric_acid_crystals,
      triple_phosphates,
      cystine,
      clue_cells,
      trichomonas_vaginalis,
      renal_cells,
      pregnancy_test,
      others,
      notes,
    } = req.body;

    const urinalysis = await createUrinalysisService(result_id, {
      color,
      transparency,
      leukocytes,
      ketone,
      nitrite,
      urobilinogen,
      bilirubin,
      glucose,
      protein,
      specific_gravity,
      ph,
      blood,
      vitamin_c,
      microalbumin,
      calcium,
      ascorbic_acid,
      pus_cells,
      rbc,
      epithelial_cells,
      mucus_threads,
      bacteria,
      yeast_cells,
      hyaline_cast,
      wbc_cast,
      rbc_cast,
      coarse_granular_cast,
      fine_granular_cast,
      waxy_cast,
      other_cast,
      amorphous_urates,
      amorphous_phosphates,
      calcium_oxalate,
      calcium_carbonate,
      uric_acid_crystals,
      triple_phosphates,
      cystine,
      clue_cells,
      trichomonas_vaginalis,
      renal_cells,
      pregnancy_test,
      others,
      notes,
    });

    const data = urinalysis.data;

    data.created_at = formatToPh(data.created_at);
    data.updated_at = formatToPh(data.updated_at);

    return res.status(201).json({
      ...urinalysis,
      data: data,
    });
  } catch (error) {
    console.error('Error creating urinalysis result:', error.message);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);
    return res.status(500).json({
      success: false,
      error: 'Server error while creating urinalysis result.',
    });
  }
}

async function getAllUrinalysisResultController(req, res) {
  try {
    const { is_deleted } = req.query;
    const urinalysis = await getAllUrinalysisResultService(is_deleted);

    if (!urinalysis.success) {
      return res.status(400).json(urinalysis);
    }

    urinalysis.data = urinalysis.data.map(data => ({
      ...data,
      created_at: formatToPh(data.created_at),
      updated_at: formatToPh(data.updated_at),
    }));

    return res.status(200).json({
      ...urinalysis,
      data: urinalysis,
    });
  } catch (err) {
    console.error('Error fetching urinalysis results:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function getAllUrinalysisByIdController(req, res) {
  try {
    const { urinalysis_id } = req.params;

    const urinalysis = await getAllUrinalysisByIdService(urinalysis_id);

    if (!urinalysis.success) return res.status(404).json(urinalysis);

    const data = urinalysis.data;
    data.created_at = formatToPh(data.created_at);
    data.updated_at = formatToPh(data.updated_at);

    return res.status(200).json({
      success: true,
      data: data,
    });
  } catch (err) {
    console.error('Error in getting urinalysis result by ID:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function updateUrinalysisResultController(req, res) {
  try {
    const { urinalysis_id } = req.params;
    const updateField = req.body;

    const urinalysis = await updateUrinalysisResultService(urinalysis_id, updateField);

    if (!urinalysis.success) {
      if (urinalysis.message === 'Urinalysis not found.') {
        return res.status(404).json(urinalysis);
      }
      return res.status(400).json(urinalysis);
    }

    return res.status(200).json(urinalysis);
  } catch (err) {
    console.error('Error in toggleDeleteUrinalysisResultController:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function toggleUrinalysisStatusController(req, res) {
  try {
    const { urinalysis_id } = req.params;
    const { is_deleted } = req.query;

    const urinalysis = await toggleUrinalysisStatusService(urinalysis_id, is_deleted);

    if (!urinalysis.success) {
      return res.status(400).json(urinalysis);
    }

    const formatted = urinalysis.data;
    formatted.created_at = formatToPh(formatted.created_at);
    formatted.updated_at = formatToPh(formatted.updated_at);

    return res.status(200).json({
      ...urinalysis,
      data: formatted,
    });
  } catch (err) {
    console.error('Error in toggleUrinalysisStatusController:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

module.exports = {
  createUrinalysisController,
  getAllUrinalysisResultController,
  getAllUrinalysisByIdController,
  updateUrinalysisResultController,
  toggleUrinalysisStatusController,
};
