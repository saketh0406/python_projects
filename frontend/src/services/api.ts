import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000",
});

// Automatically attach token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers["Authorization"] = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/login", {
      email,
      password
    }); // JSON body
    return response.data; // this contains id, name, email, role
  } catch (err: any) {
    console.error("Login API error:", err.response?.data || err);
    throw err;
  }
};

export default api;
