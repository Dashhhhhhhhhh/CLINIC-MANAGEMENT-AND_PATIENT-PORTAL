const { isValidUUID } = require("../utils/security");
const { TestTypes, createTestTypes, getAllTestTypes, getTestTypesById, updateTestTypesModel, toggleTestTypesStatus } = require("../models/testTypesModel");

async function createTestTypeController(req, res) {
    try {

        const { test_type_name, description, active } = req.body;

        if (!test_type_name || test_type_name.length < 2 || test_type_name.length > 100) {
           return res.status(400).json({ success: false, message: "Test type name must be between 2 and 100 characters." });
        }
        const cleanedTestType = test_type_name.trim().toLowerCase();

        const regexTypeName = /^[A-Za-z0-9\s\-()]+$/;

        if (!regexTypeName.test(cleanedTestType)) {
            return res.status(400).json({ success: false, message: "Test type name contains invalid characters." });
        }


        const existingName = await TestTypes.findOne({ where: { test_type_name: cleanedTestType } });
        
        if (existingName) {
            return res.status(409).json({ message: "Test type already exists." });
        }

        const newTestype = await TestTypes.create({
            test_type_name: cleanedTestType,
            description: description
        });

        return res.status(201).json({
            success: true,
            message: "Test type created successfully",
            data: newTestype
        });

  } catch (error) {
    console.error("Error creating result:", error.message);
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

        const parsedActive = 
            active === "true" ? true :
            active === "false" ? false : undefined;

        const testTypes = await getAllTestTypes(parsedActive);

        return res.status(200).json({
            success: true,
            message: "Test types retrieved successfully.",
            count: testTypes.length,
            data: testTypes
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

async function getTestTypesByIdController(req, res) {
    try {

    const { id } = req.params;
        

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }
        
        const result = await getTestTypesById(id);

        if (!result) {
            return res.status(404).json({ success: false, error: "Test type not found"});  

        } else {
            res.status(200).json({ success: true, specialization: result });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }   
}

async function updateTestTypeController(req, res) {
    try {


    const { id } = req.params;
    const update = {};

    const regexTypeName = /^[A-Za-z0-9\s\-()]+$/;

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }
    
    const allowedFields = ['test_type_name', 'description', 'active'];

    for (const key of allowedFields) {
        const value = req.body[key];

        if (value === undefined || value === null) continue;

        if (typeof value === "string") {
            const trimmed = value.trim().toLowerCase();

        if (key === 'test_type_name' && (trimmed.length < 2 || trimmed.length > 100))  {
            return res.status(400).json({ success: false, message: "Test type name must be between 2 and 100 characters." });
        }
        
        if (key === 'test_type_name' && !regexTypeName.test(trimmed)) {
            return res.status(400).json({ success: false, message: "Test type name contains invalid characters." });
        }

        if (key === 'active') {
        const lower = trimmed.toLowerCase();
            if (lower !== 'true' && lower !== 'false') {
                return res.status(400).json({ success: false, error: "Invalid value for active. Must be true or false." });
             }
            update[key] = lower === 'true';
                continue;
            }        
        update[key] = trimmed;

        update[key] = trimmed;
            } else if (typeof value === 'boolean' && key === 'active') {
                update[key] = value;
        } else {
            return res.status(400).json({ success: false, error: `${key} has an invalid type.` });
        }
    }

    if (Object.keys(update).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update" });
    }

    const testTypes = await updateTestTypesModel(id, update);

    if (!testTypes) {
        return res.status(404).json({ success: false, error: "Test type not found" });
    }

    return res.status(200).json({ success: true, testTypes: testTypes });

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }   
}

async function toggleTestTypeStatusController(req, res) {
    try {
    
        const { id } = req.params;
        const { active } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ success: false, error: "Invalid UUID" });
        }

        if (typeof active !== "boolean") {
            return res.status(400).json({ success: false, error: "Active status must be boolean." });
        }

        const testTypes = await toggleTestTypesStatus(id, active);

        if (!testTypes) {
            return res.status(404).json({ success: false, error: "Test type not found" });
        }

        return res.status(200).json({
            success: true,
            message: testTypes.active
                ? "Test type reactivated."
                : "Test type deactivated.",
            data: testTypes,
        });

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
