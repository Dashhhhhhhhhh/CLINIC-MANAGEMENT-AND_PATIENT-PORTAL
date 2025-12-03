import api from './axios';

export async function createBillService(payload) {
  try {
    const response = await api.post('/billing-service', payload);
    console.log('Billing service created:', response.data);
  } catch (error) {
    console.error('Error creating billing service', error);
    throw error;
  }
}

export async function getAllBillingService() {
  try {
    const response = await api.get('/billing-service');
    console.log('Fetched Billing:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching billing service.', error);
    throw error;
  }
}

export async function getBillingServiceById(service_id) {
  try {
    const response = await api.get(`/billing-service/${service_id}`);
    console.log('Fetched Billing', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching billing service.', error);
    throw error;
  }
}

export async function updatedBillingService(service_id, updatedData) {
  try {
    const response = await api.patch(`/billing-service/${service_id}`, updatedData);
    console.log('Billing service:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Updating billing service.', error);
    throw error;
  }
}

export async function toggleStatusBillingService(service_id, is_deleted) {
  try {
    const response = await api.patch(`billing-service/${service_id}/toggle-delete`, {
      is_deleted,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating billing service status:', error);
    throw error;
  }
}
