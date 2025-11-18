const { isValidUUID } = require("../../utils/security");
const { Patient } = require("../patients/patients.model")
const { Billing } = require("../billingMain/billingMain.model");
const { Staff } = require("../staff/staff.model")
const { getUTC } = require("../../utils/datetime");

async function createBillService(patient_id, created_by) {
    

    if (!created_by || !isValidUUID(created_by)) {
      return { success: false, message: "Staff not authenticated or invalid ID" };
    }

    if (!patient_id || !isValidUUID(patient_id)) {
      return { success: false, message: "Invalid or missing patient_id" }
    }

    const patient = await Patient.findOne({
        where: { patient_id: patient_id }
    });

    if (!patient) {
        return { success: false, message: "Patient not found" };
    }

    const total_amount = 0;
    const payment_status = "pending";

    const bill = await Billing.create({ 
        patient_id,
        total_amount,
        payment_status,
        created_by,
        created_at: getUTC(),
        updated_at: getUTC()
    });
    
    return {
        success: true,
        message: "Billing created successfully",
        billing: bill
    }
}

async function getAllBillingMainService(is_deleted) {
    
    const whereClause = {};

    if (is_deleted !== undefined) whereClause.is_deleted = is_deleted;

    const result = await Billing.findAll({
        where: whereClause,
        attributes: [
                "billing_id",
                "total_amount",
                "payment_status",
                "created_at",
                "updated_at",
                "finalized_at"
        ],
        include: [
            {
                model: Patient,
                as: "patient",
                attributes: ["patient_id", "first_name", "middle_initial", "last_name" ]
            },
            {
                model: Staff,
                as: "created_by_staff",
                attributes: ["staff_id", "first_name", "last_name"],
            },
        ],
    });

    return {
         success: true,
         billingList: result.map(result => result.get({ plain: true }))
    };
}

async function getBillingByIdService(billing_id) {

    if (!isValidUUID(billing_id)) {
        return { success: false, error: "Invalid billing ID." };
    }

        const billing = await Billing.findByPk(billing_id, {
            attributes: [
                "billing_id",
                "total_amount",
                "payment_status",
                "created_at",
                "updated_at",
                "finalized_at"
            ],
            include: [
                {
                    model: Patient,
                    as: "patient",
                    attributes: ["patient_id", "first_name", "middle_initial", "last_name" ]
                },
                {
                    model: Staff,
                    as: "created_by_staff",
                    attributes: ["staff_id", "first_name", "last_name"],
                },
            ],
        });

        if(!billing) return { success: false, message: "Billing not found."};

        return {
            success: true,
            billing: billing.get({ plain: true })
        };
    }


async function toggleDeleteBillingService (billing_id, updated_by) {

    if (!isValidUUID(billing_id)) {
        return { success: false, error: "Invalid billing ID." };
    }

    const billing = await Billing.findOne({ where: { billing_id: billing_id }});

    if(!billing) return { success: false, message: "Billing not found." };

    billing.updated_by = updated_by;
    billing.updated_at = getUTC();
    billing.is_deleted = !billing.is_deleted;
    await billing.save();

    return {
        success: true,
        message: billing.is_deleted
            ? "Billing deleted successfully."
            : "Billing restored successfully.",
        billing: billing.get({ plain: true })
    };
}


async function finalizeBillingService(billing_id, updated_by) {

        if (!isValidUUID(billing_id)) {
            return ({ success: false, error: "Invalid UUID" });
        }

        const existingBilling = await Billing.findOne({
            where: { billing_id: billing_id}
        });

        if (!existingBilling) {
            return { success: false, message: "Billing not found." };
        }

        if (existingBilling.is_deleted === true) {
            return { success: false, message: "Billing is already deleted."}
        }

        if (existingBilling.finalized_at) {
            return { success: false, message: "Billing is already finalized cannot be modified."}
        }

        const itemCount = await BillingItem.count({
            where: { billing_id, is_deleted: false }
        });

        if (itemCount === 0) {
            return { success: false, message: "No items in this billing." }
        }

        const total = await BillingItem.sum('subtotal', {
            where: { billing_id, is_deleted: false }
        });

        if (!total) {
            return { success: false, message: "Cannot finalize billing with no items." }
        }

        const [count, [updatedBilling]] = await Billing.update(
            {
                total_amount: total,
                payment_status: "paid",
                finalized_at: getUTC(),
                finalized_by: updated_by,
                updated_by: updated_by,
                updated_at: getUTC()
            },
            { where: { billing_id }, returning: true }
        );

        if (count === 0) {
            return { success: false, message: "Billing not found or update failed." };
        }

        return  {
            success: true,
            message: "Billing finalized successfully.",
            billing: updatedBilling.get({ plain:true})
        };
}

module.exports = {
    createBillService,
    getAllBillingMainService,
    getBillingByIdService,
    toggleDeleteBillingService,
    finalizeBillingService,
}