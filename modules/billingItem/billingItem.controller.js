const {
  createBillingItemService,
  getAllItemService,
  getItemByIdService,
  updateBillingItemService,
  toggleDeletebillingItemService,
  getBillingItemsByBillingIdService,
} = require('./billingItem.service');
const { formatToPh } = require('../../utils/datetime');

async function createBillingItemController(req, res) {
  try {
    const { billing_id, service_id, description, quantity, unit_price, sub_total, created_at } =
      req.body;

    const created_by = req.staff?.staff_id;

    if (!created_by) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: Staff not authenticated',
      });
    }

    const result = await createBillingItemService(
      billing_id,
      service_id,
      description,
      quantity,
      unit_price,
      created_by
    );

    if (!result.success) return res.status(400).json(result);

    const data = result.item;

    data.created_at = formatToPh(data.created_at);
    data.updated_at = formatToPh(data.updated_at);

    return res.status(201).json({
      ...result,
      item: data,
    });
  } catch (error) {
    console.error('Error creating billItem:', error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    return res.status(500).json({
      success: false,
      error: 'Server error while creating bill item',
    });
  }
}

async function getAllItemController(req, res) {
  try {
    const { is_deleted } = req.query;

    const result = await getAllItemService(is_deleted);

    result.billingItems = result.billingItem.map(items => ({
      ...items,
      created_at: formatToPh(items.created_at),
      updated_at: formatToPh(items.updated_at),
    }));

    return res.status(200).json({
      success: true,
      message: 'Billing items retrieved.',
      billingItems: result.billingItems,
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    return res.status(500).json({
      success: false,
      error: 'Server error while fetching item',
    });
  }
}

async function getItemByIdController(req, res) {
  try {
    const { billing_item_id } = req.params;

    const result = await getItemByIdService(billing_item_id);

    if (!result.success)
      return res.status(404).json({ success: false, message: 'Billing Item not found' });

    const item = result.billingItem;
    item.created_at = formatToPh(item.created_at);
    item.updated_at = formatToPh(item.updated_at);

    return res.status(200).json({
      success: true,
      billingItem: item,
    });
  } catch (error) {
    console.error('Error fetching item:', error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    return res.status(500).json({
      success: false,
      error: 'Server error while fetching item',
    });
  }
}

async function updateBillingItemController(req, res) {
  try {
    const { billing_item_id } = req.params;

    const updateField = req.body;

    const result = await updateBillingItemService(billing_item_id, updateField);

    if (!result.success) {
      if (result.message === 'Billing not found') {
        return res.status(404).json(result);
      }
      return res.status(200).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Error updating bill item:', error);
    if (error.errors) console.error(error.errors);
    if (error.parent) console.error(error.parent);

    return res.status(500).json({
      success: false,
      error: 'Server error while updating bill item.',
    });
  }
}

async function toggleDeletebillingItemController(req, res) {
  try {
    const { billing_item_id } = req.params;
    const { billing_id, is_deleted, toggled_by } = req.body;

    const result = await toggleDeletebillingItemService(
      billing_item_id,
      billing_id,
      is_deleted,
      toggled_by
    );

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(error.status || 500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}

async function getBillingItemsByBillingIdController(req, res) {
  const { billing_id } = req.params;

  const result = await getBillingItemsByBillingIdService(billing_id);

  return res.status(200).json({
    success: true,
    message: 'Billing items retrieved successfully',
    count: result.count,
    data: result.billingItems,
  });
}

module.exports = {
  createBillingItemController,
  getAllItemController,
  getItemByIdController,
  updateBillingItemController,
  toggleDeletebillingItemController,
  getBillingItemsByBillingIdController,
};
