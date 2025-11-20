const { Billing } = require("../billingMain/billingMain.model");
const { BillingItem } = require("./billingItem.model");
const { BillingService } = require("../billingService/billingService.model");
const { isValidUUID } = require("../../utils/security");
const { formatToPh } = require("../../utils/datetime");
const { Staff } = require("../staff/staff.model");


async function createBillingItemService(billing_id, service_id, description, quantity, unit_price, created_by) {
    
    const cleanBillingId = billing_id?.trim();
    const cleanCreatedByID = created_by?.trim();
    const cleanServiceId = service_id?.trim();

    let trimDescription = null;

    if (typeof description === "string") {
        trimDescription = description.trim();
    }

    if (description === null || description === undefined || description === "") {
        trimDescription = null;
    } else if (typeof description === "string") {
        trimDescription = description.trim();
    } else {
        return { success: false, message: "Description must be a string"};
    }

    if (!cleanCreatedByID || !isValidUUID(cleanCreatedByID)) {
        return { success: false, message: "Invalid or missing staff ID."};
    }
    
    const existingCreatedBy = await Staff.findOne ({ where: { staff_id: cleanCreatedByID }});

    if(!existingCreatedBy) {
        return { success: false, message: "Invalid created by"};
    }

    if (!cleanBillingId || !isValidUUID(cleanBillingId)) {
        return { success: false, message: "Invalid or missing billing ID." };
    }


    if (!cleanServiceId || !isValidUUID(cleanServiceId)) {
        return { success: false, message: "Invalid or missing service ID." };
    }   

    if (trimDescription && trimDescription.length > 100) {
    return { success: false, message: "Description must not exceed 100 characters." };
    }
    
    if (isNaN(quantity)) {
        return { success: false, message: "Quantity must be a valid number." };
    }
    if (Number(quantity) < 0) {
        return { success: false, message: "Quantity cannot be negative." };
    }
    const normalizeQuantity = Number(quantity);

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
    if (billing.finalized_at) {
        return { success: false, message: "Cannot add items to a finalized billing." };
    }

    const service = await BillingService.findOne({
    where: { service_id: cleanServiceId },
    attributes: ["service_id", "is_deleted", "is_active", "default_price"],
    });

    if (!service) {
        return { success: false, message: "Billing service not found." };
    }
    if (service.is_deleted) {
        return { success: false, message: "Cannot add item to deleted service." };
    }
    if (!service.is_active) {
        return { success: false, message: "Cannot add item to inactive service." };
    }

    if (service.default_price === undefined || service.default_price === null) {
        return { success: false, message: "Unit price is required." };
    }

    if (isNaN(service.default_price)) {
        return { success: false, message: "Unit price must be a valid number." };
    }

    const default_price = Number(service.default_price);

    const roundedUnitPrice = parseFloat(default_price.toFixed(2));
    const computedSubTotal = parseFloat((normalizeQuantity * default_price).toFixed(2));

    

    const item = await BillingItem.create({
        billing_id: cleanBillingId,
        service_id: cleanServiceId,
        description: trimDescription,
        quantity: normalizeQuantity,
        unit_price: roundedUnitPrice,
        subtotal: computedSubTotal,
        created_by: cleanCreatedByID,
        created_at: new Date(),
    });


    const newTotal = await BillingItem.sum("subtotal", {
        where: { billing_id: cleanBillingId, is_deleted: false},
    });


    const roundTotal = Number(newTotal.toFixed(2));

    await Billing.update(
        { total_amount: roundTotal },
        { where: { billing_id: cleanBillingId} }
    );



    return {
        success: true,
        message: "Billing item created successfully",
        updated_total: roundTotal,
        item: item
     };
}


async function getAllItemService(is_deleted) {

    const whereClause = {};

    if (is_deleted !== undefined) whereClause.is_deleted = is_deleted;

    const billingItem = await BillingItem.findAll({
        where: whereClause,
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
            "updated_at"
        ],
        include: [
            {
                model: BillingService,
                as: "service",
                attributes: ["service_id", "service_name", "description", "default_price"],
            },
        ],
    });

    return {
        success: true,
        count: billingItem.length,
        billingItem: billingItem.map(item=> item.get({ plain: true }))
    };
}

async function getItemByIdService (billing_item_id) {

        if (!isValidUUID(billing_item_id)) {
            return { success: false, error: "Invalid billing item ID." };
        }
        
        const billingItem = await BillingItem.findByPk(billing_item_id, {
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
            "updated_at"
        ],
        include: [
            {
                model: BillingService,
                as: "service",
                attributes: ["service_id", "service_name", "description", "default_price"],
            },
        ],
    });

    if (!billingItem) return { success: false, message: "Billing item not found."};

    return {
        success: true,
        count: billingItem.length,
        billingItem: billingItem.get({ plain: true })
    }

}


async function updateBillingItemService (billing_item_id, updateField) {

    if (!isValidUUID(billing_item_id)) {
        return { success: false, message: "Invalid billing item ID." };
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
    
        if (update.service_id) {
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
    }

    if (update.description) {
        if (update.description && update.description.length > 100) {
        return { success: false, message: "Description must not exceed 100 characters." };
        }
    }
       
    if(update.quantity !== undefined) {
        const q = Number(update.quantity);
        if(isNaN(q) || q < 0 || !Number.isInteger(q)) {
            return { success: false, message:"Quantity must be a non-negative integer." }
        }
    }

    if(update.unit_price !== undefined) {
            const up = Number(update.unit_price);
            if(isNaN(up) || up < 0) {
                return { success: false, message: "Unit price must be a non-negative number."};
            }

            if(!/^\d+(\.\d{1,2})?$/.test(update.unit_price.toString())) {
            return { success: false, message: "Unit price may only have up to 2 decimal places." };
        }
    }   
    

    if (Object.keys(update).length === 0) {
        return { success: false, message: "No fields provided to update" };
    }



    if (update.quantity !== undefined || update.unit_price !== undefined) {
        const quantity = update.quantity ?? existingItem.quantity;
        const price = update.unit_price ?? existingItem.unit_price;
        update.subtotal = quantity * price;
    }

    const updatedItem = await BillingItem.update(update, {
        where: { billing_item_id }
    });

    const refreshedItem = await BillingItem.findByPk(billing_item_id);

    const newTotal = await BillingItem.sum("subtotal", {
        where: { billing_id: refreshedItem.billing_id, is_deleted: false }
    });

    const safeTotal = newTotal ? Number(newTotal.toFixed(2)) : 0;

    await Billing.update(
        { total_amount: safeTotal },
        { where: { billing_id: refreshedItem.billing_id } }
    );


    const plain = refreshedItem.get({ plain: true });
    plain.created_at = formatToPh(plain.created_at);
    plain.updated_at = formatToPh(plain.updated_at);


    return {
        success: true,
        message: "Billing item updated successfully",
        billingItem: plain
        };
}

async function toggleDeletebillingItemService(billing_item_id, billing_id, is_deleted, toggled_by) {
        
            
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

        const cleanToggleBy = toggled_by?.trim();

        if(!cleanToggleBy || !isValidUUID(cleanToggleBy)) {
            return { success: false, mesage: "Invalid toggled_by ID."};
        }

        const existingStaff = await Staff.findOne({
            where: { user_id: cleanToggleBy}
        });

        if (!existingStaff) {
            return { success: false, message: "Staff not found."};
        } 

        const staffId = existingStaff.staff_id;

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
        existingItem.updated_at = getUTC();
        

        if (is_deleted) {
            existingItem.deleted_by = staffId;
            existingItem.deleted_at = getUTC();
        } else {
            existingItem.deleted_by = null;
            existingItem.deleted_at = null;
        }
        
        await existingItem.save();


    const newTotal = await BillingItem.sum("subtotal", {
        where: { billing_id, is_deleted: false}
    });

    const safeTotal = newTotal ? Number(newTotal.toFixed(2)) : 0;

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
    updateBillingItemService,
    toggleDeletebillingItemService
}