// src/axiosConfig.js
import axios from "axios";
import { navigate } from "./NavigationService"; // adjust the path as needed

const axiosInstance = axios.create({
  baseURL: "http://173.249.1.220/api",
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log(
        error.response ? error.response.data : "Error: Network Error"
      );
      localStorage.removeItem("access");
      navigate("/"); // Uses the stored navigate function
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
