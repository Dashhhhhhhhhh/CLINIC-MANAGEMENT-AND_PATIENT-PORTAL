const { isValidUUID } = require("../../utils/security");
const { validateDate } = require("../../utils/validators")
const { Result } = require("../results/result.model");
const { Patient } = require("../patients/patients.model");
const { BillingItem } = require("../billingItem/billingItem.model");
const { TestTypes } = require("../testTypes/testTypes.model");
const { where } = require("sequelize");
const { formatToPh } = require("../../utils/datetime");
const { Staff } = require("../staff/staff.model");

async function createResultService(
  patient_id,
  created_by,
  test_type_id,
  billing_item_id,
  result_data,
  status
) {

  if (!patient_id || !isValidUUID(patient_id)) {
    return { success: false, message: "Invalid or missing patient_id" };
  }

  const existingPatient = await Patient.findByPk(patient_id);
  if (!existingPatient) {
    return { success: false, message: "Patient not found." };
  }


  if (!created_by || !isValidUUID(created_by)) {
    return { success: false, message: "Staff not authenticated or invalid ID" };
  }


  if (!test_type_id || !isValidUUID(test_type_id)) {
    return { success: false, message: "Invalid or missing test_type_id" };
  }

  const existingTestType = await TestTypes.findByPk(test_type_id);
  if (!existingTestType) {
    return { success: false, message: "Test type not found." };
  }


  if (!billing_item_id || !isValidUUID(billing_item_id)) {
    return { success: false, message: "Invalid or missing billing_item_id" };
  }

  const existingBilling = await BillingItem.findByPk(billing_item_id);
  if (!existingBilling) {
    return { success: false, message: "Billing item not found." };
  }

  if (result_data === undefined || result_data === null) {
    return { success: false, message: "Result data is required." };
  }

  if (typeof result_data !== "object" || Array.isArray(result_data)) {
    return {
      success: false,
      message: "Result data must be a non-empty object.",
    };
  }

  if (Object.keys(result_data).length === 0) {
    return { success: false, message: "Result data cannot be empty." };
  }

  const allowedStatus = ["Pending", "Reviewed", "Approved", "Completed"];

  if (!status) {
    status = "Pending";
  } else if (!allowedStatus.includes(status)) {
    return { success: false, message: "Invalid status value." };
  }

  const result = await Result.create({
    patient_id,
    created_by,
    test_type_id,
    billing_item_id,
    result_data,
    status,
  });

  return {
    success: true,
    message: "Result created successfully.",
    data: result,
  };
}

async function getAllResultService (is_deleted) {

    const whereClause = {};

    if (is_deleted !== undefined) {
    if (is_deleted === "true" || is_deleted === true) {
        whereClause.is_deleted = true;
    } 
    else if (is_deleted === "false" || is_deleted === false) {
        whereClause.is_deleted = false;
    } 
    else {
        return {
        success: false,
        message: "Invalid `is_deleted` value. Must be true or false."
        };
    }
    }

    const result = await Result.findAll({
        where: whereClause,
        attributes: [
            "result_id",
            "patient_id",
            "billing_item_id",
            "test_type_id",
            "created_by",
            "result_data",
            "status",
            "created_at",
            "updated_at"
        ],
        include: [
            {
                model: Patient,
                as: "patient",
                attributes: [
                    "patient_id",
                    "first_name",
                    "last_name",
                    "birthdate"
                ],
            },
            {
                model: TestTypes,
                as: "TestType",
                attributes: [
                    "test_type_id",
                    "test_type_name",
                    "description"
                ],
            },
            {
                model: BillingItem,
                as: "billingItem",
                attributes: [
                    "billing_item_id",
                    "billing_id",
                    "service_id",
                    "description",
                    "quantity",
                    "unit_price",
                    "subtotal",
                    "created_by",
                    "created_at",
                    "updated_at",
                ],
            }
        ],
    });

    return {
        success: true,
        count: result.length,
        data: result.map(results=> results.get({ plain: true }))
    };
}

async function getResultByIdService(result_id) {

    if (!isValidUUID(result_id)) return { success: false, message: "Invalid result ID." };

    const result = await Result.findByPk(result_id, {
        attributes: [
            "result_id",
            "patient_id",
            "billing_item_id",
            "test_type_id",
            "created_by",
            "result_data",
            "status",
            "created_at",
            "updated_at"
        ],
        include: [
            {
                model: Patient,
                as: "patient",
                attributes: [
                    "patient_id",
                    "first_name",
                    "last_name",
                    "birthdate"
                ],
            },
            {
                model: TestTypes,
                as: "TestType",
                attributes: [
                    "test_type_id",
                    "test_type_name",
                    "description"
                ],
            },
            {
                model: BillingItem,
                as: "billingItem",
                attributes: [
                    "billing_item_id",
                    "billing_id",
                    "service_id",
                    "description",
                    "quantity",
                    "unit_price",
                    "subtotal",
                    "created_by",
                    "created_at",
                    "updated_at",
                ],
            }
        ],
    });

    if(!result) return {success: false, message: "Result not found."};

    return {
        success: true,
        data: result.get({ plain: true })
    };
}

async function updateResultService(result_id, updateField) {

    if (!isValidUUID(result_id)) {
        return { success: false, message: "Invalid result ID." };
    } 

    const existingResult = await Result.findOne({ where: { result_id}});

    if(!existingResult) {
        return { success: false, message: "Result not found."};
    }

    const update = {};

    const allowedFields = [
        "result_data",
        "status",
        "initial_result_by",
        "initial_result_at",
        "final_result_by",
        "final_result_at"
    ];

    for (const field of allowedFields) {
        const value = updateField[field];
        if (value === undefined || value === null) continue;

        if (typeof value === "string") {
            update[field] = value.trim();
        } else if (typeof value === "number") {
            if (!isNaN(value) && value >= 0) {
                update[field] = value;
            }
        } else if (typeof value === "object") {
            update[field] = value;
        }
    }
        
        if (update.result_data) {
            if (
                typeof update.result_data !== "object" ||
                update.result_data === null ||
                Array.isArray(update.result_data) ||
                Object.keys(update.result_data).length === 0
            ) {
                return { success: false, message: "Invalid format for result_data." };
            }
        }


        const allowedStatus = ["Pending", "Reviewed", "Approved", "Completed"];

        if (update.status !== undefined) {
            if (!allowedStatus.includes(update.status)) {
                return { success: false, message: "Invalid status value." };
            }
        }


        if (update.initial_result_at) {
            const result = validateAndParseDate(update.initial_result_at, "initial_result_at");
            if (result.error) return { success: false, message: result.error };
            update.initial_result_at = result.parsed;
        }

        if (update.final_result_at) {
            const result = validateAndParseDate(update.final_result_at, "final_result_at");
            if (result.error) return { success: false, message: result.error };
            update.final_result_at = result.parsed;
        }

        if (update.initial_result_by) {
        if (!isValidUUID(update.initial_result_by)) {
            return { success: false, message: "Invalid initial_result_by ID." };
        }

        if (!update.initial_result_at) {
            update.initial_result_at = new Date();
        }

        const staff = await Staff.findByPk(update.initial_result_by);
        if (!staff) {
            return { success: false, message: "Initial result staff not found." };
        }
        }

        if (update.final_result_by) {
        if (!isValidUUID(update.final_result_by)) {
            return { success: false, message: "Invalid final_result_by ID." };
        }
        if (!update.final_result_at) {
            update.final_result_at = new Date();
        }

        const staff = await Staff.findByPk(update.final_result_by);
        if (!staff) {
            return { success: false, message: "Final result staff not found." };
        }
        }
        

        if (Object.keys(update).length === 0) {
            return { success: false, message: "No fields provided to update" };
        }

        const updateResult = await Result.update(update, {
            where: { result_id }
        });

        const refreshedResult = await Result.findByPk(result_id);

        const plain = refreshedResult.get({ plain: true});
        plain.initial_result_at = formatToPh(plain.initial_result_at);
        plain.final_result_at = formatToPh(plain.final_result_at);

        return { 
            success: true,
            message: "Result updated successful.",
            data: plain
        };

    }     
   
async function toggleResultDeleteService(result_id, is_deleted) {

    if (!isValidUUID(result_id)) 
        return { success: false, message: "Invalid result ID." };

    const result = await Result.findOne({ where: { result_id } });

    if (!result)
        return { success: false, message: "Result not found." };

    const parsedDelete =
        is_deleted === true || is_deleted === "true" ? true :
        is_deleted === false || is_deleted === "false" ? false :
        null;

    if (parsedDelete === null)
        return { success: false, message: "Invalid active value. Must be true or false." };

    if (result.is_deleted === parsedDelete) {
        return {
            success: false,
            message: parsedDelete
                ? "Result is already deleted"
                : "Result is already active"
        };
    }

    result.is_deleted = parsedDelete;
    await result.save();

    return {
        success: true,
        message: parsedDelete ? "Result deleted." : "Result restored.",
        data: result.get({ plain: true })
    };
}



module.exports = {
    createResultService,
    getAllResultService,
    getResultByIdService,
    updateResultService,
    toggleResultDeleteService
}