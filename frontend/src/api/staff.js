import api from "./axios";

export async function createStaff (payload) {
    try{
        const response = await api.post("/staff", payload);
        console.log("Staff created:", response.data);
        return response.data;
  } catch (error) {
    console.error("Error creating staff:", error);
    throw error; 
  }
}

export async function getAllStaff() {
    try {
        const response = await api.get("/staff");
        console.log("Fetched staff:", response.data);
        return response.data;
  } catch (error) {
    console.error("Error fetching staff:", error);
    throw error; 
  }
}

export async function getStaffById(staff_id) {
    try {
        const response = await api.get(`/staff/${staff_id}`);
        console.log("Fetched staff", response.data);
        return response.data;
  } catch (error) {
    console.error("Error creating staff:", error);
    throw error; 
  }
}

export async function updateStaff(staff_id, updatedData) {
    try {
        const response = await api.patch(`/staff/${staff_id}`, updatedData);
        console.log("Staff updated:", response.data);
        return response.data;
  } catch (error) {
    console.error("Error updating staff:", error);
    throw error; 
  }
}

export async function toggleActiveStaff(staff_id, newStatus, active) {
    try {
        const response= await api.patch(`staff/${staff_id}/status`, {active, newStatus});
        return response.data;
  } catch (error) {
    console.error("Error updating staff:", error);
    throw error; 
  }
}

export async function getAvailableUsers() {
  try {
    const response = await api.get("/staff/available-users");
    return response.data;
  } catch (error) {
    console.error("Error fetching available users:", error);
    throw error; 
  }
}


export async function getAvailablePosition() {
    try {
        const response = await api.get("positions/available");
        return response.data;
      } catch (error) {
      console.error("Error fetching available users:", error);
      throw error; 
    }
}