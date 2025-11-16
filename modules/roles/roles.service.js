const { where } = require("sequelize");
const { isValidUUID } = require("../../utils/security");
const { Role, createRole, getAllRoles, getRoleById, updateRole, toggleStatusRole } = require("./roles.model");

async function createRoleService (role_id, role_name, description, active) {

    if (!role_name || !role_name.trim()) {
        return { success: false, message: "Role name is required"};
    }

    const cleanedRoleName = role_name.trim().toLowerCase();
    const cleanedDescription = description ? description.trim() : null;

    if (cleanedRoleName.length < 2 || cleanedRoleName.length > 25 ) {
        return{ success: false, message: "Role name must be atleat 2 characters." };
    }

    const sNameRegex = /^[a-zA-Z\s'-]+$/;
    if (!sNameRegex.test(cleanedRoleName)) {
        return { success: false, message: "Role name can only contain letters, spaces, hyphens (-), and apostrophes (')."};
    }

    if (cleanedDescription && cleanedDescription.length > 255) {
        return { success: false, message: "Description must not exceed 255 characters."};
    }

    let isActive = true;
    if (active !== undefined) {
      if (active === true || active === "true") isActive = true;
      else if (active === false || active === "false") isActive = false;
      else return { success: false, message: "Active must be true or false." };
    }

    const existingRole = await Role.findOne({ where: { role_name: cleanedRoleName }})
    
    if (existingRole) return { success: false, message: "Role name already exist"};

    const role = await createRole({
        role_name: cleanedRoleName,
        description: cleanedDescription,
        isActive
    });


    return {
        success: true,
        message: "Role create successfully.",
        role: role
    };
}

async function getAllRolesService(active) {

    const whereClause = {};

    if (active !== undefined) whereClause.active = active;

    const result = await Role.findAll({
        attributes: [
            "role_id",
            "role_name",
            "description",
            "active"
        ],
    });

    return {
        success: true,
        message: result.length,
        role: result.map(role => role.get({ plain: true }))
    };
}

async function getRoleByIdService(role_id) {

    if (!isValidUUID(role_id)) return { success: false, message: "Invalid role id." };


    const role = await Role.findByPk(role_id);

    if(!role) return { success: false, message: "Role id not found."};

    return {
        success: true,
        role: role.get ({ plain: true })
    };
}

async function updateRoleService(role_id, updateField) {

    if (!isValidUUID(role_id)) {
      return res.status(400).json({ success: false, error: "Invalid role id " });
    }

    const existingRole = await Role.findOne({ where: { role_id: role_id }});

    if (!existingRole) return { success: false, message: "Role id not found" };

    const update = [
        "role_name",
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

        if (update.role_name) {
            if (update.specialization_name.length < 2 || update.specialization_name.length > 20) {
                return { success: false, message: "Role name must be between 2 and 20 characters." };
            }
        }

        if (update.description) {
            if (update.description.length < 5 || update.description.length > 255) {
                return { success: false, message: "Description must be between 5 and 255 characters." };
            }
        }

    if (!update || Object.keys(update).length === 0) return { success: false, message: "No fields provided to update" };

    const role = await Role.update(update, {
        where: { role_id: role_id }
    });

    const refreshRole = await Role.findOne({ where: { role_id: role_id }});

    return { 
        success: true,
        message: "Role updated successfully",
        role: refreshRole
    }
}


async function toggleRoleStatusService (role_id, active) {

    if (!isValidUUID(role_id)) {
      return res.status(400).json({ success: false, error: "Invalid role id " });
    }

    const role = await Role.findOne({ where: { role_id: role_id }});
    
    if (!role) return { success: false, message: "Role id not found" };

    if (role.active === active) {
        return {
            success: false,
            message: active 
                ? "Role is already active"
                : "Role is already inactive"
        }
    };

    role.active = !role.active
    await role.save();


    return {
        success: true,
        message: role.active 
            ? "role activated"
            : "role deactivated",
        role: role.get({ plain: true})
    }   

}

async function getRoleService() {
    
    const existingRole = await Role.findAll();

    return {
        success: true,
        role: existingRole
    }
}

module.exports = {
    createRoleService,
    getAllRolesService,
    getRoleByIdService,
    updateRoleService,
    toggleRoleStatusService,
    getRoleService
};
