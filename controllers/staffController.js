const { isValidUUID } = require("../utils/security");
const { Staff, createStaff, getAllStaff, getStaffById, updateStaff, toggleStaffStatus } = require("../models/staffModel");
const { User } = require("../modules/users/user.model");
const { Position } = require("../models/positionModel");

async function registerStaffController(req, res) {
  try {
    const {
      user_id,
      first_name,
      middle_initial,
      last_name,
      position_id,
      employee_number,
      contact_number,
      active,
    } = req.body;

    const requiredFields = [
      'user_id',
      'first_name',
      'last_name',
      'employee_number',
      'position_id'
    ];

    const requiredField = {};

    for (const field of requiredFields) {
      const value = req.body[field];

      if (value === undefined || value === null) {
        return res.status(400).json({ success: false, error: `${field} is required.` });
      }

      if (typeof value === 'string') {
        const trimmed = value.trim();

        if (trimmed === '') {
          return res.status(400).json({ success: false, error: `${field} cannot be empty.` });
        }

        requiredField[field] = trimmed;
      } else {
        requiredField[field] = value; 
      }
    }

    const optionalFields = ['middle_initial', 'contact_number'];
    const optionalField = {};

    for (const field of optionalFields) {
      const value = req.body[field];

      if (value === undefined || value === null) {
        continue;
      }

      if (typeof value === 'string') {
        const trimmed = value.trim();

        if (trimmed === '') {
          return res.status(400).json({ success: false, error: `${field} cannot be empty.` });
        }

        optionalField[field] = trimmed;
      } else {
        optionalField[field] = value;
      }
    }


    if (requiredField.first_name.length < 2) {
      return res.status(400).json({ success: false, error: "First name must be at least 2 characters." });
    }
    if (requiredField.first_name.length > 50) {
      return res.status(400).json({ success: false, error: "First name must not exceed 50 characters." });
    }

    if (optionalField.middle_initial && !/^[A-Za-z]$/.test(optionalField.middle_initial)) {
      return res.status(400).json({ success: false, error: "Middle initial must be a single letter." });
    }

    if (requiredField.last_name.length < 2) {
      return res.status(400).json({ success: false, error: "Last name must be at least 2 characters." });
    }
    if (requiredField.last_name.length > 50) {
      return res.status(400).json({ success: false, error: "Last name must not exceed 50 characters." });
    }

    const empRegex = /^EMP-\d{4}$/;
    if (!empRegex.test(requiredField.employee_number)) {
      return res.status(409).json({ success: false, error: "Invalid employee number format." });
    }

    const intlNum = /^\+639\d{9}$/;
    if (optionalField.contact_number) {
      if (optionalField.contact_number.startsWith('09')) {
        optionalField.contact_number = optionalField.contact_number.replace(/^09/, '+639');
      }
      if (!intlNum.test(optionalField.contact_number)) {
        return res.status(400).json({ success: false, error: "Invalid mobile number." });
      }
    }

    let isActive = true;
    if (active !== undefined) {
      if (active === true || active === "true") isActive = true;
      else if (active === false || active === "false") isActive = false;
      else return res.status(400).json({ success: false, error: "Active must be true/false." });
    }

    if (!isValidUUID(requiredField.user_id)) {
      return res.status(400).json({ success: false, message: "Invalid user ID format" });
    }
    if (!isValidUUID(requiredField.position_id)) {
      return res.status(400).json({ success: false, message: "Invalid position ID format" });
    }

    const userCheck = await User.findByPk(requiredField.user_id);
    if (!userCheck) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    const positionCheck = await Position.findByPk(requiredField.position_id);
    if (!positionCheck) {
      return res.status(400).json({ success: false, error: "Invalid position ID." });
    }

    

    const staff = await createStaff({
      user_id: requiredField.user_id,
      first_name: requiredField.first_name,
      middle_initial: optionalField.middle_initial ?? null,
      last_name: requiredField.last_name,
      employee_number: requiredField.employee_number,
      contact_number: optionalField.contact_number ?? null,
      position_id: requiredField.position_id,
      active: isActive,
    });

    const newStaff = staff.get({ plain: true });

    return res.status(201).json({
      success: true,
      message: "Staff registered successfully",
      staff: newStaff
    });

  } catch (err) {
    console.error("Error creating staff:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Staff already exists.",
      });
    }

    return res.status(500).json({
      success: false,
      error: "Internal server error.",
    });
  }
}

async function getAllStaffController(req, res) {
  try {
    const { active, position_id } = req.query;

    const parsedActive =
      active === "true" ? true :
      active === "false" ? false : undefined;

    if (position_id && !isValidUUID(position_id)) {
      return res.status(400).json({ success: false, error: "Position must be a valid UUID." });
    }

    const staff = await getAllStaff(parsedActive, position_id);

    if (staff.length === 0) {
      return res.status(404).json({ success: false, message: "No staff found." });
    }

    return res.status(200).json({
      success: true,
      count: staff.length,
      staff,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getStaffByIdController(req, res) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const staff = await getStaffById(id);

    if (!staff) {
      return res.status(404).json({ success: false, error: "Staff not found." });
    }

    const normalizedStaff = staff.toJSON ? staff.toJSON() : staff;

    return res.status(200).json({
      success: true,
      message: "Staff retrieved successfully",
      count: 1,
      staff: normalizedStaff,
    });

  } catch (err) {
    console.error("Error retrieving staff by ID:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updateStaffController(req, res) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID." });
    }

    const allowedFields = [
      "first_name",
      "middle_initial",
      "last_name",
      "position_id",
      "employee_number",
      "contact_number",
      "active",
      "user_id"
    ];

    const update = {};

    for (const key of allowedFields) {
      let value = req.body[key];

      if (value === undefined || value === null) continue;

      // strings
      if (typeof value === "string") {
        let trimmed = value.trim();

        if (trimmed === "") {
          return res.status(400).json({ success: false, error: `${key} cannot be empty.` });
        }

        if (key === "first_name") {
          if (trimmed.length < 2) {
            return res.status(400).json({ success: false, error: "First name must be at least 2 characters." });
          }
          if (trimmed.length > 50) {
            return res.status(400).json({ success: false, error: "First name must not exceed 50 characters." });
          }
        }

        if (key === "middle_initial") {
          if (trimmed.length !== 1) {
            return res.status(400).json({ success: false, error: "Middle initial must be exactly one character." });
          }
          const middleInitialRegex = /^[A-Za-z]$/;
          if (!middleInitialRegex.test(trimmed)) {
            return res.status(400).json({ success: false, error: "Middle initial must be a single letter (A-Z)." });
          }
        }

        if (key === "last_name") {
          if (trimmed.length < 2) {
            return res.status(400).json({ success: false, error: "Last name must be at least 2 characters." });
          }
          if (trimmed.length > 50) {
            return res.status(400).json({ success: false, error: "Last name must not exceed 50 characters." });
          }
        }

        if (key === "employee_number") {
          const empRegex = /^EMP-\d{4}$/;
          if (!empRegex.test(trimmed)) {
            return res.status(400).json({ success: false, error: "Invalid employee number format (EMP-0000)." });
          }
        }

        if (key === "contact_number") {
          if (trimmed.startsWith("09")) {
            trimmed = trimmed.replace(/^09/, "+639");
          }
          const intlNum = /^\+639\d{9}$/;
          if (!intlNum.test(trimmed)) {
            return res.status(400).json({ success: false, error: "Invalid mobile number format." });
          }
        }

        update[key] = trimmed;
      }

      else if (key === "position_id" || key === "user_id") {
        if (!isValidUUID(value)) {
          return res.status(400).json({ success: false, error: `Invalid ${key} UUID.` });
        }
        if (key === "position_id") {
          const positionCheck = await Position.findByPk(value);
          if (!positionCheck) return res.status(400).json({ success: false, error: "Invalid position ID." });
        }
        if (key === "user_id") {
          const userCheck = await User.findByPk(value);
          if (!userCheck) return res.status(400).json({ success: false, error: "Invalid user ID." });
        }
        update[key] = value;
      }

      else if (typeof value === "boolean") {
        update[key] = value;
      }

      else {
        return res.status(400).json({ success: false, error: `${key} has an invalid type.` });
      }
    }

    update.middle_initial = update.middle_initial ?? null;
    update.contact_number = update.contact_number ?? null;

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, error: "No valid fields to update." });
    }

    const updatedStaff = await updateStaff(id, update);

    if (!updatedStaff) {
      return res.status(404).json({ success: false, error: "Staff not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Staff info updated successfully.",
      staff: updatedStaff,
    });

  } catch (err) {
    console.error("Error updating staff:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Staff already exists.",
      });
    }s

    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function toggleStaffStatusController (req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    if (typeof active !== "boolean") {
      return res.status(400).json({ success: false, error: "Active status must be boolean." });
    }

    const staff = await toggleStaffStatus(id, active);

    if (!staff) {
      return res.status(404).json({ success: false, error: "Staff not found." });
    }

    return res.status(200).json({
      success: true,
      message: staff.active ? "Staff reactivated." : "Staff deactivated.",
      staff
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = {
  registerStaffController,
  getAllStaffController,
  getStaffByIdController,
  updateStaffController,
  toggleStaffStatusController
};
