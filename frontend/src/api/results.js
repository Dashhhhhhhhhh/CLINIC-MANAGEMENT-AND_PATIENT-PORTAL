import api from './axios';

export async function createResult(payload) {
  try {
    const response = await api.post('/results', payload);
    console.log('Result created:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error creating result.', error);
    throw error;
  }
}

export async function getResultsList(params = {}) {
  try {
    const response = await api.get('/results', { params });
    console.log('Fetched results', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching result.', error);
    throw error;
  }
}

export async function getResultById(result_id) {
  try {
    const response = await api.get(`/results/${result_id}`);
    console.log('Fetched results', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching result.', error);
    throw error;
  }
}

export async function deleteResult(result_id, is_deleted) {
  try {
    const response = await api.patch(`/results/${result_id}/status`, { is_deleted });
    return response.data;
  } catch (error) {
    console.error('Error deleteing result.', error);
    throw error;
  }
}

export async function updateHematologyResult(hematologyId, payload) {
  try {
    const res = await api.patch(`hematology/${hematologyId}`, payload);

    return {
      success: true,
      message: 'Hematology result updated successfully.',
    };
  } catch (err) {
    return {
      success: false,
      message: err.response?.data?.message || 'Update failed.',
    };
  }
}

export async function getLatestResults(patientId) {
  try {
    const response = await api.get(`/results/latest/${patientId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching latest patient results.', error);
    throw error;
  }
}

export async function getPatientResultHistory(patientId, params) {
  try {
    const response = await api.get(`/results/${patientId}/results`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching all patients results.', error);
    throw error;
  }
}

export async function getWorklistResults(params = {}) {
  try {
    const response = await api.get(`/results/worklist`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching worklist results.', error);
    throw error;
  }
}
