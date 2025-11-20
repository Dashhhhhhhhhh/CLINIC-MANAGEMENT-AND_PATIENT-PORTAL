const { createBillingServiceService, getAllBillingServiceService, getBillingServiceByIdService, updateServiceService, toggleDeleteServicService} = require("../billingService/billingService.service");
const { formatToPh } = require("../../utils/datetime");
const { isValidUUID } = require("../../utils/security");

async function createBillingServiceController (req, res) {
    try {

        const { 
            service_name,
            description,
            default_price,
            category,
            is_active,
        } = req.body;

    const result = await createBillingServiceService(
      service_name,
      description,
      default_price,
      category,
      is_active,
    );

    if(!result.success) return res.status(400).json(result);

    const service = result.service;
    service.created_at = formatToPh(service.created_at);


    return res.status(201).json({
      ...result,
      service
    });


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
    
    const { is_deleted } = req.query;

    const result = await getAllBillingServiceService(is_deleted);

    result.billingService = result.billingService.map(service => ({
      ...service,
      created_at: formatToPh(service.created_at),
      updated_at: formatToPh(service.updated_at)
    }));

        return res.status(200).json({
          ...result,
          billingService: result.billingService
        });

  } catch (err) {
    console.error("Error fetching service results.", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getBillingServiceByIdController (req, res) {
  try {

    const { service_id } = req.params;

    if (!isValidUUID(service_id)) {
        return res.status(400).json({ success: false, error: "Invalid billing service ID." });
    }    

    const result = await getBillingServiceByIdService(service_id);

    if (!result.success) return res.status(404).json({ success: false, message: "Billing service not found" });


    const service = result.billingService;
    service.created_at = formatToPh(service.created_at);
    service.updated_at = formatToPh(service.updated_at);

    return res.status(200).json({
      ...result,
      billingService: service
    });

  } catch (err) {
    console.error("Error in getting item result by ID:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function updateServiceController (req, res) {
  try {
    
    const { service_id } = req.params;

    const updateField = req.body;

    if (!isValidUUID(service_id)) {
        return res.status(400).json({ success: false, error: "Invalid billing service ID." });
    }  

    const result = await updateServiceService(service_id, updateField);

      if(!result.success) {
        if (result.message === "Service not found") return  res.status(404).json(result);
      }

            return res.status(200).json(result);

    
    
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

    const { service_id } = req.params;

    const result = await toggleDeleteServicService(service_id);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);

  
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