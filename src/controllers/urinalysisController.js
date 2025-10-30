const { isValidUUID } = require("../utils/security");
const { Urinalysis, createUrinalysis, getAllUrinalysisResult, getAllUrinalysisResultbyId, updateUrinalysisResult, toggleDeleteUrinalysisResult } = require("../models/urinalysisModel");

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
      ph_level,
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
      other_casts,
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
      notes
    } = req.body;

    if (!result_id || !isValidUUID(result_id)) {
      return res.status(400).json({ message: "Invalid or missing result_id" });
    }

    const cleanedData = {
      result_id: result_id.trim(),
      color: color?.trim() || null,
      transparency: transparency?.trim() || null,
      leukocytes: leukocytes?.trim() || null,
      ketone: ketone?.trim() || null,
      nitrite: nitrite?.trim() || null,
      urobilinogen: urobilinogen?.trim() || null,
      bilirubin: bilirubin?.trim() || null,
      glucose: glucose?.trim() || null,
      protein: protein?.trim() || null,
      specific_gravity: specific_gravity ?? null,
      ph_level: ph_level ?? null,
      blood: blood?.trim() || null,
      vitamin_c: vitamin_c?.trim() || null,
      microalbumin: microalbumin?.trim() || null,
      calcium: calcium?.trim() || null,
      ascorbic_acid: ascorbic_acid?.trim() || null,
      pus_cells: pus_cells?.trim() || null,
      rbc: rbc?.trim() || null,
      epithelial_cells: epithelial_cells?.trim() || null,
      mucus_threads: mucus_threads?.trim() || null,
      bacteria: bacteria?.trim() || null,
      yeast_cells: yeast_cells?.trim() || null,
      hyaline_cast: hyaline_cast?.trim() || null,
      wbc_cast: wbc_cast?.trim() || null,
      rbc_cast: rbc_cast?.trim() || null,
      coarse_granular_cast: coarse_granular_cast?.trim() || null,
      fine_granular_cast: fine_granular_cast?.trim() || null,
      waxy_cast: waxy_cast?.trim() || null,
      other_casts: other_casts?.trim() || null,
      amorphous_urates: amorphous_urates?.trim() || null,
      amorphous_phosphates: amorphous_phosphates?.trim() || null,
      calcium_oxalate: calcium_oxalate?.trim() || null,
      calcium_carbonate: calcium_carbonate?.trim() || null,
      uric_acid_crystals: uric_acid_crystals?.trim() || null,
      triple_phosphates: triple_phosphates?.trim() || null,
      cystine: cystine?.trim() || null,
      clue_cells: clue_cells?.trim() || null,
      trichomonas_vaginalis: trichomonas_vaginalis?.trim() || null,
      renal_cells: renal_cells?.trim() || null,
      pregnancy_test: pregnancy_test?.trim() || null,
      others: others?.trim() || null,
      notes: notes?.trim() || null
    };

    if (specific_gravity && isNaN(Number(specific_gravity))) {
      return res.status(400).json({
        success: false,
        error: "Specific gravity must be a valid number."
      });
    }

    if (ph_level && isNaN(Number(ph_level))) {
      return res.status(400).json({
        success: false,
        error: "pH level must be a valid number."
      });
    }

    const urinalysisResult = await createUrinalysis(cleanedData);
    const newUrinalysisResult = urinalysisResult.get({ plain: true });

    return res.status(201).json({
      success: true,
      message: "Urinalysis result created successfully.",
      result: newUrinalysisResult
    });

  } catch (error) {
    console.error("Error creating urinalysis result:", error.message);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);
    return res.status(500).json({
      success: false,
      error: "Server error while creating urinalysis result."
    });
  }
}

async function getAllUrinalysisResultController(req, res){ 
    try {

        const urinalysisresult = await getAllUrinalysisResult();
    
        return res.status(200).json({
            success: true,
            count: urinalysisresult.length,
            urinalysisresult
        });

  } catch (err) {
    console.error("Error fetching urinalysis results:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getAllUrinalysisByIdController(req, res) {
    try {

    const {id } = req.params;

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const urinalysis = await getAllUrinalysisResultbyId(id);

    if (!urinalysis) {
      return res.status(404).json({ success: false, error: "urinalysis result not found" });
    }

    return res.status(200).json({ success: true, urinalysis });

  } catch (err) {
    console.error("Error in getting urinalysis result by ID:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updateUrinalysisResultController(req, res) {
    try { 

        const { id } =  req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const update = {};

    const allowedFields =  [
            "color",
            "transparency",
            "leukocytes",
            "ketone",
            "nitrite",
            "urobilinogen",
            "bilirubin",
            "glucose",
            "protein",
            "specific_gravity",
            "ph_level",
            "blood",
            "vitamin_c",
            "microalbumin",
            "calcium",
            "ascorbic_acid",
            "pus_cells",
            "rbc",
            "epithelial_cells",
            "mucus_threads",
            "bacteria",
            "yeast_cells",
            "hyaline_cast",
            "wbc_cast",
            "rbc_cast",
            "coarse_granular_cast",
            "fine_granular_cast",
            "waxy_cast",
            "other_casts",
            "amorphous_urates",
            "amorphous_phosphates",
            "calcium_oxalate",
            "calcium_carbonate",
            "uric_acid_crystals",
            "triple_phosphates",
            "cystine",
            "clue_cells",
            "trichomonas_vaginalis",
            "renal_cells",
            "pregnancy_test",
            "others",
            "notes"
            ];    

    for (const field of allowedFields) {
        let value = req.body[field];
    
        if (value === null || value === undefined) continue;

        let trimmed =value;

        if (typeof value === 'string') {
            trimmed = value.trim()
        } else if (typeof value === 'number') {
          if (!isNaN(Number(value))) {
            trimmed = value;
          } else {
            continue;
          }
        }
       update[field] = trimmed;   
     }

    if (Object.keys(update).length === 0) {
        return res.status(400).json({ success: false, error: "No fields provided for update." });
    }

    const updateUrinalysis = await updateUrinalysisResult(id, update);

    if (!updateUrinalysis) {
      return res.status(400).json({ success: false, error: "Urinalysis result not found" });
    }

    return res.status(200).json({ 
      success: true,
      message: "Urinalysis result updated.",
      updateUrinalysis
    });
  

  } catch (err) {
    console.error("Error in updateUrinalysisController", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error."
    });
  }
}

async function toggleDeletedUrinalysisResultController (req, res) {
  try {

    const { id } = req.params;

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const result = await toggleDeleteUrinalysisResult(id);

    if (!result) {
      return res.status(400).json({ success: false, error: "Result not found."});
    }


    return res.status(200).json({ 
        success: true,
        message: result.is_deleted
            ? "Result deleted."
            : "Result restored.",
        result,
    });

  } catch (err) {
    console.error("Error in toggleDeleteUrinalysisResultController:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}


module.exports = { 
    Urinalysis,
    createUrinalysisController,
    getAllUrinalysisResultController,
    getAllUrinalysisByIdController,
    updateUrinalysisResultController,
    toggleDeletedUrinalysisResultController
 };
