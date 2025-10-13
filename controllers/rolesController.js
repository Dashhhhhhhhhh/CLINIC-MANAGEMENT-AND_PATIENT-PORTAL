const express = require('express');
const { isValidUUID } = require("../utils/security");
const { Role, createRole, getAllRoles, getRoleById, updateRole, toggleStatusRole } = require("../models/roleModel");


async function createRoleController(req, res) {
  try {
    const { role_name, description } = req.body;

    if (!role_name || !role_name.trim()) {
      return res.status(400).json({
        success: false,
        error: "Role name is required."
      });
    }

    const cleanedRoleName = role_name.trim();

    if (cleanedRoleName.length > 50) {
      return res.status(400).json({
        success: false,
        error: "Role name must not exceed 50 characters."
      });
    }

    let cleanedDescription = null;
    if (description && description.trim()) {
      cleanedDescription = description.trim();

      if (cleanedDescription.length > 255) {
        return res.status(400).json({
          success: false,
          error: "Description must not exceed 255 characters."
        });
      }
    }

    const role = await createRole({
      role_name: cleanedRoleName,
      description: cleanedDescription,
    });
    
      return res.status(201).json({
      success: true,
      message: "Role created successfully.",
      role: role
    });

  } catch (err) {
    console.error("Error creating admin role:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
}

async function getAllRolesController(req, res) {
  try {
    const { active } = req.query;

    const parsedActive =
      active === "true" ? true :
      active === "false" ? false : undefined;

    const roles = await getAllRoles(parsedActive);

    return res.status(200).json({
      success: true,
      count: roles.length,
      roles
    });

  } catch (err) {
    console.error("Error fetching roles:", err);
    return res.status(500).json({ success: false,error: "Internal server error" });
  }
}

async function getRoleByIdController (req,res) {

  try {
    const { id } = req.params;

    if (!isValidUUID(id)) {
    return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const role = await getRoleById(id);

    if (!role) {
      return res.status(404).json({ success: false, error: "Role not found" });
    }

    return res.status(200).json({ success: true, role });

  } catch (err) {
    console.error("Error in getRolesbyIdController:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updateRoleController(req, res) {
  try {
    
    const { id } = req.params;
    let update = {};

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const allowedFields = ['role_name', 'description', 'active'];

    for (const key of allowedFields) {
      const value = req.body[key];

      if (value === undefined || value === null) continue;

      if (typeof value === 'string') {
        const trimmed = value.trim();

        if (key === 'role_name' && trimmed.length > 50) {
          return res.status(400).json({
            success: false,
            error: "Role name must not exceed 50 characters."
          });
        }

        if (key === 'description' && trimmed.length > 255) {
          return res.status(400).json({
            success: false,
            error: "Description must not exceed 255 characters."
          });
        }

        if (key === 'active') {
          if (trimmed !== 'true' && trimmed !== 'false') {
            return res.status(400).json({
              success: false,
              error: "Invalid value for active. Must be true or false."
            });
          }
          update[key] = trimmed === 'true';
        } else {
          update[key] = trimmed;
        }

      } else if (typeof value === 'boolean' && key === 'active') {
        update[key] = value;
      } else {
        return res.status(400).json({
          success: false,
          error: `${key} has an invalid type.`
        });
      }
    }

    const updatedRole = await updateRole(id, update);

    return res.status(200).json({
      success: true,
      message: "Role updated successfully.",
      updatedRole
    });

  } catch (err) {
    console.error("Error in updateRolesController:", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error."
    });
  }
}

async function toggleRoleStatusController (req, res) {
    try {
        const { id } = req.params;
        const { active } = req.body;

        if (!isValidUUID(id)) {
            return res.status(400).json({ success: false, error: "Invalid UUID" });
        }

        if (typeof active !== "boolean") {
            return res.status(400).json({ success: false, error: "Active status must be boolean." });
        }

        const role = await toggleStatusRole(id, active);

        if (!role) {
            return res.status(404).json({ success: false, error: "Role not found." });
        }

        return res.status(200).json({
            success: true,
            message: role.active 
                ? "Role reactivated." 
                : "Role deactivated.",
            role,
        });

    } catch (err) {
        console.error("Error in toggleRoleStatus:", err);
        return res.status(500).json({ success: false, error: "Internal server error" });
    }
}



module.exports = {
    createRoleController,
    getAllRolesController,
    getRoleByIdController,
    updateRoleController,
    toggleRoleStatusController
};