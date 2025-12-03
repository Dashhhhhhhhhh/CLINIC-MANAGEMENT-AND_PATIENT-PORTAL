import api from './axios';

export async function createBillingItem(payload) {
  try {
    console.log('BillingItem service loaded');

    const response = await api.post('/billing-item', payload);
    console.log('Billing item created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating billing item.', error);
    throw error;
  }
}

export async function getAllBillingItem() {
  try {
    const response = await api.get('/billing-item');
    console.log('Fetched billing item:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching billing item.', error);
    throw error;
  }
}

export async function getBillingItemById(billing_item_id) {
  try {
    const response = await api.get(`/billing/${billing_item_id}`);
    console.log('Fetched billing item', response.data);
  } catch (error) {
    console.error('Error fetching billing item.', error);
    throw error;
  }
}

export async function getBillingItemsByBillingId(billing_item_id) {
  try {
    const response = await api.get(`/billing-item/billing/${billing_item_id}`);
    console.log('Fetched billing items', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching billing items.', error);
    throw error;
  }
}

export async function updateBillingItem(billing_item_id, updatedData) {
  try {
    const response = await api.patch(`/billing-item/${billing_item_id}/`, updatedData);
    console.log('Billing item updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating billing.', error);
    throw error;
  }
}

export async function toggleDeleteBillingItem(billing_item_id, is_deleted) {
  try {
    const response = await api.patch(`/billing-item/${billing_item_id}/toggle-delete`, {
      is_deleted,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating billing.', error);
    throw error;
  }
}
