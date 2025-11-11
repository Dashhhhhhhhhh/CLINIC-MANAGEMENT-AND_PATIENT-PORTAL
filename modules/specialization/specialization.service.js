const { where } = require("sequelize");
const { isValidUUID } = require("../../utils/security");
const { Specialization, createSpecialization, getAllSpecialization, getSpecializationById, updateSpecialization, toggleSpecializationStatus } = require("./specialization.model");


async function createSpecializationService (specialization_name, description, active) {

    const sNameRegex = /^[a-zA-Z\s'-]+$/;

    if (!specialization_name || !specialization_name.trim()) {
      return {
        success: false,
        error: "Specialization name is required."
      };
    }

    const cleanedSpecializationName = specialization_name.trim().toLowerCase();
    const cleanedDescription = description ? description.trim() : null;

    if (cleanedSpecializationName.length < 2 || cleanedSpecializationName.length > 25 ) {
        return{ success: false, error: "Specialization name must be atleat 2 characters." };
    }

    if (!sNameRegex.test(cleanedSpecializationName)) {
        return { success: false, error: "Specialization name can only contain letters, spaces, hyphens (-), and apostrophes (')."};
    }

    if (cleanedDescription && cleanedDescription.length > 255) {
        return { success: false, error: "Description must not exceed 255 characters."};
    }

    let isActive = true;
    if (active !== undefined) {
      if (active === true || active === "true") isActive = true;
      else if (active === false || active === "false") isActive = false;
      else return { success: false, message: "Active must be true or false." };
    }

    const existingSpecialization = await Specialization.findOne({
         where: { specialization_name: cleanedSpecializationName }} 
        );

    if (existingSpecialization) return { success: false, message: "Specialization already exists" };

    const specialization = await createSpecialization({
        specialization_name: cleanedSpecializationName,
        description: cleanedDescription,
        isActive
    });

    const newSpecialization = specialization.get ? specialization.get({ plain: true }) :specialization

    return {
        success: true,
        message: "specialization created successfully",
        specialization: newSpecialization
    }

}

async function getAllSpecializationService (active) {

    const whereClause = {};

    if (active !== undefined) whereClause.active = active;

    const result = await Specialization.findAll({
        where: whereClause,
        attributes: [
            "specialization_id",
            "specialization_name",
            "description",
            "active"
        ],
    });

    return {
        success: true,
        message: result.length,
        specialization: result.map(special => special.get({ plain: true}))  
    };
}

async function getSpecializationByIdService(specialization_id) {

    if (!isValidUUID(specialization_id)) return { success: false, message: "Invalid specialization id." };

    const specialization = await Specialization.findByPk(specialization_id,);

    if (!specialization) return { success: false, message: "Specialization not found."};

    return {
        success: true,
        specialization: specialization.get({ plain: true }) 
    };
}

async function updateSpecializationService(specialization_id, updateField) {
        
    if (!isValidUUID(specialization_id)) return { success: false, message: "Invalid specialization id." };

    const existingSpecialization = await Specialization.findOne({ wherre: { specialization_id} });

    if (!existingSpecialization) return { success: false, message: "Specialization not found." };

    const update = {};

    const allowedFields = [
        "specialization_name",
        "description"
    ];

    for (const field of allowedFields) {
        let value = updateField[field];
        if (value === null || value === undefined) continue;

        let trimmed;

        if (typeof value === 'string') {
            trimmed = value.trim();
        } else if (typeof value === 'number') {
            if(isNaN(value) || value < 0) continue;
        } else if(typeof value === 'boolean') {
            trimmed = value;
        } else {
            continue
        }

        update[field] = trimmed;
    }

        if (update.specialization_name) {
            if (update.specialization_name.length < 2 || update.specialization_name.length > 20) {
                return { success: false, message: "Specialization name must be between 2 and 20 characters." };
            }
        }

        if (update.description) {
            if (update.description.length < 5 || update.description.length > 255) {
                return { success: false, message: "Description must be between 5 and 255 characters." };
            }
        }

    if (!update || Object.keys(update).length === 0) return { success: false, message: "No fields provided to update" };
   
    const specialization = await Specialization.update(update, {
        where: { specialization_id: specialization_id }
    });

    const refreshSpecialization = await Specialization.findOne({ where: {specialization_id: specialization_id}} );

    return {
        success:true,
        message: "Specialization updated successfully.",
        specialization: refreshSpecialization
    };
}

async function toggleSpecializationStatusService (specialization_id, active) {
    
    if (!isValidUUID(specialization_id)) return ({ success: false, message: "Invalid specialization id." });

    const specialization = await Specialization.findOne({ where: { specialization_id: specialization_id}} );

    if (!specialization) return {success: false, message: "specialization not found." };

    if (specialization.active === active) {
        return {
            success: false,
            message: active
                ? "Specialization is already active"
                : "Specialization is alreadyinactive"
        }
    };

    specialization.active = !specialization.active;
    await specialization.save();

    return {
        success: true,
        message: specialization.active ? "Specialization activated." : "Specialization deactivated.",
        specialization: specialization.get({ plain: true }),
    };
 }

async function getSpecializationService() {
    
    const existingSpecialization = await Specialization.findAll();
    
    return {
        success: true,
        specialization: existingSpecialization
    }
}


module.exports = {
    createSpecializationService,
    getAllSpecializationService,
    getSpecializationByIdService,
    updateSpecializationService,
    toggleSpecializationStatusService,
    getSpecializationService
};