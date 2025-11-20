const { isValidUUID } = require("../../utils/security");
const { Position, createPosition, getAllPositions, getPositionById, updatePosition, togglePositionStatus} = require("../positions/position.model");

async function createPositionService(position_name, active) {

    if (!position_name || !position_name.trim()) {
      return {
        success: false,
        error: "Position name is required."
      };
    }

    const cleanedPositionName = position_name.trim();

    if (cleanedPositionName.length > 50) {
      return { success: false, error: "Position name must not exceed 50 characters." };
    }

    const lettersOnlyRegex = /^[a-zA-Z\s]+$/;
    if (!lettersOnlyRegex.test(cleanedPositionName)) {
      return { success: false, error: "Position name must contain only letters and spaces." };
    }

    let isActive = true;
    if (active !== undefined) {
      if (active === true || active === "true") isActive = true;
      else if (active === false || active === "false") isActive = false;
      else return { success: false, message: "Active must be true or false." };
    }

    const existingPosition = await Position.findOne({ where: { position_name}})

    if (existingPosition) return { success: false, message: "Position already exists."};

    const position = await createPosition({
        position_name,
        active: isActive
    });

    return { success: true, message: "Position created successfully.", position };
}

async function getAllPositionsService(active) {
    
    const whereClause = {};

    if (active !== undefined) whereClause.active = active;

    const result = await Position.findAll({
        where: whereClause,
        attributes: [
            "position_id",
            "position_name"
        ],
    });

    return {
        success: true,
        count: result.length,
        position: result.map(pos => pos.get({ plain: true }))
    };
}

async function getPositionByIdService(position_id) {

        if (!isValidUUID(position_id)) {
            return { success: false, message: "Invalid position id." };
        }

        const position = await Position.findByPk();

        if (!position) return { success: true, message: "Position not found" };

        return {
            success: true,
            staff: staff.get({ plain: true })
        };
}

async function updatePositionService(position_id, updateField) {

    if (!isValidUUID(position_id)) return { success: false, message: "Error invalid position ID. "};

    const existingPosition = await Position.findOne({ where: { position_id: position_id }});

    if (!existingPosition) return { success: false, message: "Postion not found" };

    const update = {};

    const allowedField = [
        "position_name"
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

        if (update.position_name && (update.position_name.length < 2 || update.position_name.length > 50)) {
            return { 
                sucess: false,
                errror: "Position name must be between 2 and 50 characters."
            };
        }

    if (!update || Object.keys(update).length === 0) return { success: false, message: "No fields provided to update" };

    const updatePosition = await Position.update(update, {
        where: { position_id: position_id }
    });

    const refreshPosition = await Position.findOne({ position: { position_id: position_id }});

    return { 
        success: true,
        message: "Position updated successfully.",
        updatePosition: refreshPosition.get({ plain: true })
    };
}

async function togglePositionStatusService(position_id, active) {

    if (!isValidUUID(position_id)) return ({ success: false, message: "Invalid position id." });

    const position = await Position.findOne({ where: { position_id: position_id }} );

    if(!position) return { success: false, message: "Position not found." };

    if (position.active === active){
        return {
            success: false,
            message: active
                ? "Position is already active"
                : "Position is already inactive"
        }
    };

    return {
        success: true,
        message: position.active
            ? "Position activated successfully."
            : "Position deactivated successfully",
        position: position.get({ plain: true })
    };
}

async function getAvailablePositionService() {
    
    const existingPosition = await Position.findAll();
    
    return {
        success: true,
        position: existingPosition
    }
}

module.exports = {
    createPositionService,
    getAllPositionsService,
    getPositionByIdService,
    updatePositionService,
    togglePositionStatusService,
    getAvailablePositionService
}