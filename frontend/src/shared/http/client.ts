import axios from "axios";
import type { AxiosError, AxiosRequestConfig } from "axios";

type RetryableConfig = AxiosRequestConfig & { _retry?: boolean };

const baseURL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export const httpClient = axios.create({
  baseURL,
  timeout: 10000,
});

let refreshingPromise: Promise<boolean> | null = null;

httpClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("sf_access_token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableConfig;

    if (error.response?.status !== 401 || !originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (!refreshingPromise) {
      refreshingPromise = refreshSession();
    }

    const refreshed = await refreshingPromise;
    refreshingPromise = null;

    if (!refreshed) {
      localStorage.removeItem("sf_access_token");
      localStorage.removeItem("sf_refresh_token");
      localStorage.removeItem("sf_user");
      return Promise.reject(error);
    }

    return httpClient(originalRequest);
  }
);

async function refreshSession() {
  const refreshToken = localStorage.getItem("sf_refresh_token");

  if (!refreshToken) {
    return false;
  }

  try {
    const { data } = await axios.post<{ accessToken: string; refreshToken?: string }>(`${baseURL}/auth/refresh`, {
      refreshToken,
    });

    localStorage.setItem("sf_access_token", data.accessToken);
    if (data.refreshToken) {
      localStorage.setItem("sf_refresh_token", data.refreshToken);
    }

    return true;
  } catch {
    return false;
  }
}
