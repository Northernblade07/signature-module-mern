// src/utils/api.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.PROD ? "" : "http://localhost:4000",
  withCredentials: false,
});

export default api;
