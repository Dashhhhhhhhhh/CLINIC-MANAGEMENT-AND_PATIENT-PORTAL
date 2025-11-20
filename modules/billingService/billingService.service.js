const { isValidUUID } = require("../../utils/security");
const { BillingService } = require("./billingService.model");
const { formatToPh } = require("../../utils/datetime");

async function createBillingServiceService(service_name, description, default_price, category, is_active) {

        const trimServiceName = service_name.trim() || null;
        const trimDescription = description?.trim();
        const trimCategory = category?.trim();


    if (!trimServiceName) {
        return { success: false, message: "Service name must be provided." };
    }

    const existingServiceName = await BillingService.findOne({where: { service_name: trimServiceName, is_deleted: false }});

    if (existingServiceName) {
        return { success: false, message: "Service name already exist."};
    }


    if (trimDescription && trimDescription.length > 250) {
        return { success: false, message: "Description must not exceed 250 characters." };
    }

    if(!default_price) {
        return { success: false, message: "Default price must be provided."};
    }

    if (isNaN(default_price)) {
        return { success: false, message: "Default price must be a valid number." };
    }

    if (Number(default_price) < 0) {
        return{ success: false, message: "Default price cannot be negative."};
    }

    if (trimCategory && trimCategory.length > 50) {
        return { success: false, message: "Category must not exceed 50 characters."};
    }  
     
    const billingService = await BillingService.create({
        service_name: trimServiceName,
        description: trimDescription,
        default_price,
        category: trimCategory,
        is_active,
    });


    return {
        success: true,
        message: "Billing service created successfully.",
        service: billingService.get({plain: true})
    };

}

async function getAllBillingServiceService(is_deleted) {

    const whereClause = {};

    if (is_deleted !== undefined) whereClause.is_deleted = is_deleted;

    const billingService = await BillingService.findAll({
        where: whereClause,
        attributes:[
            "service_id",
            "service_name",
            "description",
            "default_price",
            "category",
            "is_active",
            "is_deleted",
            "created_at",
            "updated_at"
        ],
    });

    return {
        success: true,
        billingService: billingService.map(service => service.get ({ plain: true}))
    };
}

async function getBillingServiceByIdService(service_id) {

    if (!isValidUUID(service_id)) {
        return { success: false, error: "Invalid Service ID" };
    }

    const billingService = await BillingService.findByPk(service_id, {
        attributes:[
            "service_id",
            "service_name",
            "description",
            "default_price",
            "category",
            "is_active",
            "is_deleted",
            "created_at",
            "updated_at"
        ],
    });

    if (!billingService) return { success: false, message: "Billing service not found."};

    return {
        success: true,
        billingService: billingService.get({ plain: true })
    };
}

async function updateServiceService (service_id, updateField) {

    if (!isValidUUID(service_id)) {
        return { success: false, message: "Invalid billing service ID."};
    }

    const existingServiceId = await BillingService.findOne({ where: {service_id}});

        if(!existingServiceId) {
            return { success: false, message: "Service not found" };
        }

        if (existingServiceId.is_deleted === true) {
            return { success: false, message: "Service is already deleted."}
        }

        const update = {};

        const allowedFields = [
            "service_name",
            "description",
            "default_price",
            "category",
        ];

        for (const field of allowedFields) {
        let value = updateField[field];
        if (value === undefined || value === null) continue;

        let trimmed;

        if (typeof value === 'string') {
            const trimmedValue = value.trim();
            if (trimmedValue === "") return { success: false, message: "Input must not be empty."}
            trimmed = trimmedValue;
        } else if (typeof value === 'number') {
            if (isNaN(value) || value < 0)  return { success: false, message: "Input must be a valid non negative number."};
            trimmed = value;
        } else {
            continue;
        }

        update[field] = trimmed;
        }
        
    if (update.service_name) {
        if (update.service_name && update.service_name.length > 50) {
            return { success: false, message: "Service name must not exceed 50 characters." };
        }        
    }

    if (update.description) {
        if(update.description && update.description.length > 250) {
            return { success: false, message: "Description must not exceed 250 characters."};
        }
    }

    if(update.default_price !== undefined) {
        const up = Number(update.default_price);
        if(isNaN(up) || up < 0 || !Number.isInteger(up)) {
            return { success: false, message: "Default price must be a non-negative integer."};
        }
    }

    if(update.category) {
        if (update.category && update.category.length > 50) {
            return { success: false, message: "Category must not exceed 50 characters."};
        }  
    }

    if (Object.keys(update).length === 0) {
        return { success: false, message: "No fields provided to update" };
    }

    const [affected] = await BillingService.update(update, {
        where: { service_id }
    });

    if (affected === 0) return { success: false, message: "No changes detected"};

    const refreshedService = await BillingService.findByPk  (service_id);

    const plain = refreshedService.get({ plain: true });
    plain.created_at = formatToPh(plain.created_at);
    plain.updated_at = formatToPh(plain.updated_at);

    return {
        success: true,
        message: "Service updated successfully.",
        billingService: plain
    };
}

async function toggleDeleteServicService (service_id) {

    if (!isValidUUID(service_id)) {
        return { success: false, error: "Invalid service ID." };
    }

    const service = await BillingService.findOne({ where: { service_id: service_id }});

    if(!service) return { success: false, message: "Service not found"};

    service.updated_at = formatToPh();
    service.is_deleted = !service.is_deleted;
    await service.save();

    return {
        success: true,
        message: service.is_deleted
            ? "Service deleted successfully."
            : "Service restored successfully.",
        service: service.get({ plain: true })
    };
}
module.exports ={
    createBillingServiceService,
    getAllBillingServiceService,
    getBillingServiceByIdService,
    updateServiceService,
    toggleDeleteServicService
};