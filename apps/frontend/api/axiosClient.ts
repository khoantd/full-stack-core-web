import axios, { type AxiosError } from "axios";
import { syncAuthSessionCookies } from "@/lib/auth-cookies";

const TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const getStoredToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setStoredTokens = (token: string, refreshToken?: string): void => {
  if (typeof window === "undefined") return;
  if (typeof token === "string" && token.length > 0) {
    localStorage.setItem(TOKEN_KEY, token);
  }
  if (refreshToken && typeof refreshToken === "string" && refreshToken.length > 0) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

export const removeStoredTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

const axiosClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001",
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

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

// Response interceptor - xử lý 401 và call refresh token auto
axiosClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as any;

    const isAuthEndpoint = originalRequest?.url?.startsWith("/auth/");
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthEndpoint) {
      if (typeof window === "undefined") return Promise.reject(error);
      
      if (isRefreshing) {
        return new Promise(function(resolve, reject) {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = 'Bearer ' + token;
          return axiosClient(originalRequest);
        }).catch(err => {
          return Promise.reject(err);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        removeStoredTokens();
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      try {
        const res = await axiosClient.post("/auth/refresh", { refreshToken });
        const data = res.data;
        
        if (data.accessToken && data.refreshToken) {
          setStoredTokens(data.accessToken, data.refreshToken);
          syncAuthSessionCookies(data.accessToken, data.refreshToken);
          processQueue(null, data.accessToken);
          originalRequest.headers.Authorization = 'Bearer ' + data.accessToken;
          return axiosClient(originalRequest);
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        removeStoredTokens();
        if (!window.location.pathname.includes("/login")) {
          window.location.href = "/login";
        }
      } finally {
        isRefreshing = false;
      }
    }
    
    return Promise.reject(error);
  }
);

export default axiosClient;
