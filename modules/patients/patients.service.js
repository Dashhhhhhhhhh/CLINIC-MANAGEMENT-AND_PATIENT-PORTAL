const { isValidUUID } = require("../../utils/security");
const { Patient, createPatient, getAllPatients, getPatientById, updatePatient, togglePatientStatus} = require("../patients/patients.model");
const { User } = require("../users/user.model"); 
const { getAvailableUsersByModel } = require("../../utils/helpers/getAvailableUsers");

async function registerPatientService(
    user_id,
    patient_id,
    first_name,
    middle_initial,
    last_name,
    birthdate,
    contact_number,
    medical_history,
    conditions,
    building_number,
    street_name,
    barangay_subdivision,
    city_municipality,
    province,
    postal_code,
    country,
    active,
)


{


console.log("SERVICE DATA:", {
    street_name,
    barangay_subdivision,
    building_number,
    city_municipality,
    country
});

        const update = {};

        const data = {
                user_id,
                patient_id,
                first_name,
                middle_initial,
                last_name,
                birthdate,
                contact_number,
                medical_history,
                conditions,
                building_number,
                street_name,
                barangay_subdivision,
                city_municipality,
                province,
                postal_code,
                country,
                active
        };

        for (const key of Object.keys(data)) {
            let value = data[key];
            if (value === undefined || value === null) continue;

            let trimmed;

            if (typeof value === 'string') {
            trimmed = value.trim();
            } else if (typeof value === 'number') {
                if (isNaN(value) || value < 0) continue;
                trimmed = value;
            } else if (typeof value === 'boolean') {
            trimmed = value;
            } else {
                continue;
            }

            update[key] = trimmed;
        }

        const requiredFields = [
            "user_id",
            "first_name",
            "last_name",
            "birthdate",
            "street_name",
            "city_municipality",
            "postal_code",
            "country"
        ];

        for (const field of requiredFields) {
            if (!update[field]) {
                return { success: false, message: `Missing required field: ${field}`};
            }
        }

        console.log("UPDATE OBJECT >>>", update);

    if (!isValidUUID(update.user_id)) {
        return { success: false, message: "Invalid user_id format." };
    }

    if (update.first_name.length < 2 || update.first_name.length > 50) {
      return { success: false, message: "First name must be between 2 and 50 characters." };
    }

    if (update.middle_initial && update.middle_initial.length !== 1) {
      return { success: false, message: "Middle initial must be exactly one character." };
    }

    if (update.last_name.length < 2 || update.last_name.length > 50) {
      return { success: false, message: "Last name must be between 2 and 50 characters." };
    }

        let parsedDate;
        if (update.birthdate) {
        const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(update.birthdate);
        parsedDate = new Date(update.birthdate);

        if (!isValidFormat ||(isNaN(parsedDate.getTime()))) {
            return { success: false, error: "Invalid input." };
        }
    }

    let formattedContact = null;
    if (update.contact_number) {
      let trimmed = update.contact_number.trim();
      if (trimmed.startsWith("09")) {
        trimmed = trimmed.replace(/^09/, "+639");
      }
      const intlNum = /^\+639\d{9}$/;
      if (!intlNum.test(trimmed)) {
        return { success: false, message: "Invalid mobile number." };
      }
      formattedContact = trimmed;
    }

    if (update.medical_history !== undefined) {
        if(update.medical_history === null || update.medical_history === "" ) {
            update.medical_history = null;
        } else if (typeof update.medical_history === "string") {
            update.medical_history = update.medical_history.trim();
        }
        if ( update.medical_history && update.medical_history.length > 1000) {
            return {success: false, error: "Medical history must not exceed 1000 characters." };
        }
    }

if (conditions !== undefined) {
    if (conditions === null || conditions === "") {
        conditions = [];
    } else if (typeof conditions === "string") {
        try {
            const parsed = conditions
                .split(",")
                .map(c => c.trim())
                .filter(Boolean);

            conditions = parsed; // overwrite
        } catch {
            return { success: false, message: "Invalid condition format." };
        }
    }
}

update.conditions = conditions;    if (update.building_number) {
            const isValidBuildingNumber = /^[A-Za-z0-9\s\-\/]+$/.test(update.building_number);

            if (!isValidBuildingNumber) {
                return { success: false, error: "Building number must be alphanumeric only." };
            }
        }

    if (update.street_name.length < 2 || update.street_name.length > 50) {
      return { success: false, message: "Street name must be between 2 and 50 characters." };
    }

        if (update.barangay_subdivision) {
            if (update.barangay_subdivision.length > 100) {
                return { success: false, error: "Subdivision must not exceed 100 characters." };
            }
        }

        const isValidCityMunicipality =  /^[A-Za-z '-]+$/.test(update.city_municipality);
        if (!isValidCityMunicipality) {
            return { success: false, error: "City municipality must contain only letters and spaces. No numbers or symbols allowed." };
        }

        if (update.province) {
            const isValidProvince = /^[A-Za-z0-9 ]+$/.test(update.province);
            if (!isValidProvince) {
                return { error: "Only letters, numbers, and spaces are allowed. No symbols." }; 
            }
        }

        if (update.postal_code) {
            const isValidPostalCode =/^[0-9]{4}$/.test(update.postal_code);
            if (!isValidPostalCode) {
                return { error: "Postal code must be a 4-digit number." };
            }
        }

        if (update.country) { 
            const isValidCountry =  /^[A-Za-z '-]+$/.test(update.country);
            if (!isValidCountry) {
                return { success: false, error: "Country name must contain only letters and spaces. No numbers or symbols allowed." };
            }
        }

    let isActive = true;
    if (update.active !== undefined) {
      if (update.active === true || update.active === "true") isActive = true;
      else if (update.active === false || update.active === "false") isActive = false;
      else return { success: false, message: "Active must be true or false." };
    }

    const userLinked = await Patient.findOne({ where: { user_id } });
    if (userLinked) return { success: false, message: "This user is already linked to a patient." };


    const existingPatient = await Patient.findOne({ where: { first_name: update.first_name, last_name: update.last_name, birthdate: parsedDate }} );

    if(existingPatient) return { success: false, message: "Patient already exsist." };

    const patient = await createPatient({
        user_id: update.user_id,
        patient_id,
        first_name: update.first_name,
        middle_initial: update.middle_initial,
        last_name: update.last_name,
        birthdate: parsedDate,
        contact_number: formattedContact,
        medical_history: update.medical_history,
        conditions: update.conditions,
        building_number: update.building_number,
        street_name: update.street_name,
        barangay_subdivision: update.barangay_subdivision,
        city_municipality: update.city_municipality,
        province: update.province,
        postal_code: update.postal_code,
        country: update.country,
        active: isActive
    });


    return {
        success: true,
        message: "Patient created successfully.",
        patient
    };
 
}   

async function getAllPatientsService(active) {

    const whereClause = {};

    if (active !== undefined) whereClause.active = active;

    const result = await Patient.findAll({
        where: whereClause,
        attributes:[
            "patient_id",
            "first_name",
            "middle_initial",
            "last_name",
            "birthdate",
            "contact_number",
            "medical_history",
            "conditions",
            "building_number",
            "street_name",
            "barangay_subdivision",
            "city_municipality",
            "province",
            "postal_code",
            "country",
            "active"
        ],
        include: [
            {
                model: User,
                as: "user",
                attributes: ["gender", "email"],
            },
        ],
    });

    return {
        success: true,
        count: result.length,
        patient: result.map(patients => patients.get({ plain: true}))
    };
}

async function getPatientByIdService(patient_id) {

        if (!isValidUUID(patient_id)) {
            return { success: false, message: "Invalid patient id." };
        }

        const patient = await Patient.findByPk(patient_id, {
            include: [
            {
                model: User,
                as: "user",
                attributes: ["gender", "email", "username"],
            },
        ],
        });

        if (!patient) return { success: true, message: "Patient not found" };

        return {
            success: true,
            patient: patient.get({ plain: true })
        };
   
}

async function updatePatientService(patient_id, updateField) {

        if (!isValidUUID(patient_id)) {
            return { success: false, message: "Invalid patient id." };
        }

        const existingPatient = await Patient.findOne({ where: { patient_id: patient_id }});

        if (!existingPatient) return { success: false, message: "Patient not found." };

        const update = {};

        const allowedField = [
            "patient_id",
            "first_name",
            "middle_initial",
            "last_name",
            "birthdate",
            "contact_number",
            "medical_history",
            "conditions",
            "building_number",
            "street_name",
            "barangay_subdivision",
            "city_municipality",
            "province",
            "postal_code",
            "country",
            "active"
        ];


     for (const field of allowedField) {
        let value = updateField[field];
        if (value === null || value === undefined) continue;

        let trimmed;

        if (typeof value === 'string'){
            trimmed = value.trim();
        } else if (typeof value === 'number') {
            if(isNaN(value) || value < 0) continue;
        } else if (typeof value === 'boolean') {
            trimmed = value;
        } else {
            continue;
        }

        update[field] = trimmed;
    }

        if (update.first_name && (update.first_name.length < 2 || update.first_name.length > 50)) {
            return { 
                success: false,
                error: "First name must be between 2 and 50 characters."
            };
        }

        if (update.middle_initial && update.middle_initial.length !== 1) return { success: false, message: "Middle initial must be exactly one character." };
        
        if (update.last_name && (update.last_name.length < 2 || update.last_name.length > 50)) {
            return {
                success: false,
                message: "Last name must be between 2 and 50 characters."
            }; 
        }

        if (update.birthdate) {
        const isValidFormat = /^\d{4}-\d{2}-\d{2}$/.test(update.birthdate);
        const parsedDate = new Date(update.birthdate);

        if (!isValidFormat ||(isNaN(parsedDate.getTime()))) {
            return { success: false, message: "Invalid input." };
        }
    }

        if (update.contact_number) {
        let contact = update.contact_number.trim();
          if (contact.startsWith("09")) {
            contact = contact.replace(/^09/, "+639");
          }
          const intlNum = /^\+639\d{9}$/;
          if (!intlNum.test(contact)) {
            return { success: false, message: "Invalid mobile number." };
          }
          update.contact_number = contact;
        }


        if (update.medical_history) {
            if (update.medical_history.length > 1000) {
                return {success: false, message: "Medical history must not exceed 1000 characters." };
            }
        }

if (update.conditions !== undefined) {
    if (Array.isArray(update.conditions)) {
        // Already an array → leave as is
    } 
    else if (typeof update.conditions === "string") {

        // If empty string → convert to empty array
        if (update.conditions.trim() === "") {
            update.conditions = [];
        } 
        else {
            try {
                // Try parsing as JSON string
                const parsed = JSON.parse(update.conditions);

                if (!Array.isArray(parsed)) {
                    return { success: false, message: "Conditions must be an array" };
                }

                update.conditions = parsed;
            } catch {
                // If NOT valid JSON, treat as comma-separated list
                update.conditions = update.conditions
                    .split(",")
                    .map(c => c.trim())
                    .filter(Boolean);
            }
        }
    }
}

    if (update.building_number) {
            const isValidBuildingNumber = /^[A-Za-z0-9]+$/.test(update.building_number);

            if (!isValidBuildingNumber) {
                return { success: false, message: "Building number must be alphanumeric only." };
            }
        }

    if (update.street_name.length < 2 || update.street_name.length > 50) {
      return { success: false, message: "Street name must be between 2 and 50 characters." };
    }

        if (update.barangay_subdivision) {
            if (update.barangay_subdivision.length > 100) {
                return { success: false, message: "Subdivision must not exceed 100 characters." };
            }
        }

        if (update.city_municipality) {
            const isValidCityMunicipality =  /^[A-Za-z '-]+$/.test(update.city_municipality);
            if (!isValidCityMunicipality) {
                return { success: false, message: "City municipality must contain only letters and spaces. No numbers or symbols allowed." };
            }
        }

        if (update.province) {
            const isValidProvince = /^[A-Za-z0-9 ]+$/.test(update.province);
            if (!isValidProvince) {
                return { message: "Only letters, numbers, and spaces are allowed. No symbols." }; 
            }
        }

        if (update.postal_code) {
            const isValidPostalCode = /^[0-9]*$/.test(update.postal_code);
            if (!isValidPostalCode) {
                return { message: "Postal code must be a 4-digit number." };
            }
        }

        if (update.country) { 
            const isValidCountry =  /^[A-Za-z '-]+$/.test(update.country);
            if (!isValidCountry) {
                return { success: false, message: "Country name must contain only letters and spaces. No numbers or symbols allowed." };
            }
        }

        if (!update || Object.keys(update).length === 0) return { success: false, message: "No fields provided to update" };


        const updatePatient = await Patient.update(update, {
            where: { patient_id: patient_id }
        });

        const refreshPatient = await Patient.findOne({ where: { patient_id: patient_id }});

        return {
            success: true,
            message: "Patient updated successfully",
            updatePatient: refreshPatient.get({ plain: true })
        };

}

async function togglePatientStatusService(patient_id, active) {

    if (!isValidUUID(patient_id)) return ({ success: false, message: "Invalid patient id." });

    const patient = await Patient.findOne({ where: { patient_id}});

    if (!patient) return {success: false, message: "Patient not found." };

    if (patient.active === active) {
        return {
            success: false,
            message: active
                ? "Patient is already active"
                : "Patient is already inactive"
        }
    };

    patient.active = !patient.active;
    await patient.save();

    return {
        success: true,
        message: patient.active
            ? "Patient activated successfully."
            : "Patient deactivated successfully.",
        patient: patient.get({ plain: true })
    };

}

async function getAvailablePatientsUsersService() {
    return await getAvailableUsersByModel(Patient);
}

module.exports = {
    registerPatientService, 
    getAllPatientsService,
    getPatientByIdService,
    updatePatientService,
    togglePatientStatusService,
    getAvailablePatientsUsersService
};