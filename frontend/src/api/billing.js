import api from './axios';

export async function createBill(payload) {
  try {
    const response = await api.post('/billing', payload);
    console.log('Billing created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating billing.', error);
    throw error;
  }
}

export async function getAllBilling() {
  try {
    const response = await api.get('/billing');
    console.log('Fetched billing:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching billing.', error);
    throw error;
  }
}

export async function getBillingById(billing_id) {
  try {
    const response = await api.get(`/billing/${billing_id}`);
    console.log('Fetched Billing', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching billing.', error);
    throw error;
  }
}

export async function toggleDeleteBilling(billing_id, is_deleted) {
  try {
    const response = await api.patch(`/billing/${billing_id}/toggle-delete`, {
      is_deleted,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating billing.', error);
    throw error;
  }
}

export async function finalizeBilling(billing_id, updatedData) {
  try {
    const response = await api.patch(`/billing/${billing_id}/finalize`, updatedData);
    console.log('Billing finalized:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating billing.', error);
    throw error;
  }
}

export async function updateBilling(billing_id, updatedData) {
  try {
    const response = await api.patch(`/billing/${billing_id}`, updatedData);
    console.log('Billing updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating billing.', error);
    throw error;
  }
}

export async function getAvailablePatients() {
  try {
    const response = await api.get('/billing/available-patients');
    return response.data;
  } catch (error) {
    console.error('Error fetching available patients:', error);
    throw error;
  }
}
