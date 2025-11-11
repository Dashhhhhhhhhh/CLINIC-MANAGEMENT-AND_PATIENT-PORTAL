import api from "./axios";

export async function getAvailableSpecializations () {
    try {

        const response = await api.get("/specializations/available");
        return response.data;
        
      } catch (error) {
      console.error("Error fetching specializations:", error);
      throw error; 
    }
}