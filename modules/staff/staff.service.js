const { isValidUUID } = require("../../utils/security");
const { Staff, createStaff, getAllStaff, getStaffById, updateStaff, toggleStaffStatus } = require("../staff/staff.model");
const { User } = require("../users/user.model");
const { Position } = require("../positions/position.model");
const e = require("cors");
const { where } = require("sequelize");
const { Sequelize } = require("sequelize");
const { getAvailableUsersByModel } = require("../../utils/helpers/getAvailableUsers");


async function registerStaffService (user_id, first_name, middle_initial, last_name, position_id, employee_number, contact_number, active) {

    if (!user_id || !first_name || !last_name  || !position_id) {
        return { success: false, message: "Please provide all required fields (user_id, first_name, last_name, position_id)." };
    }

    if (!isValidUUID(user_id)) {
        return { success: false, message: "Invalid user_id format." };
    }
    if (!isValidUUID(position_id)) {
        return { success: false, message: "Invalid position id format." };
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

    const user = await User.findByPk(user_id);

    if (!user) {
      return  {success: false, message: "User not found." };
    }

    const localToday = new Date().toLocaleDateString('en-CA');
    const countToday = await Staff.count({
    where: Sequelize.where(
        Sequelize.fn('DATE', Sequelize.col('created_at')),
        localToday
    )
    });

    const next = countToday +1;
    const seq = String(next).padStart(3, '0');
    const datePart = localToday.replace(/-/g, '');
    const employeeNumber = `STF-${datePart}-${seq}`;

    employee_number = employeeNumber;

    const existingEmployee = await Staff.findOne({
    where: { employee_number }
    });

    if (existingEmployee) {
    return { success: false, message: "Employee number already exists, please try again." };
    }

    const position = await Position.findOne({
      where: { position_id, active: true },
    });
    
    if (!position) {
      return { success: false, message: "Invalid Position ID." };
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

    const existingStaff = await Staff.findOne({ where: {user_id }});

    if (existingStaff) return { success: false, message: "Staff already registered for this user." }

    const staff = await createStaff({
        user_id,
        first_name,
        middle_initial: middle_initial || null,
        last_name,
        employee_number,
        contact_number: formattedContact,
        position_id,
        active: isActive
    });

    return { success: true, message: "Staff registered successfully.", staff };
}

async function getAllStaffService(active, position_id) {

    const whereClause = {};

    if (active !== undefined) whereClause.active = active;

    const result = await Staff.findAll({
        where: whereClause,
        attributes: [
            "staff_id",
            "first_name",
            "middle_initial",
            "last_name",
            "employee_number",
            "contact_number",
            "active"
        ],
        include: [
            {
                model: Position,
                as: "position",
                attributes: ["position_id", "position_name"]
            },
        ],
    });

    return {
        success: true,
        count: result.length,
        staff: result.map(staffs => staffs.get({ plain: true}))
    };
}

async function getStaffByIdService(staff_id) {

        if (!isValidUUID(staff_id)) {
            return { success: false, message: "Invalid staff id." };
        }

        const staff = await Staff.findByPk(staff_id, {
            include: [
                {
                    model: Position,
                    as: "position",
                    attributes: ["position_id", "position_name"],
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["id", "email", "username", "gender"],
                },
            ],
        });

        if (!staff) return { success: true, message: "Staff not found." };

        return {
            success: true,
            staff: staff.get({ plain: true })
        };
}

async function updateStaffService(staff_id, updateField) {
        
        if (!isValidUUID(staff_id)) {
            return { success: false, message: "Invalid staff id." };
        }

    const existingStaff = await Staff.findOne({ where: { staff_id: staff_id }});

    if (!existingStaff) return { success: false, message: "Staff not found" };
    
    const update = {};

    const allowedField = [
        "first_name",
        "middle_initial",
        "last_name",
        "contact_number",
        "position_id"
    ];

     for (const field of allowedField) {
        let value = updateField[field];
        if (value === null || value === undefined) continue;

        let trimmed;

        if (typeof value === 'string'){
            trimmed = value.trim();
        } else if (typeof value === 'number') {
            if(isNaN(value) || value < 0) continue;
            trimmed = value;
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
        
        if (update.last_name && (update.last_name.length < 2 || update.last_name.length > 50)) {
            return {
                success: false,
                message: "Last name must be between 2 and 50 characters."
            }; 
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

        if (update.position_id) {
            const positionCheck = await Position.findOne({
                where: {position_id: update.position_id}
            });

            if (!positionCheck) {
                return { success: false, message: "Position not found." };
            }
        }

        if (!update || Object.keys(update).length === 0) return { success: false, message: "No fields provided to update" };

        const updateStaff = await Staff.update(update, {
            where: { staff_id: staff_id }
        });

        const refreshStaff = await Staff.findOne({ where: {staff_id: staff_id }});

        return {
            success: true,
            message: "Staff updated Successfully.",
            updateSaff: refreshStaff.get({ plain: true })
        };

}

async function toggleStaffStatusService(staff_id, active) {

    if (!isValidUUID(staff_id)) return ({ success: false, message: "Invalid staff id." });

    const staff = await Staff.findOne({ where: { staff_id: staff_id }} );

    if(!staff) return { success: false, message: "Staff not found." };

    if (staff.active === active) {
        return {
            success: false,
            message: active
                ? "staff is already active."
                : "staff is already inactive"
        }
    };

    staff.active = !staff.active;
    await staff.save();

    return {    
        success: true,
        message: staff.active
            ? "Staff activated successfully."
            : "Staff deactivated successfully.",
        staff: staff.get({ plain: true })    
    };
  

}

async function getAvailableStaffUsersService() {
  return await getAvailableUsersByModel(Staff);
}



module.exports = {
    registerStaffService,
    getAllStaffService,
    getStaffByIdService,
    updateStaffService,
    toggleStaffStatusService,
    getAvailableStaffUsersService
};