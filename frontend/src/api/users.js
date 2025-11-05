import axios from "./axios";

export async function getAllUsers() {
  try {
        const response = await axios.get("/users");
        console.log(response.data);
    return response.data; 
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; 
  }
}

export async function getUsersById(id) {
    try {
        const response = await axios.get(`/users/${id}`);
        console.log(response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error; 
  }
}

export async function updateUser(id, updatedData) {
    try {
        const response = await axios.patch(`/users/${id}`, updatedData);
        console.log("User updated:", response.data);
        return response.data;
  } catch (error) {
    console.error("Error updating user:", error);
    throw error; 
  }
}

export async function toggleActiveUser(id, newStatus) {
    try {
        const response = await axios.patch(`/users/${id}/status`, { active: newStatus });
        console.log("Status updated:", response.data);
        return response.data;
  } catch (error) {
    console.error("Error toggling user status:", error);
    throw error; 
  }
}