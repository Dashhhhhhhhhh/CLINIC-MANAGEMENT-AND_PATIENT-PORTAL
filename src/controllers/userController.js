const { isValidUUID } = require("../utils/security");
const { User, getAllUsers, getUserById, updateUser, toggleUserStatus } = require("../models/userModel");
const { Role } = require("../models/roleModel");

async function getAllUsersController(req, res) {
  try {
    const { active, role_id } = req.query;

    const parsedActive =
      active === "true" ? true :
      active === "false" ? false : undefined;

    const users = await getAllUsers(parsedActive, role_id);

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });

  } catch (err) {
    console.error("Error fetching users:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getUsersIdController(req, res) {
  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const user = await getUserById(id);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    const normalizeUser = user.toJSON ? user.toJSON() : user;


    return res.status(200).json({
    success: true,
    message: "User retrieved successfully",
    count: 1,
    data: normalizeUser,
    });

  } catch (err) {
    console.error("Error fetching user:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updateUsersController(req, res) {
  try {
    const { id } = req.params;
    const update = {};

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const allowedFields = ["username", "email", "role_id", "active", "gender"];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    for (const key of allowedFields) {
      const value = req.body[key];
      if (value === undefined || value === null) continue;

      if (typeof value === "string") {
        const trimmed = value.trim();

        if (key === "email" && !emailRegex.test(trimmed)) {
          return res.status(400).json({ success: false, error: "Invalid email format." });
        }

        if (key === "username" && trimmed.length < 3) {
          return res.status(400).json({ success: false, error: "Username must be at least 3 characters." });
        }

        if (key === "gender") {
          const validGenders = ["male", "female"];
          if (!validGenders.includes(trimmed.toLowerCase())) {
            return res.status(400).json({ success: false, error: "Invalid gender value." });
          }
          update[key] = trimmed.toLowerCase();
          continue;
        }

        if (key === "role_id") {
          if (!isValidUUID(trimmed)) {
            return res.status(400).json({ success: false, error: "Invalid role ID format." });
          }

          const role = await Role.findByPk(trimmed);
          if (!role) {
            return res.status(400).json({ success: false, error: "Role does not exist." });
          }

          update[key] = trimmed;
          continue;
        }

        update[key] = trimmed;
      } 
      else if (typeof value === "boolean" && key === "active") {
        update[key] = value;
      } 
      else {
        return res.status(400).json({ success: false, error: `${key} has an invalid type.` });
      }
    }

    if (Object.keys(update).length === 0) {
      return res.status(400).json({ success: false, error: "No fields to update." });
    }

    const updatedUser = await updateUser(id, update);

    if (!updatedUser) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: "User updated successfully.",
      user: updatedUser,
    });

  } catch (err) {
    console.error("Error updating user:", err);

    if (err.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        success: false,
        error: "Email or username already exists.",
      });
    }

    return res.status(500).json({ success: false, error: "Internal server error." });
  }
}


async function toggleUserStatusController(req, res) {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    if (typeof active !== "boolean") {
      return res.status(400).json({ success: false, error: "Active status must be boolean." });
    }

    const user = await toggleUserStatus(id, active);

    if (!user) {
      return res.status(404).json({ success: false, error: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: user.active ? "User reactivated." : "User deactivated.",
      user,
    });

  } catch (err) {
    console.error("Error toggling user status:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = {
  getAllUsersController,
  getUsersIdController,
  updateUsersController,
  toggleUserStatusController,
};
