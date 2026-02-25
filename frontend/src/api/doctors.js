import api from './axios';

export async function createDoctor(payload) {
  try {
    const response = await api.post('/doctors', payload);
    console.log('Doctor registered:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating doctor:', error);
    throw error;
  }
}

export async function getAllDoctors(params = {}) {
  try {
    const response = await api.get('/doctors', { params });
    return response.data;
  } catch (error) {
    throw error;
  }
}

export async function getDoctorById(doctorId) {
  try {
    const response = await api.get(`/doctors/${doctorId}`);
    console.log('Fetched doctor:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctors', error);
    throw error;
  }
}

export async function updateDoctor(doctor_id, updatedData) {
  try {
    const response = await api.patch(`/doctors/${doctor_id}`, updatedData);
    console.log('Doctor updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating doctor:', error);
    throw error;
  }
}

export async function toggleActiveDoctor(doctor_id, newStatus) {
  try {
    const response = await api.patch(`/doctors/${doctor_id}/status`, { active: newStatus });

    console.log('Status udpdated', response.data);
    return response.data;
  } catch (error) {
    console.error('Error toggle doctor status:', error);
    throw error;
  }
}

export async function getAvailableDoctorUsers() {
  try {
    const response = await api.get('/doctors/available-users');
    return response.data;
  } catch (error) {
    console.error('Error fetching available users:', error);
    throw error;
  }
}

export async function getAvailableSpecializations() {
  try {
    const response = await api.get('/specializations/available');
    return response.data;
  } catch (error) {
    console.error('Error fetching available specialization:', error);
    throw error;
  }
}
