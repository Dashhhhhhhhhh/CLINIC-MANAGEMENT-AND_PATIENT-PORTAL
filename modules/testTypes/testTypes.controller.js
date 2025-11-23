const {    
    createTestTypeService,
    getAllTestTypeService,
    getTestTypesByIdService,
    updateTestTypeService,
    toggleTestTypeStatusService 
} = require("./testTypes.service")

async function createTestTypeController(req, res) {
    try {

        const {
            test_type_name,
            description,
            active
        } = req.body

        const result = await createTestTypeService({test_type_name, description, active });

        if (!result.success) return res.status(400).json(result);

        return res.status(201).json(result);


  } catch (error) {
    console.error("Error creating test-type:", error.message);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);
    return res.status(500).json({
      success: false,
      error: "Server error while creating hematology result."
    });
  }
}

async function getAllTestTypeController(req, res) {
    try {

        const { active } = req.query;

        const result = await getAllTestTypeService(active);

        return res.status(200).json(result);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

async function getTestTypesByIdController(req, res) {
    try {

        const { test_type_id } = req.params;

        const result = await getTestTypesByIdService(test_type_id);

        if (!result.success) return res.status(404).json(result);
        
        return res.status(200).json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }   
}

async function updateTestTypeController(req, res) {
    try {

        const {test_type_id} = req.params;
        const updateField = req.body;

        const result = await updateTestTypeService(test_type_id, updateField);

        if(!result.success) return res.status(404).json(result);

        return res.status(200).json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }   
}

async function toggleTestTypeStatusController(req, res) {
    try {
    
        const { test_type_id } = req.params;
        const { active } = req.body;

        const result = await toggleTestTypeStatusService(test_type_id, active);

        if (!result.success) return res.status(404).json(result);

        return res.status(200).json(result);

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }   
}



module.exports = { 
    createTestTypeController,
    getAllTestTypeController,
    getTestTypesByIdController,
    updateTestTypeController,
    toggleTestTypeStatusController
};
