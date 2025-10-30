const { isValidUUID } = require("../utils/security");
const { Doctor, createDoctor, getAllDoctors, getDoctorById, updateDoctor, toggleDoctorStatus } = require("../models/doctorModel");
const { User } = require("../models/userModel");
const { Specialization } = require("../models/specializationModel");


async function registerDoctorController(req, res) {
  try {
    const {
      user_id,
      first_name,
      middle_initial,
      last_name,
      license_number,
      contact_number,
      specialization_id,
      active,
    } = req.body;

    if (!user_id || !first_name || !last_name || !license_number || !specialization_id) {
      return res.status(400).json({
        success: false,
        message:
          "Please provide all required fields (user_id, first_name, last_name, license_number, specialization_id).",
      });
    }

    if (user_id &&!isValidUUID(user_id)) {
      return res.status(400).json({ success: false, error: "Invalid user_id UUID." });
    }

    if (specialization_id && !isValidUUID(specialization_id)) {
    return res.status(400).json({ success: false, error: "Invalid specialization_id format." });
    }


    if (first_name.length < 2 || first_name.length > 50) {
      return res.status(400).json({ success: false, error: "First name must be between 2 and 50 characters." });
    }

    if (middle_initial && middle_initial.length !== 1) {
      return res.status(400).json({ success: false, error: "Middle initial must be exactly one character." });
    }

    if (last_name.length < 2 || last_name.length > 50) {
      return res.status(400).json({ success: false, error: "Last name must be between 2 and 50 characters." });
    }

    const isValidPRC = /^\d{7}$/.test(license_number);
    if (!isValidPRC) {
      return res.status(400).json({
        success: false,
        error: "License number must be a 7-digit numeric value.",
      });
    }

    const userCheck = await User.findByPk(user_id);
    if (!userCheck) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const specializationCheck = await Specialization.findOne({
      where: { specialization_id, active: true },
    });
    if (!specializationCheck) {
      return res.status(400).json({ success: false, error: "Invalid specialization ID." });
    }

    let formattedContact = null;
    if (contact_number) {
      let trimmed = contact_number.trim();
      if (trimmed.startsWith("09")) {
        trimmed = trimmed.replace(/^09/, "+639");
      }
      const intlNum = /^\+639\d{9}$/;
      if (!intlNum.test(trimmed)) {
        return res.status(400).json({ success: false, error: "Invalid mobile number." });
      }
      formattedContact = trimmed;
    }

    let isActive = true;
    if (active !== undefined) {
      if (active === true || active === "true") isActive = true;
      else if (active === false || active === "false") isActive = false;
      else return res.status(400).json({ success: false, error: "Active must be true/false." });
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

    const newDoctor = doctor.get({ plain: true });

    return res.status(201).json({
      success: true,
      message: "Doctor registered successfully.",
      doctor: newDoctor,
    });
  } catch (err) {
    console.error("Error creating doctor:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Doctor already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
}


async function getAllDoctorController(req, res) {
  try {
    const { active, specialization_id } = req.query;

    const parsedActive =
      active === "true" ? true :
      active === "false" ? false : undefined;

    if (specialization_id && !isValidUUID(specialization_id)) {
      return res.status(400).json({ success: false, error: "Specialization must be a valid UUID." });
    }

    const doctors = await getAllDoctors(parsedActive, specialization_id);

    return res.status(200).json({
      success: true,
      count: doctors.length,
      doctors,
    });
  } catch (err) {
    console.error("Error in getAllDcotorsController:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}


async function updateDoctorsController(req, res) {
  try {
    const { id } = req.params;
    const { specialization_id, active } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const allowedFields = [
      "first_name",
      "middle_initial",
      "last_name",
      "license_number",
      "contact_number",
      "specialization_id",
    ];

    const update = {};

    for (const key of allowedFields) {
      let value = req.body[key];

      if (value === undefined || value === null) continue;

      if (typeof value === "string") {
        let trimmed = value.trim();

        if (key === "first_name") {
          if (trimmed.length < 2) {
            return res.status(400).json({ success: false, error: "First name must be at least 2 characters." });
          }
          if (trimmed.length > 50) {
            return res.status(400).json({ success: false, error: "First name must not exceed 50 characters." });
          }
        }

        if (key === "middle_initial" && trimmed.length !== 1) {
          return res.status(400).json({ success: false, error: "Middle initial must be exactly one character." });
        }

        if (key === "last_name") {
          if (trimmed.length < 2) {
            return res.status(400).json({ success: false, error: "Last name must be at least 2 characters." });
          }
          if (trimmed.length > 50) {
            return res.status(400).json({ success: false, error: "Last name must not exceed 50 characters." });
          }
        }

        if (key === "license_number") {
          const isValidPRC = /^\d{7}$/.test(trimmed);
          if (!isValidPRC) {
            return res.status(400).json({
              success: false,
              error: "License number must be a 7-digit numeric value.",
            });
          }
        }

        if (key === "contact_number") {
          if (trimmed.startsWith("09")) {
            trimmed = trimmed.replace(/^09/, "+639");
          }
          const intlNum = /^\+639\d{9}$/;
          if (!intlNum.test(trimmed)) {
            return res.status(400).json({ success: false, error: "Invalid mobile number." });
          }
        }

        update[key] = trimmed;
      } else if (typeof value === "number") {
        update[key] = value;
      } else {
        return res.status(400).json({ success: false, error: `${key} has an invalid type.` });
      }
    }

    const specializationCheck = await Specialization.findByPk(specialization_id);
    if (!specializationCheck) {
      return res.status(400).json({ success: false, error: "Invalid specialization ID." });
    }

    update.specialization_id = specialization_id;

    if (active !== undefined) {
      if (active === true || active === "true") update.active = true;
      else if (active === false || active === "false") update.active = false;
      else return res.status(400).json({ success: false, error: "Active must be true/false." });
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields to update" });
    }

    const updatedDoctor = await updateDoctor(id, update);

    if (!updatedDoctor) {
      return res.status(404).json({ success: false, error: "Doctor not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Doctor info updated successfully.",
      doctor: updatedDoctor,
    });
  } catch (err) {
    console.error("Error updating doctor:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Doctor already exists.",
      });
    }

    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}


async function getDoctorByIdController(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: "Doctor ID is required." });
    }

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const doctor = await getDoctorById(id);

    if (!doctor) {
      return res.status(404).json({ success: false, error: "Doctor not found." });
    }

    const normalizedDoctor = doctor.toJSON() ? doctor.toJSON() : doctor;

    return res.status(200).json({
      success: true,
      message: "Doctor retrieved successfully.",
      count: 1,
      doctor: normalizedDoctor,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error." });
  }
}


async function toggleDoctorStatusController(req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    if (typeof active !== "boolean") {
      return res.status(400).json({ success: false, error: "Active status must be boolean." });
    }

    const doctor = await toggleDoctorStatus(id, active);

    if (!doctor) {
      return res.status(404).json({ success: false, error: "Doctor not found." });
    }

    return res.status(200).json({
      success: true,
      message: doctor.active ? "Doctor reactivated." : "Doctor deactivated.",
      doctor: doctor,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}


module.exports = {
  registerDoctorController,
  getAllDoctorController,
  updateDoctorsController,
  getDoctorByIdController,
  toggleDoctorStatusController,
};
