const { isValidUUID } = require("../utils/security");
const authMiddleware = require("../middleware/authMiddleware");
const { createBillService, finalizeBillingService  } = require("../billing/billingMainService");
const { Billing, createBilling, getAllBilling, getBillingById, getBillingByPatientId, toggleDeletebilling} = require("../billing/billingMainModel");


async function createBillingController(req, res) {
  try {
    const { patient_id } = req.body;

    const created_by = req.staff?.id;

  
  const createBill = await createBillService(patient_id, created_by);

    return res.status(201).json({
      success: true,
      message: "Bill created successfully",
      result: createBill
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

async function getAllBillController (req, res) {
    try {

        const billingResult = await getAllBilling();

        return res.status(200).json({
            success: true,
            billing: billingResult
        })


  } catch (err) {
    console.error("Error fetching billing results.", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}
 
async function getBillingByIdController (req, res) {
    try {

        const { id } = req.params;

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const billing = await getBillingById(id);

    if (!billing) {
        return res.status(404).json({ success: false, message: "Billing record not found" });
    }
            return res.status(200).json({
            success: true,
            billing: billing
        });

  } catch (err) {
    console.error("Error in getting billing result by ID:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function getBillingByPatientIdController(req, res) {
    try {

        const { patient_id } = req.params;

    if (!isValidUUID(patient_id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

        const bills = await getBillingByPatientId(patient_id);

        if (bills.length === 0) {
            return res.status(404).json({ success: false, message: "No billing records found for this patient." });           
        }
        
        res.status(200).json({ success: true, billing: bills });

  } catch (err) {
    console.error("Error in getting billing result by patient ID:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function toggleDeletebillingController (req, res) {
    try {
        
        const { id } = req.params;
      
        const updated_by = req.user.id;      

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, error: "Invalid UUID" });
    }

    const billing = await toggleDeletebilling(id, updated_by);

    if (!billing) {
      return res.status(404).json({ success: false, error: "Billing not found."});
    }
    
    return res.status(200).json({
      success: true,
      message: billing.is_deleted ? "Billing deleted." : "Billing restored.",
      billing,
    });

  } catch (err) {
    console.error("Error in toggle delete billing:", err);
    return res.status(500).json({ success: false, error: "Internal server error" });
  }
}

async function finalizeBillingController (req, res) {
  try {

    const { id } = req.params;

    const updated_by = req.user.id;

    if (!isValidUUID(id)) {
        return res.status(400).json({ success: false, message: "Invalid UUID" });
    }

    const billing = await finalizeBillingService(id, updated_by);

    if (!billing.success) {
        if (billing.message === "Billing not found.") {
            return res.status(404).json(billing);
        }
        return res.status(400).json(billing);
    } 

        return res.status(200).json({ 
          success: true,
          message: billing.message,
          billing: billing.billing
         });

    } catch (error) {
        return res.status(error.status || 500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

module.exports = {
    createBillingController,
    getAllBillController,
    getBillingByIdController,
    getBillingByPatientIdController,
    toggleDeletebillingController,
    finalizeBillingController
}