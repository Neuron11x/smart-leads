import axios from "axios";

// In dev: Vite proxy rewrites "/api" -> "http://localhost:5000/api"
// In production: set VITE_API_URL=https://your-backend.vercel.app/api in Vercel env settings
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

// Create axios instance with base URL
const api = axios.create({
  baseURL: BASE_URL,
});

// Automatically attach token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors - auto logout if token expired
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
