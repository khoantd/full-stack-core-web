import axiosClient, { removeStoredTokens, setStoredTokens } from "@/api/axiosClient";
import { clearAuthSessionCookies, syncAuthSessionCookies } from "@/lib/auth-cookies";
import type { LoginRequest, LoginResponse, CreateUserRequest, User } from "@/api/types";

export { syncAuthSessionCookies } from "@/lib/auth-cookies";

// Hỗ trợ nhiều format response - token có thể là string hoặc object { token, accessToken, ... }
function toTokenString(val: unknown): string | null {
  if (typeof val === "string" && val.length > 0) return val;
  if (val && typeof val === "object") {
    const obj = val as Record<string, unknown>;
    const s =
      (obj.token as string) ??
      (obj.accessToken as string) ??
      (obj.access_token as string);
    return typeof s === "string" && s.length > 0 ? s : null;
  }
  return null;
}

function extractToken(data: Record<string, unknown>, key: string = "token"): string | null {
  if (key === "refreshToken") {
    return (data.refreshToken as string) ?? (data.refresh_token as string) ?? ((data.data as Record<string, unknown>)?.refreshToken as string) ?? null;
  }
  const candidates = [
    data.accessToken,
    data.access_token,
    data.token,
    (data.data as Record<string, unknown>)?.accessToken,
    (data.data as Record<string, unknown>)?.access_token,
    (data.data as Record<string, unknown>)?.token,
  ];
  for (const c of candidates) {
    const token = toTokenString(c);
    if (token) return token;
  }
  return null;
}

export const authService = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await axiosClient.post<LoginResponse>("/auth/login", data);
    const dataObj = response.data as unknown as Record<string, unknown>;
    const token = extractToken(dataObj);
    const refreshToken = extractToken(dataObj, "refreshToken");

    if (token) {
      if (refreshToken) {
        setStoredTokens(token, refreshToken);
      } else {
        setStoredTokens(token);
      }
      syncAuthSessionCookies(token, refreshToken);
    } else {
      throw new Error("Token không tồn tại trong response API");
    }
    return response.data;
  },

  register: async (data: CreateUserRequest): Promise<User> => {
    const payload = {
      ...data,
      securityConfirmed: true, // Backend required to succeed registration
    };
    const response = await axiosClient.post<User>("/auth/create", payload);
    return response.data;
  },

  logout: () => {
    removeStoredTokens();
    // Clear cookies too
    clearAuthSessionCookies();
  },

  forgotPassword: async (email: string): Promise<{ message: string }> => {
    const response = await axiosClient.post("/auth/forgot-password", { email });
    return response.data;
  },

  resetPassword: async (token: string, password: string): Promise<{ message: string }> => {
    const response = await axiosClient.post("/auth/reset-password", { token, password });
    return response.data;
  },
};
