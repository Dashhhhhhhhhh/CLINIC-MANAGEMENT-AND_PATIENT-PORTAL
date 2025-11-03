const { Billing } = require("./billingMainModel");
const { BillingItem } = require("./billingItemModel");
const { BillingService } = require("./billingServiceModel");
const { isValidUUID } = require("../utils/security");
const { updateRole } = require("../models/roleModel");

async function createBillingItemService(billing_id, created_by, service_id, description, quantity, unit_price) {
    const cleanBillingId = billing_id?.trim();
    const cleanServiceId = service_id?.trim();
    const trimDescription = description?.trim() || null;

    if (!cleanBillingId || !isValidUUID(cleanBillingId)) {
        return { success: false, message: "Invalid or missing billing_id." };
    }
    if (!cleanServiceId || !isValidUUID(cleanServiceId)) {
        return { success: false, message: "Invalid or missing service_id." };
    }   

    if (isNaN(quantity)) {
        return { success: false, message: "Quantity must be a valid number." };
    }
    if (Number(quantity) < 0) {
        return { success: false, message: "Quantity cannot be negative." };
    }

    if (isNaN(unit_price)) {
        return { success: false, message: "Unit price must be a valid number." };
    }
    if (Number(unit_price) < 0) {
        return { success: false, message: "Unit price cannot be negative." };
    }

    const billing = await Billing.findOne({
        where: { billing_id: cleanBillingId },
        attributes: ["billing_id", "is_deleted", "payment_status", "finalized_at"],
    });


    if (!billing) {
        return { success: false, message: "Billing not found." };
    }
    if (billing.is_deleted) {
        return { success: false, message: "Cannot add item to deleted bill." };
    }
    if (billing.finalized_at !== null && billing.finalized_at !== undefined) {
        return { success: false, message: "Cannot add items to a finalized billing." };
    }

    const service = await BillingService.findOne({
        where: { service_id: cleanServiceId },
        attributes: ["service_id", "is_deleted", "is_active"],
    });

    if (!service) {
        return { success: false, message: "Billing service not found." };
    }
    if (service.is_deleted === true) {
        return { success: false, message: "Cannot add item to deleted service." };
    }
    if (!service.is_active) {
        return { success: false, message: "Cannot add item to inactive service." };
    }


    const computedSubTotal = Number(quantity) * Number(unit_price);


    const item = await BillingItem.create({
        billing_id: cleanBillingId,
        service_id: cleanServiceId,
        description: trimDescription,
        quantity,
        unit_price,
        subtotal: computedSubTotal,
        created_by
    });

    const newTotal = await BillingItem.sum("subtotal", {
        where: { billing_id: cleanBillingId, is_deleted: false},
    });

    await Billing.update(
        { total_amount: newTotal },
        { where: { billing_id: cleanBillingId} }
    );


    return {
        success: true,
        message: "Billing item created successfully",
        updated_total: newTotal,
        item: item
     };
}


async function getAllItemService() {

    const item = await BillingItem.findAll({
        attributes: [
            "billing_item_id",
            "billing_id",
            "service_id",
            "description",
            "quantity",
            "unit_price",
            "subtotal",
        ]
    });

    return item;
}

async function getItemByIdService (billing_item_id) {

        if (!isValidUUID(billing_item_id)) {
            return { success: false, error: "Invalid UUID" };
        }

        const item = await BillingItem.findOne({ where: { billing_item_id} });

        if (!item) return { success: false, message: "Billing item not found" };

        return { success: true, item };

}

async function getItemByPatientIdService(patient_id) {

    if (!isValidUUID(patient_id)) {
        return { success: false, message: "Invalid UUID" };
    }

    const item = await BillingItem.findOne(patient_id);

    if (!item) {
        return { success: false, message: "Billing item not found" };
    }

    return { success: true, data: item };
}

async function updateBillingItemService (billing_item_id, updateField) {

    if (!isValidUUID(billing_item_id)) {
        return { success: false, error: "Invalid billing item id." };
    }


    const existingItem = await BillingItem.findOne({ where: { billing_item_id } });

    if (!existingItem) {
        return { success: false, message: "Billing item not found" };
    }

    if (existingItem.is_deleted === true) {
        return { success: false, message: "Cannot update a deleted billing item." };
    }

        const existingBilling = await Billing.findOne({
            where: { billing_id: existingItem.billing_id}
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

        const update = {};

        const allowedFields = [
            "service_id",
            "description",
            "quantity",
            "unit_price",
        ];

        for (const field of allowedFields) {
        let value = updateField[field];
        if (value === undefined || value === null) continue;

        let trimmed;

        if (typeof value === 'string') {
            trimmed = value.trim();
        } else if (typeof value === 'number') {
            if (isNaN(value) || value < 0) continue;
            trimmed = value;
        } else {
            continue;
        }

        update[field] = trimmed;
        }
    
    
    if (!isValidUUID(update.service_id)) {
        return { success: false, error: "Invalid service id." };
    }

    const service = await BillingService.findOne({ where: { service_id: update.service_id } });
    
    if (!service) {
        return { success: false, error: "Service not found." };
    } 
    
    if (service.is_deleted === true) {
        return { success: false, error: "Cannot use deleted service."};
    }

    if (service.is_active === false) {
        return { success: false, error: "Cannot use inactive service."};
    }
    
       
    if ('quantity' in update || 'unit_price' in update) {
        const newQuantity = update.quantity ?? existingItem.quantity;
        const newPrice = update.unit_price ?? existingItem.unit_price;

        update.subtotal = newQuantity * newPrice;
    }



    if (Object.keys(update).length === 0) {
    return { success: false, message: "No fields provided to update" };
    }

    const updatedItem = await BillingItem.update(update, {
        where: { billing_item_id }
    });

    const refreshedItem = await BillingItem.findOne({ where: { billing_item_id } });

    const newTotal = await BillingItem.sum("subtotal", {
        where: { billing_id: refreshedItem.billing_id, is_deleted: false }
    });

    const safeTotal = newTotal ?? 0;

    await Billing.update(
        { total_amount: safeTotal },
        { where: { billing_id: refreshedItem.billing_id } }
    );


    return {
        success: true,
        message: "Billing item updated sucessfully",
        updateField: refreshedItem
        };
}

async function toggleDeletebillingItemService(billing_item_id, billing_id, is_deleted) {

        if (!isValidUUID(billing_item_id)) {
            return ({ success: false, error: "Invalid billing item id" });
        }

        const existingBilling = await Billing.findOne({
            where: { billing_id: billing_id } 
        });

        if (!isValidUUID(billing_id)) {
            return { success: false, error: "Invalid billing id" };
        }

        if (!existingBilling) {
            return { success: false, message: "Billing not found." };
        }

        if (existingBilling.is_deleted === true) {
            return { success: false, message: "Billing is already deleted."}
        }

        if (existingBilling.finalized_at !== null) {
            return { success: false, message: "Billing is already finalized cannot be modified."}
        }

        const existingItem = await BillingItem.findOne({
          where: { billing_item_id: billing_item_id }  
        });

        if (!existingItem) {
            return { success: false, message: "Billing item not found" };
        }

        if (existingItem.billing_id !== billing_id) {
            return { success: false, message: "This billing item does not belong to the provided billing." };
        }

        if (existingItem.is_deleted === is_deleted) {
            return { 
                success: false, 
                message: is_deleted
                    ? "Billing item is already deleted."
                    : "Billing item is already active."
            };
        }
    
    existingItem.is_deleted = is_deleted;
    await existingItem.save();


    const newTotal = await BillingItem.sum("subtotal", {
        where: { billing_id, is_deleted: false}
    });

    const safeTotal = newTotal ?? 0;

    await Billing.update(
        { total_amount: safeTotal },
        { where: { billing_id} }
    );
    
    return {
        success: true,
        message: is_deleted
            ? "Billing item deleted successfully."
            : "Billing item restored successfully.",
        data: existingItem,
        safeTotal
    }
}



module.exports = {
    createBillingItemService,
    getAllItemService,
    getItemByIdService,
    getItemByPatientIdService,
    updateBillingItemService,
    toggleDeletebillingItemService
}