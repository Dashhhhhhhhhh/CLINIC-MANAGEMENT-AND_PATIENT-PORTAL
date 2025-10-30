const { isValidUUID } = require("../utils/security");
const { Admin, createAdmin, getAllAdmins, getAdminById, updateAdmin, toggleAdminStatus } = require("../models/adminModel");
const { Role } = require("../models/roleModel");
const { User } = require("../models/userModel");

async function createAdminController(req, res) {
  try {
    const {
      first_name,
      middle_initial,
      last_name,
      contact_number,
      notes,
      user_id,
      role_id,
      active
    } = req.body;

    if (!first_name || !last_name || !user_id) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: first_name, last_name, and user_id are required."
      });
    }

    if (role_id && !isValidUUID(role_id)) {
      return res.status(400).json({ success: false, error: "Invalid role_id format." });
    }

    const admin = await createAdmin({
      first_name: first_name.trim(),
      middle_initial: middle_initial || null,
      last_name: last_name.trim(),
      contact_number: contact_number || null,
      notes: notes || null,
      user_id,
      role_id,
      active: active ?? true,
    });

    return res.status(201).json({
      success: true,
      message: "Admin created successfully.",
      admin,
    });

  } catch (error) {
    console.error("Error creating admin:", error.message);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);
    return res.status(500).json({
      success: false,
      error: "Server error while creating admin."
    });
  }
}

async function getAllAdminController(req, res) {
  try {
    const { active, role_id } = req.query;

    const parsedActive =
      active === "true" ? true :
      active === "false" ? false : undefined;

    if (role_id && !isValidUUID(role_id)) {
      return res.status(400).json({ success: false, error: "Role ID must be a valid UUID." });
    }

    const admin = await getAllAdmins(parsedActive, role_id);

    return res.status(200).json({
      success: true,
      count: admin.length,
      admin,
    });
  } catch (err) {
    console.error("Error fetching admins:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getAdminByIdController(req, res) {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ success: false, error: "Admin ID is required." });
    }

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const admin = await getAdminById(id);

    if (!admin) {
      return res.status(404).json({ success: false, error: "Admin not found." });
    }

    const normalizedAdmin = admin.toJSON ? admin.toJSON() : admin;

    return res.status(200).json({
      success: true,
      message: "Admin retrieved successfully.",
      count: 1,
      admin: normalizedAdmin,
    });

  } catch (err) {
    console.error("Error fetching admin by ID:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updateAdminController(req, res) {
  try {
    const { id } = req.params;

    if (!id || !isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid admin ID." });
    }

    const allowedFields = [
      "first_name",
      "last_name",
      "contact_number",
      "middle_initial",
      "notes"
    ];

    const update = {};

    for (const key of allowedFields) {
      const value = req.body[key];

      if (value === undefined || value === null) continue;

      if (typeof value === "string") {
        let trimmed = value.trim();

        if (trimmed === "") {
          return res.status(400).json({ success: false, error: `${key} cannot be empty` });
        }

        if (key === "first_name" && (trimmed.length < 2 || trimmed.length > 50)) {
          return res.status(400).json({
            success: false,
            error: "First name must be between 2 and 50 characters."
          });
        }

        if (key === "middle_initial" && trimmed.length !== 1) {
          return res.status(400).json({
            success: false,
            error: "Middle initial must be exactly one character."
          });
        }

        if (key === "last_name" && (trimmed.length < 2 || trimmed.length > 50)) {
          return res.status(400).json({
            success: false,
            error: "Last name must be between 2 and 50 characters."
          });
        }

        if (key === "contact_number") {
          if (trimmed.startsWith("09")) {
            trimmed = trimmed.replace(/^09/, "+639");
          }
          const intlNum = /^\+639\d{9}$/;
          if (!intlNum.test(trimmed)) {
            return res.status(400).json({
              success: false,
              error: "Invalid mobile number format. Expected +639XXXXXXXXX."
            });
          }
        }

        if (key === "notes") {
          const isValidNotes = /^[a-zA-Z0-9\s.,!?-]*$/.test(trimmed);
          if (!isValidNotes) {
            return res.status(400).json({
              success: false,
              error: "Notes contain invalid characters."
            });
          }
          if (trimmed.length > 500) {
            return res.status(400).json({
              success: false,
              error: "Notes must be 500 or fewer characters."
            });
          }
        }

        update[key] = trimmed;
      } else if (typeof value === "boolean") {
        update[key] = value;
      } else {
        return res.status(400).json({
          success: false,
          error: `${key} has an invalid type.`
        });
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({
        success: false,
        error: "No valid fields provided for update."
      });
    }

    const updatedAdmin = await updateAdmin(id, update);

    if (!updatedAdmin) {
      return res.status(404).json({
        success: false,
        error: "Admin not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: "Admin updated successfully.",
      admin: updatedAdmin
    });

  } catch (err) {
    console.error("Error updating admin:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}

async function toggleAdminStatusController(req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    if (typeof active !== "boolean") {
      return res.status(400).json({
        success: false,
        error: "Active status must be a boolean."
      });
    }

    const admin = await toggleAdminStatus(id, active);

    if (!admin) {
      return res.status(404).json({
        success: false,
        error: "Admin not found."
      });
    }

    return res.status(200).json({
      success: true,
      message: admin.active ? "Admin reactivated." : "Admin deactivated.",
      admin: admin
    });

  } catch (err) {
    console.error("Error toggling admin status:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}

module.exports = {
  createAdminController,
  getAllAdminController,
  getAdminByIdController,
  updateAdminController,
  toggleAdminStatusController
};
