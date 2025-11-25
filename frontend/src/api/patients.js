import api from './axios';

export async function createPatient(payload) {
  try {
    const formattedConditions =
      payload.conditions.trim() === ''
        ? []
        : payload.conditions
            .split(',')
            .map(c => c.trim())
            .filter(Boolean);
    const finalPayload = {
      ...payload,
      conditions: formattedConditions,
    };

    const response = await api.post('/patients', finalPayload);
    console.log('Patient created', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating patient', error);
    throw error;
  }
}

export async function getAllPatient() {
  try {
    const response = await api.get('/patients');
    console.log('Fetched patient:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Fetching patients', error);
    throw error;
  }
}

export async function getPatientById(patient_id) {
  try {
    const response = await api.get(`/patients/${patient_id}`);
    console.log('Fetched patient', response.data);
    return response.data;
  } catch (error) {
    console.error('Error Fetching patients', error);
    throw error;
  }
}

export async function updatePatient(patient_id, updatedData) {
  try {
    let formattedConditions = [];

    // CASE 1: Already an array
    if (Array.isArray(updatedData.conditions)) {
      formattedConditions = updatedData.conditions;
    }

    // CASE 2: Normal string from textarea (e.g. "asthma, flu")
    else if (typeof updatedData.conditions === 'string') {
      if (updatedData.conditions.trim() === '') {
        formattedConditions = [];
      } else {
        formattedConditions = updatedData.conditions
          .split(',')
          .map(c => c.trim())
          .filter(Boolean);
      }
    }

    // CASE 3: Undefined (user didn't touch conditions)
    else {
      formattedConditions = [];
    }

    const finalPayload = {
      ...updatedData,
      conditions: formattedConditions,
    };

    const response = await api.patch(`/patients/${patient_id}`, finalPayload);
    console.log('patient updated:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating patient:', error);
    throw error;
  }
}

export async function toggleActivePatient(patient_id, newStatus, active) {
  try {
    const response = await api.patch(`patients/${patient_id}/status`, { active, newStatus });
    return response.data;
  } catch (error) {
    console.error('Error toggling status of patients', error);
    throw error;
  }
}

export async function getAvailableUsers() {
  try {
    const response = await api.get('/patients/available-users');
    return response.data;
  } catch (error) {
    console.error('Error fetching available users:', error);
    throw error;
  }
}
