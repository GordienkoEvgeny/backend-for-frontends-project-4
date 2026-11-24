import debug from "debug";
import axios from "axios";

export const log = debug("page-loader");

// Логгер axios
const axiosLog = debug("axios");

axios.interceptors.request.use((config) => {
  axiosLog(`→ ${config.method.toUpperCase()} ${config.url}`);
  return config;
});

axios.interceptors.response.use(
  (response) => {
    axiosLog(`← ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    axiosLog(`← ОШИБКА ${error.message}`);
    return Promise.reject(error);
  },
);
