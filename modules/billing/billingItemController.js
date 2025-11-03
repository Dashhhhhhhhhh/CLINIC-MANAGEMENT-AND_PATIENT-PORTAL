const { isValidUUID } = require("../utils/security");
const { BillingService } = require("../billing/billingServiceModel");
const { createBillingItemService, getAllItemService, getItemByIdService, getItemByPatientIdService, updateBillingItemService, toggleDeletebillingItemService } = require("../billing/billingItemService");

async function createBillingItemController (req, res) {
    try {

const { billing_id, service_id, description, quantity, unit_price } = req.body;

const created_by = req.staff?.id

    const result = await createBillingItemService(
        billing_id,
        created_by,
        service_id,
        description,
        quantity,
        unit_price
    );

    return res.status(201).json({
        success: true,
        message: "Item created successfully",
        data: result
    });

  } catch (error) {
    console.error("Error creating bill:", error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    return res.status(500).json({
      success: false,
      error: "Server error while creating bill"
    });
  }
}

async function getAllItemController (req, res){
    try {

        const result = await getAllItemService();
        
        return res.status(200).json({
            success: true,
            Item: result
        });

    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

async function getItemByIdController (req, res) {
    try {

        const { id } = req.params;

    const result = await getItemByIdService(id);
    
    if(!result.success) return res.status(404).json({ success: false, message: "Billing Item not found" });
    
    return res.status(200).json(result);


  } catch (error) {
    console.error("Error creating bill:", error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    return res.status(500).json({
      success: false,
      error: "Server error while creating bill"
    });
  }
}



async function getItemByPatientIdController (req, res) {
    try {
        const { patient_id } = req.params;

        const result = await getItemByPatientIdService(patient_id); 

        if (!result.success) {
            return res.status(404).json(result);
        }

        return res.status(200).json(result);

  } catch (error) {
    console.error("Error creating bill:", error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    return res.status(500).json({
      success: false,
      error: "Server error while creating bill"
    });
  }
}



async function updateBillingItemController (req, res) {
    try {

        const { id } = req.params;     
    
        const updateField = req.body;

    const updateItem = await updateBillingItemService(id, updateField);

    if (!updateItem.success) {
      return res.status(404).json(updateItem);
    }

    return res.status(200).json(updateItem);

  } catch (error) {
    console.error("Error creating bill:", error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    return res.status(500).json({
      success: false,
      error: "Server error while creating bill"
    });
  }
}


async function toggleDeletebillingItemController (req, res) {
    try {

        const { billing_item_id } = req.params;
        const { billing_id, is_deleted } = req.body;
    
        const result = await toggleDeletebillingItemService(billing_item_id, billing_id, is_deleted);

        if (!result.success) {
            return res.status(404).json(result);
        }       

        return res.status(200).json({ 
            success: true,
            message: result.message,
            data: result.data
         });


    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


module.exports = {
    createBillingItemController,
    getAllItemController,
    getItemByIdController,
    getItemByPatientIdController,
    updateBillingItemController,
    toggleDeletebillingItemController
}
