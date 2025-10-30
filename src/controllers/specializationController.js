const express = require('express');
const pool = require('../db');
const router = express.Router();
const { isValidUUID } = require("../utils/security");
const { specialization, createSpecialization, getAllSpecialization, getSpecializationById, updateSpecialization, toggleSpecializationStatus } = require("../models/specializationModel");



async function createSpecializationController(req, res) {
  try {
    const { specialization_name, description } = req.body;

    const sNameRegex = /^[a-zA-Z\s'-]+$/;

    if (!specialization_name || !specialization_name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Specialization name is required."
      });
    }

    const cleanedSpecializationName = specialization_name.trim().toLowerCase();
    const cleanedDescription = description ? description.trim() : null;

    if (cleanedSpecializationName.length < 2 ) {
        return res.status(400).json({ success: false, error: "Specialization name must be atleat 2 characters." });
    }

    if (!sNameRegex.test(cleanedSpecializationName)) {
        return res.status(400).json({ success: false, error: "Specialization name can only contain letters, spaces, hyphens (-), and apostrophes (')."});
    }

    if (cleanedDescription && cleanedDescription.length > 255) {
        return res.status(400).json({ success: false, error: "Description must not exceed 255 characters."});
    }

    console.log(req.body);

    const specialization = await createSpecialization({
      specialization_name: cleanedSpecializationName,
      description: cleanedDescription,
    });

    return res.status(201).json({
      success: true,
      message: "Specialization created successfully.",
      specialization
    });


  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getAllSpecializationController(req, res) {
    try {

        const { active } = req.query;

      
        const parsedActive = 
            active === "true" ? true :
            active === "false" ? false : undefined;

        const specializations = await getAllSpecialization(parsedActive);

        return res.status(200).json({ success: true, message :"Specialization retrieved successfull.", count: specializations.length, data: specialization });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}

async function getSpecializationByIdController(req, res) {
    try {

        const { id } = req.params;
        

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }
        
        const result = await getSpecializationById(id);

        if (!result) {
            return res.status(404).json({ success: false, error: "Specialization not found"});  

        } else {
            res.status(200).json({ success: true, specialization: result });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }   
}

async function updateSpecializataionController (req, res) {
    try {

        const { id } = req.params;
        const update = {};

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const allowedFields = ['specialization_name', 'description', 'active'];
    const sNameRegex = /^[a-zA-Z\s'-]+$/;

    for (const key of allowedFields) {
        const value = req.body[key];

        if (value === undefined || value === null) {
            continue;
        }
  
        if (typeof value === 'string') {
                const trimmed = value.trim().toLowerCase();

        if (key === 'specialization_name' && trimmed.length < 2) {
            return res.status(400).json({ success: false, error: "Specialization name must be atleat 2 characters." });
        }

        if (key === 'specialization_name' && !sNameRegex.test(trimmed)) {
            return res.status(400).json({ success: false, errors: "Specialization name can only contain letters, spaces, hyphens (-), and apostrophes (')."});
        }

        if (key === 'description' && trimmed.length > 255) {
            return res.status(400).json({ success: false, error: "Description must not exceed 255 characters."});
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
            } else if (typeof value === 'boolean' && key === 'active') {
                update[key] = value;
        } else {
            return res.status(400).json({ success: false, error: `${key} has an invalid type.` });
        }
    }

    if (Object.keys(update).length === 0) {
        return res.status(400).json({ success: false, error: "No fields to update" });
    }
    
    const specialization = await updateSpecialization(id, update);
    
    if (!specialization) {
        return res.status(404).json({ success: false, error: "Specialization not found" });
    }
    
    return res.status(200).json({ success: true, specialization: specialization });
    
            
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }   
}

async function toggleSpecializationStatusController(req, res) {
    try {
        const { id } = req.params;
        const { active } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ success: false, error: "Invalid UUID" });
        }

        if (typeof active !== "boolean") {
            return res.status(400).json({ success: false, error: "Active status must be boolean." });
        }

        const specialization = await toggleSpecializationStatus(id, active);

        if (!specialization) {
            return res.status(404).json({ success: false, error: "Specialization not found." });
        }

        return res.status(200).json({
            success: true,
            message: specialization.active 
                ? "Specialization reactivated." 
                : "Specialization deactivated.",
            specialization,
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}




module.exports = { 
    createSpecializationController,
    getAllSpecializationController,
    getSpecializationByIdController,
    updateSpecializataionController,
    toggleSpecializationStatusController
};