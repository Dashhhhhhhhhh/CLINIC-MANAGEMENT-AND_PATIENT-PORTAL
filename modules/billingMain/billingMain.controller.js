const {
  createBillService,
  getAllBillingMainService,
  getBillingByIdService,
  toggleDeleteBillingService,
  finalizeBillingService,
} = require('../billingMain/billingMain.service');
const { formatToPh } = require('../../utils/datetime');
const { isValidUUID } = require('../../utils/security');

async function createBillingController(req, res) {
  try {
    const { patient_id } = req.body;

    const created_by = req.staff?.staff_id;
    if (!created_by) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Staff not authenticated',
      });
    }

    const result = await createBillService(patient_id, created_by);

    if (!result.success) return res.status(400).json(result);

    const bill = result.billing;

    bill.created_at = formatToPh(bill.created_at);
    bill.updated_at = formatToPh(bill.updated_at);

    return res.status(201).json({
      ...result,
      billing: bill,
    });
  } catch (error) {
    console.error('Error creating bill:', error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    return res.status(500).json({
      success: false,
      error: 'Server error while creating bill',
    });
  }
}

async function getAllBillController(req, res) {
  try {
    const { is_deleted } = req.query;

    const result = await getAllBillingMainService(is_deleted);

    result.billingList = result.billingList.map(bill => ({
      ...bill,
      created_at: formatToPh(bill.created_at),
      updated_at: formatToPh(bill.updated_at),
      finalized_at: bill.finalized_at ? formatToPh(bill.finalized_at) : null,
    }));

    return res.status(200).json({
      ...result,
      billing: result.billingList,
    });
  } catch (err) {
    console.error('Error fetching billing results.', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function getBillingByIdController(req, res) {
  try {
    const { billing_id } = req.params;

    if (!isValidUUID(billing_id)) {
      return res.status(400).json({ success: false, error: 'Invalid billing ID.' });
    }

    const result = await getBillingByIdService(billing_id);

    if (!result.success) return res.status(404).json(result);

    const bill = result.billing;
    bill.created_at = formatToPh(bill.created_at);
    bill.updated_at = formatToPh(bill.updated_at);

    if (bill.finalized_at) bill.finalized_at = formatToPh(bill.finalized_at);

    return res.status(200).json({
      ...result,
      billing: bill,
    });
  } catch (err) {
    console.error('Error in getting billing result by ID:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function toggleDeletebillingController(req, res) {
  try {
    const { billing_id } = req.params;

    const updated_by = req.staff.staff_id;

    if (!isValidUUID(billing_id)) {
      return res.status(400).json({ success: false, error: 'Invalid billing ID.' });
    }

    const result = await toggleDeleteBillingService(billing_id, updated_by);

    if (!result.success) return res.status(404).json(result);

    return res.status(200).json(result);
  } catch (err) {
    console.error('Error in toggle delete billing:', err);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
}

async function finalizeBillingController(req, res) {
  try {
    const { billing_id } = req.params;

    const updated_by = req.staff.staff_id;

    if (!isValidUUID(billing_id)) {
      return res.status(400).json({ success: false, message: 'Invalid UUID' });
    }

    const billing = await finalizeBillingService(billing_id, updated_by);

    if (!billing.success) {
      if (billing.message === 'Billing not found.') {
        return res.status(404).json(billing);
      }
      return res.status(400).json(billing);
    }

    const bill = billing.billing;

    bill.created_at = formatToPh(bill.created_at);
    bill.updated_at = formatToPh(bill.updated_at);
    if (bill.finalized_at) bill.finalized_at = formatToPh(bill.finalized_at);

    return res.status(200).json(billing);
  } catch (error) {
    console.error('Error finalizing bill:', error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    return res.status(500).json({
      success: false,
      error: 'Server error while finalizing bill',
    });
  }
}

module.exports = {
  createBillingController,
  getAllBillController,
  getBillingByIdController,
  toggleDeletebillingController,
  finalizeBillingController,
};
