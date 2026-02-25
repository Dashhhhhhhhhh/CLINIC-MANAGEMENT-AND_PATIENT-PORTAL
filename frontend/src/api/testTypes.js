import api from './axios';

export async function getAllTestTypes() {
  try {
    const response = await api.get(`/test-types/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching test types.', error);
    throw error;
  }
}

export async function createHematology(payload) {
  try {
    const response = await api.post('/hematology', payload);
    console.log('Hematology created.', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating hematology result:', error);
    throw error;
  }
}

export async function updateHematology(hematology_id, payload) {
  try {
    const response = await api.patch(`/hematology/${hematology_id}`, payload);
    console.log('Hematology updated.', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating hematology:', error);
    throw error;
  }
}

export async function createUrinalysis(payload) {
  try {
    const response = await api.post('/urinalysis', payload);
    console.log('Urinalysis created.', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating urinalysis result:', error);
    throw error;
  }
}

export async function updateUrinalysis(urinalysis_id, payload) {
  try {
    const response = await api.patch(`/urinalysis/${urinalysis_id}`, payload);
    console.log('Hematology updated.', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating urinalysis:', error);
    throw error;
  }
}

export async function createUltrasound(payload) {
  try {
    const response = await api.post('/ultrasound', payload);
    console.log('Ultrasound created.', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating ultrasound result:', error);
    throw error;
  }
}

export async function updateUltrasound(ultrasound_id, payload) {
  try {
    const response = await api.patch(`/ultrasound/${ultrasound_id}`, payload);
    console.log('Ultrasound updated.', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating ultrasound result:', error);
    throw error;
  }
}

export async function createXray(payload) {
  try {
    const response = await api.post('/xray', payload);
    console.log('X-ray created.', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating x-ray result:', error);
    throw error;
  }
}

export async function updateXray(xray_id, payload) {
  try {
    const response = await api.patch(`/xray/${xray_id}`, payload);
    console.log('X-ray updated.', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating x-ray:', error);
    throw error;
  }
}
