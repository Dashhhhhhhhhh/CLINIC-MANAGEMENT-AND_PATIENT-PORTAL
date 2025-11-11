import api from "./axios";

export async function getAllUsers() {
  try {
        const response = await api.get("/users");
        console.log("Error fetching users:", response.data);
    return response.data; 
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; 
  }
}

export async function getUsersById(id) {
    try {
        const response = await api.get(`/users/${id}`);
        console.log("Fetched users:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; 
  }
}

export async function updateUser(id, updatedData) {
    try {
        const response = await api.patch(`/users/${id}`, updatedData);
        console.log("User updated:", response.data);
        return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error; 
  }
}

export async function toggleActiveUser(id, newStatus) {
    try {
        const response = await api.patch(`/users/${id}/status`, { active: newStatus });
        console.log("Status updated:", response.data);
        return response.data;
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw error; 
  }
}