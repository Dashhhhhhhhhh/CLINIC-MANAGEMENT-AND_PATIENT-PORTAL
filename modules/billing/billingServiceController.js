const { isValidUUID } = require("../utils/security");
const { BillingService, createBillingService, getAllBillingService, getBillingServiceById, updateService, toggleDeleteService } = require("../billing/billingServiceModel");

async function createBillingServiceController (req, res) {
    try {

        const { 
            service_name,
            description,
            default_price,
            category,
        } = req.body;

        const trimServiceName = service_name.trim() || null;
        const trimDescription = description.trim();
        const trimCategory = category.trim();
        
        if (!trimServiceName) {
          return res.status(400).json({ success: false, message: "Service name is required" });
        }

        if (Number(default_price) < 0) {
            return res.status(400).json({ success: false, message: "Default price cannot be negative. "});
        }

        const createService = await createBillingService({
            service_name: trimServiceName,
            description: trimDescription,
            default_price: default_price,
            category: trimCategory,
        });

        return res.status(200).json({
            success: true,
            message: "Service created successfully",
            createService
        })

  } catch (error) {
    console.error("Error creating bill service:", error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);
    return res.status(500).json({
      success: false,
      error: "Server error while creating bill item."
    });
  }
}

async function getAllBillingServiceController (req, res) {
  try  {
    
    const service = await getAllBillingService();

        return res.status(200).json({
            success: true,
            count: service.length,
            service
        })

  } catch (err) {
    console.error("Error fetching service results.", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getBillingServiceByIdController (req, res) {
  try {

    const { id } = req.params;

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }    

    const service = await getBillingServiceById(id);

    if (!service) {
      return res.status(404).json({ success: false, error: " Service not found" });
    }

    return res.status(200).json({
      success: true,
      count: service.length,
      service
    })

  } catch (err) {
    console.error("Error in getting item result by ID:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updateServiceController (req, res) {
  try {

    const { id } = req.params;

    const updated_by = req.user.id;      

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const update = {};

    const allowedFields = [
      "service_name",
      "description",
      "default_price",
      "category"
    ];

      for (const field of allowedFields) {
        let value = req.body[field];
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

      if (Object.keys(update).length === 0) {
                return res.status(404).json({ success: false, message: "No fields provided to update." });
      }

      update.updated_by = updated_by;

      const service = await updateService(id, update);

      if (!service) {
        return res.status(404).json({ success: false, error: "Item not found" });
      }
     
      return res.status(200).json({ 
        success: true,
        message: "Service updated successfully",
        service
      });

  } catch (err) {
    console.error("Error in updating Service controller", err);
    return res.status(500).json({
      success: false,
      error: "Internal server error."
    });
  }
}

async function toggleDeleteServiceController (req, res) {
  try {

    const { id } = req.params;

    const updated_by = req.user.id; 

    if (!isValidUUID(id)) {
      return res.status(400).json({ success: false, error: "Invalid UUID" });
    }
    
    const service = await toggleDeleteService(id, updated_by);

    if (!service) {
      return res.status(404).json({ success: false, error: "Item not found."});
    }   

    return res.status(200).json({
      success: true,
      message: service.is_deleted ? "Service deleted." : "Service restored.",
      service,
    });

  
  } catch (err) {
    console.error("Error in toggle delete service:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

module.exports = {
  createBillingServiceController,
  getAllBillingServiceController,
  getBillingServiceByIdController,
  updateServiceController,
  toggleDeleteServiceController
};