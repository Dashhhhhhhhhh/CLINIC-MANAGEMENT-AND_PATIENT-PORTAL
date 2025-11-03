const { Patient } = require("../models/patientModel");
const { Billing } = require("./billingMainModel");
const { BillingItem } = require("./billingItemModel");
const { isValidUUID } = require("../utils/security");

function formatDate(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

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
        created_by
    });
    
    return {
        success: true,
        message: "Billing created successfully",
        billing: bill
    }
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

        if (existingBilling.finalized_at !== null) {
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

        if (!total || total === 0) {
            return { success: false, message: "Cannot finalize billing with no items." }
        }

        const [count, [updatedBilling]] = await Billing.update(
            {
                total_amount: total,
                payment_status: "Paid",
                finalized_at: new Date(),
                finalized_by: updated_by,
                updated_by: updated_by
            },
            { where: { billing_id }, returning: true }
        );

        if (count === 0) {
            return { success: false, message: "Billing not found or update failed." };
        }

        return  {
            success: true,
            message: "Billing finalized successfully.",
            billing: updatedBilling
        }
}

module.exports = {
    createBillService,
    finalizeBillingService,
}