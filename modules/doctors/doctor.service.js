const { isValidUUID } = require("../../utils/security");
const { Doctor, createDoctor, getAllDoctors, getDoctorById, updateDoctor, toggleDoctorStatus } = require("../doctors/doctor.model");
const { User } = require("../users/user.model");
const { Specialization } = require("../specialization/specialization.model");
const { Result } = require("pg");

async function registerDoctorService(user_id, first_name, middle_initial, last_name, license_number, contact_number, specialization_id, active) {

    if(!user_id || !first_name || !last_name || !license_number || !specialization_id ) {
        return { success: false, message: "Please provide all required fields (user_id, first_name, last_name, license_number, specialization_id)." };
    }

    if (!isValidUUID(user_id)) {
        return { success: false, message: "Invalid user id format." };
    }
    if (!isValidUUID(specialization_id)) {
        return { success: false, message: "Invalid specialization id format." };
    }

    if (first_name.length < 2 || first_name.length > 50) {
      return { success: false, message: "First name must be between 2 and 50 characters." };
    }

    if (middle_initial && middle_initial.length !== 1) {
      return { success: false, message: "Middle initial must be exactly one character." };
    }

    if (last_name.length < 2 || last_name.length > 50) {
      return { success: false, message: "Last name must be between 2 and 50 characters." };
    }

    const isValidPRC = /^\d{7}$/.test(license_number);
    if (!isValidPRC) {
      return {
        success: false,
        message: "License number must be a 7-digit numeric value.",
      };
    }

    const user = await User.findByPk(user_id);

    if (!user) {
      return  {success: false, message: "User not found." };
    }

    const specialization = await Specialization.findOne({
      where: { specialization_id, active: true },
    });
    
    if (!specialization) {
      return { success: false, message: "Invalid specialization ID." };
    }

    let formattedContact = null;
    if (contact_number) {
      let trimmed = contact_number.trim();
      if (trimmed.startsWith("09")) {
        trimmed = trimmed.replace(/^09/, "+639");
      }
      const intlNum = /^\+639\d{9}$/;
      if (!intlNum.test(trimmed)) {
        return { success: false, message: "Invalid mobile number." };
      }
      formattedContact = trimmed;
    }

    let isActive = true;
    if (active !== undefined) {
      if (active === true || active === "true") isActive = true;
      else if (active === false || active === "false") isActive = false;
      else return { success: false, message: "Active must be true or false." };
    }


    const existingDoctor = await Doctor.findOne({ where: { user_id } });

    if (existingDoctor) {
        return { success: false, message: "Doctor already registered for this user." };
    }

    const doctor = await createDoctor({
      user_id,
      first_name,
      middle_initial: middle_initial || null,
      last_name,
      license_number,
      contact_number: formattedContact,
      specialization_id,
      active: isActive,
    });

    const newDoctor = doctor.get ? doctor.get({ plain: true }) : doctor;

        return {
            success: true,
            message: "Doctor created successfully",
            doctor: newDoctor
        };
}

async function getAllDoctorService (active, specialization_id) {

    const whereClause = {};

    if (active !== undefined) whereClause.active = active;
    if (specialization_id !== undefined) whereClause.specialization_id = specialization_id;

    const result = await Doctor.findAll({
        where: whereClause,
        attributes: [
            "doctor_id",
            "first_name",
            "middle_initial",
            "last_name",
            "license_number",
            "contact_number",
            "user_id",
            "active"
        ],
        include: [
            {
                model: Specialization,
                as: "specialization",
                attributes: ["specialization_id", "specialization_name"]
            },
            {
                model: User,
                as: "user",
                attributes: ["id", "email", "username", "gender"]
            },
        ],
    });

    return { 
        success: true,
        count: result.length, 
        doctor: result.map(doc => doc.get({ plain: true })) 
    };
}
async function getDoctorByIdService(doctor_id) {

        if (!isValidUUID(doctor_id)) {
            return { success: false, message: "Invalid doctors id." };
        }

        const doctor = await Doctor.findByPk(doctor_id, {
            include: [
                {
                    model: Specialization,
                    as: "specialization",
                    attributes: ["specialization_id", "specialization_name"]
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "email", "username", "gender"]
                },
            ]
        });

        if (!doctor) return { success: false, message: "Doctor not found."};

        return { 
            success: true, 
            doctor: doctor.get({ plain: true }) 
        };
}

async function updateDoctorService(doctor_id, updateField) {

    if (!isValidUUID(doctor_id)) return { success: false, message: "Error invalid doctor's ID. "};

    const existingDoctor = await Doctor.findOne({ where: { doctor_id: doctor_id } });

    if (!existingDoctor) return { success: false, message: "Doctor not found." };

    const update = {};

    const allowFields = [
        "first_name",
        "middle_initial",
        "last_name",
        "contact_number",
        "specialization_id"  
    ];

    for (const field of allowFields) {
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
                sucess: false,
                errror: "First name must be between 2 and 50 characters."
            };
        }

        if (update.middle_initial && update.middle_initial.length !== 1) return { success: false, message: "Middle initial must be exactly one character." };
        
        if (update.last_name && update.last_name.length < 2 || update.last_name.length > 50) {
            return {
                success: false,
                message: "Last name must be between 2 and 50 characters."
            }; 
        }

        if (update.license_number) {
          const isValidPRC = /^\d{7}$/.test(update.license_number);
          if (!isValidPRC) {
            return {
              success: false,
              message: "License number must be a 7-digit numeric value.",
            };
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

        if (update.specialization_id) {
            const specializationCheck = await Specialization.findOne({
                where: {specialization_id: update.specialization_id}
            });

            if (!specializationCheck) {
                return { success: false, message: "Specialization not found." };
            }
        }

        if (!update || Object.keys(update).length === 0) return { success: false, message: "No fields provided to update" };

        const updateDoctor = await Doctor.update(update,{
            where: { doctor_id: doctor_id }
        });

        const refreshDoctor = await Doctor.findOne({ where: { doctor_id: doctor_id }} );

        return {
            success: true,
            message: "Doctor updated succcessfully.",
            updateDoctor: refreshDoctor.get({ plain: true })
        };
    }

async function toggleDoctorStatusService(doctor_id, active) {
     
    if (!isValidUUID(doctor_id)) return ({ success: false, message: "Invalid doctor's id." });

    const doctor = await Doctor.findOne({ where: { doctor_id: doctor_id }} );

    if (!doctor) return { success: false, message: "Doctor not found." };
    
    if (doctor.active === active) {
        return {
            success: false,
            message: active
                ? "Doctor is already active."
                : "Doctor is already inactive"
        }
    };

    doctor.active = !doctor.active
    await doctor.save();

    return {
        success: true,
        message: doctor.active
            ? "Doctor activated successfully."
            : "Doctor deactivated successfully.",
        doctor: doctor.get({ plain: true })    
    };
}

module.exports = { registerDoctorService, getAllDoctorService, getDoctorByIdService, updateDoctorService, toggleDoctorStatusService };