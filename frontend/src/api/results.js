import api from './axios';

export async function createResult(payload) {
  try {
    const response = await api.post('results', payload);
    console.log('Result created:', response.data);
  } catch (error) {
    console.error('Error creating result.', error);
    throw error;
  }
}

export async function getAllResult() {
  try {
    const response = await api.get('/results');
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
    console.log('PATCH request →', hematologyId, payload);
    const res = await api.patch(`http://localhost:3000/hematology/${hematologyId}`, payload);

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
