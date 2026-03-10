import axios, { type AxiosError } from "axios";

const TOKEN_KEY = "access_token";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setStoredToken = (token: string): void => {
  if (typeof window === "undefined") return;
  if (typeof token === "string" && token.length > 0) {
    localStorage.setItem(TOKEN_KEY, token);
  }
};

export const removeStoredToken = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
};

const axiosClient = axios.create({
  baseURL: "https://cms-api.haudev.online",
  // baseURL: "http://localhost:3000",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - tự động gắn Authorization header (chỉ dùng khi token là string hợp lệ)
axiosClient.interceptors.request.use(
  (config) => {
    const token = getStoredToken();
    if (token && typeof token === "string" && !token.includes("[object Object]")) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - xử lý 401 và redirect về /login
axiosClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      removeStoredToken();
      // Chỉ redirect khi đang ở client-side
      if (typeof window !== "undefined") {
        const currentPath = window.location.pathname;
        if (!currentPath.includes("/login")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
