const { isValidUUID } = require("../utils/security");
const { Patient, createPatient, getAllPatients, getPatientById, updatePatient, togglePatientStatus} = require('../models/patientModel');

async function registerPatientController (req, res) { 
    try {

    const {
        first_name,
        middle_initial,
        last_name,
        birthdate,
        gender,
        building_number,
        street_name,
        barangay_subdivision,
        city_municipality,
        province,
        postal_code,
        country,
        contact_number,
        medical_history,
        condition
     } = req.body;

        const requiredFields = [
            'first_name',
            'last_name',
            'birthdate',
            'gender',
            'street_name',
            'city_municipality',
            'postal_code',
            'country'
        ];  
        
    const requiredField = {};

    for (const field of requiredFields) {
        const value = req.body[field]; 

        if ( value === undefined || value === null) {
            return res.status(400).json({ success: false, error: `${field} is required.`});
        }

        if (typeof value === `string`) {
            const trimmed = value.trim();
     

        if (trimmed === '') {
            return res.status(400).json({ success: false,  error: `${field} cannot be empty.` });
        }

        requiredField[field] = trimmed;
        }  
    }

        const optionalFields = [
            'middle_initial',
            'building_number',
            'barangay_subdivision',
            'province',
            'contact_number',
            'medical_history',
            'condition'
        ];


const optionalField = {};
    
        for (const field of optionalFields) {
            const value = req.body[field];

            if (value === undefined || value === null) {
                continue;
            }

                if (typeof value === 'string') {
                const trimmed = value.trim();
  
                if (trimmed === '') {
                    return res.status(400).json({ success: false, error: `${field} cannot be empty` });
                }

                optionalField[field] = trimmed;
            } else {
                optionalField[field] = value;
            }
        }  

        if (!requiredField.first_name) {
            return res.status(400).json({ success: false, error: "First name is required." });
        }
        if (requiredField.first_name.length < 2) {
            return res.status(400).json({ success: false, error: "First name must be at least 2 characters." });
        }
        if (requiredField.first_name.length > 50) {
            return res.status(400).json({ success: false, error: "First name must not exceed 50 characters." });
        }

        if (optionalField.middle_initial) {
            const raw = optionalField.middle_initial.trim().toUpperCase();
            const isValid = /^[A-Z]\.?$/.test(raw);

            if (!isValid) {
                return res.status(400).json({ error: "Invalid middle initial format." });
            }

            optionalField.middle_initial = raw;
        }

        if (!requiredField.last_name) {
            return res.status(400).json({ success: false, error: "Last name is required." });
        }
        if (requiredField.last_name.length < 2) {
            return res.status(400).json({ success: false, error: "Last name must be at least 2 characters." });
        }
        if (requiredField.last_name.length > 50) {
            return res.status(400).json({ success: false, error: "Last name must not exceed 50 characters." });
        }

        const isValidPostalCode = /^\d{4}$/.test(requiredField.postal_code);

        if (!isValidPostalCode) {
            return res.status(400).json({ error: "Postal code must be a 4-digit number." });
        }

        const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(requiredField.birthdate);
        const parsedDate = new Date(requiredField.birthdate);

        if (!isValidFormat ||(isNaN(parsedDate.getTime()))) {
            return res.status(400).json({ success: false, error: "Invalid input." });
        }

        const today = new Date();
            if (parsedDate > today) {
            return res.status(400).json({ success: false, error: "Birthdate cannot be in the future." });
        }

        const intlNum = /^\+639\d{9}$/;

        if(optionalField.contact_number) {
        if (optionalField.contact_number.startsWith('09')) {
            optionalField.contact_number = optionalField.contact_number.replace(/^09/, '+639');
        }
        if(!intlNum.test(optionalField.contact_number)) {
            return res.status(400).json({ success: false, error: "Invalid mobile number." });
        }
    }

        const allowedGender = ['male', 'female'];

        if (!allowedGender.includes(requiredField.gender.toLowerCase())) {
            return res.status(400).json({ success: false, error: "Invalid gender value."});
        }
        requiredField.gender = requiredField.gender.toLowerCase();


        if (optionalField.building_number) {
            const isValidBuildingNumber = /^[A-Za-z0-9]+$/.test(optionalField.building_number);

            if (!isValidBuildingNumber) {
                return res.status(400).json({ success: false, error: "Building number must be alphanumeric only." });
            }
        }

        if (optionalField.building_number) {
            if (optionalField.building_number.length > 10) {
                return res.status(400).json({ success: false, error: "Maximum Character is 10"});
            }
        }


        const isValidSubdivision = /^[A-Za-z0-9\- ]+$/.test(optionalField.barangay_subdivision);

        if (!isValidSubdivision) {
            return res.status(400).json({ success: false, error: "Subdivision must contain only letters, numbers, spaces, or dashes." });        
        }


        if (optionalField.barangay_subdivision) {
            if (optionalField.barangay_subdivision.length > 100) {
                return res.status(400).json({ success: false, error: "Subdivision must not exceed 100 characters." });
            }
        }
        
        const isValidProvince = /^[A-Za-z0-9 ]+$/.test(optionalField.province);

        if (!isValidProvince) {
            return res.status(400).json({ error: "Only letters, numbers, and spaces are allowed. No symbols." }); 
        }
        if (optionalField.province) {
            if (optionalField.province.length > 50) {
                return res.status(400).json({ success: false, error: "Province must not exceed 50 charachrers." });
            }
        }
        
        if (optionalField.medical_history) {
            if (optionalField.medical_history.length > 1000) {
                return res.status(400).json({ success: false, error: "Medical history must not exceed 1000 characters." });
            }
        }

        if (optionalField.conditions && typeof optionalField.conditions === "string") {
        try {
            optionalField.conditions = JSON.parse(optionalField.conditions);
        } catch (err) {
            return res.status(400).json({ success: false, error: "Invalid conditions format" });
        }
}


        const isValidCountry =  /^[A-Za-z '-]+$/.test(requiredField.country);
        if (!isValidCountry) {
            return res.status(400).json({ success: false, error: "Country name must contain only letters and spaces. No numbers or symbols allowed." });
        }

        const patient = await createPatient({
            ...requiredField,
            ...optionalField,
            active: true,
        });

    const newPatient = patient.get({ plain: true });

    return res.status(201).json({
    success: true,
    message: "Patient registered successfully",
    patient: newPatient,
    }); 

    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, error: "Internal server error" });
    }    
}

async function getAllPatientsController(req, res) {
  try {
    const { active } = req.query;

    const parsedActive =
      active === "true" ? true :
      active === "false" ? false :
      undefined;

    const patients = await getAllPatients(parsedActive);

    if (patients.length === 0) {
        return res.status(404).json({ 
            success: false, 
            message: "No patients found." 
        });
    }

    return res.status(200).json({
      success: true,
      count: patients.length,
      patients,
    });


  } catch (err) {
    console.error("Error fetching patients:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getPatientByIdController (req, res) {
    try {

        const { id } = req.params;

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }
    
    const patient = await getPatientById(id);

    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient not found" });
    }

    const normalizePatient = patient.toJSON ? patient.toJSON() : patient;


    return res.status(200).json({
        success: true,
        message: "Patient retrieved successfully",
        count: 1,
        patient: normalizePatient,
    });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }   
}

async function updatePatientController (req, res) {
    try{

        const { id } = req.params;

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

        const allowedFields = [
            'first_name', 'middle_initial', 'last_name', 'birthdate', 'gender',
            'building_number', 'street_name', 'barangay_subdivision', 'city_municipality',
            'province', 'postal_code', 'country', 'contact_number', 'medical_history'
        ];

        const update = {}

        for (const key of allowedFields) {
            let value = req.body[key];

            if (value === undefined || value === null) continue;

            if (typeof value === 'string') {
                let trimmed = value.trim();
                let normalized = trimmed === "" ? null : trimmed;

        if (key === "first_name") {
            if (normalized.length < 2) {
                return res.status(400).json({ success: false, error: "First name must be at least 2 characters." });
            }
            if (normalized.length > 50) {
                return res.status(400).json({ success: false, error: "First name must not exceed 50 characters." });
            }
            }

        if (key === "middle_initial" && normalized && normalized.length !== 1) {
            return res.status(400).json({ success: false, error: "Middle initial must be exactly one character." });
            }

            
        if (key === "last_name") {
            if (normalized.length < 2) {
                return res.status(400).json({ success: false, error: "Last name must be at least 2 characters." });
            }
            if (normalized.length > 50) {
                return res.status(400).json({ success: false, error: "Last name must not exceed 50 characters." });
            }
        }

        if (key === "birthdate") {
      
        
        const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(normalized);
        const parsedDate = new Date(normalized);

        if (!isValidFormat ||(isNaN(parsedDate.getTime()))) {
            return res.status(400).json({ success: false, error: "Invalid input." });
            }    

            const today = new Date();
                if (parsedDate > today) {
                return res.status(400).json({ success: false, error: "Birthdate cannot be in the future." });
            }
        }

        if (key === "contact_number") {
          if (normalized.startsWith("09")) normalized = normalized.replace(/^09/, "+639");
          const intlNum = /^\+639\d{9}$/;
          if (!intlNum.test(normalized)) return res.status(400).json({ success: false, error: "Invalid mobile number." });
        }

        if (key === "building_number") {
        const isValidBuildingNumber = /^[A-Za-z0-9]+$/.test(normalized);

        if (!isValidBuildingNumber) {
            return res.status(400).json({ success: false, error: "Building number must be alphanumeric only." });
        }

            if (normalized.length > 10) {
                return res.status(400).json({ success: false, error: "Maximum Character is 10"})
            }
        }
        
        if (key === "barangay_subdivision") {
        const isValidSubdivision = /^[A-Za-z0-9\- ]+$/.test(normalized);

            if (!isValidSubdivision) {
                return res.status(400).json({ success: false, error: "Subdivision must contain only letters, numbers, spaces, or dashes." });        
            }
            if (normalized.length > 100) {
            return res.status(400).json({ success: false, error: "Subdivision must not exceed 100 characters." });
            }
        }

        if (key === "province") {
        const isValidProvince = /^[A-Za-z0-9 ]+$/.test(normalized);

            if (!isValidProvince) {
                return res.status(400).json({ error: "Only letters, numbers, and spaces are allowed. No symbols." }); 
            }
            if (normalized.length > 50) {
                return res.status(400).json({ success: false, error: "Province must not exceed 50 charachrers." });
            }
        }

        if (key === "country") {
            const isValidCountry = /^[A-Za-z '-]+$/.test(normalized);
            if (!isValidCountry) {
                return res.status(400).json({
                    success: false,
                    error: "Country name must contain only letters, spaces, apostrophes, or hyphens. No numbers or other symbols allowed."
                });
            }
        }
        if (key == "postal_code") {

        const isValidPostalCode = /^\d{4}$/.test(normalized);
            if (!isValidPostalCode) {
                return res.status(400).json({ error: "Postal code must be a 4-digit number." });
            }
        }

        if (key === "medical_history") {
            if (normalized.length > 1000) {
                return res.status(400).json({ success: false, error: "Medical history must not exceed 1000 characters." });
            }
        }


            update[key] = normalized;
        } else if (typeof value === 'number') {
            update[key] = value;
        } else {
            return res.status(400).json({ success: false, error: `${key} has an invalid type.` });
        }
    }


            update.middle_initial = update.middle_initial ?? null;
            update.building_number = update.building_number ?? null;
            update.barangay_subdivision = update.barangay_subdivision ?? null;
            update.province = update.province  ?? null;
            update.contact_number = update.contact_number ?? null;
            update.medical_history = update.medical_history ?? null;



        if (Object.keys(update).length === 0) {
            return res.status(400).json({ success: false, error: "No fields provided to update" });
        }

        const updatedPatient = await updatePatient(id, update);

        if (!updatedPatient) {
            return res.status(404).json({ success: false, error: "Patient not found" });
        }
        res.status(200).json({ success: true, message: "Patient updated successfully.", patient: updatedPatient });

        } catch (err) {
            console.error(err);
            res.status(500).json({ success: false, error: "Internal server error" });
        }   
    }

async function togglePatientStatusController(req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    if (typeof active !== "boolean") {
      return res.status(400).json({ success: false, error: "Active status must be boolean." });
    }

    const patient = await togglePatientStatus(id, active);

    if (!patient) {
      return res.status(404).json({ success: false, error: "Patient not found." });
    }

    return res.status(200).json({
      success: true,
      message: patient.active ? "Patient reactivated." : "Patient deactivated.",
      patient,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = {
    registerPatientController,
    getPatientByIdController,
    getAllPatientsController,
    updatePatientController,
    togglePatientStatusController
};