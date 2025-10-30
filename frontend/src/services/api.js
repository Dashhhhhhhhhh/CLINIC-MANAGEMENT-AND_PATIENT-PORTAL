// src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000/api", // adjust if your backend uses another port
  headers: { "Content-Type": "application/json" },
});

// Optional: add token support later here
export default api;