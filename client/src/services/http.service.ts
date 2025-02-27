import { API_URL } from '@/config';
import { authStore } from '@/contexts';
import axios, { AxiosInstance } from 'axios';
import { authService } from './auth.service';

class HttpService {
  private static instance: HttpService;
  private axios: AxiosInstance;
  private refreshPromise: Promise<boolean> | null = null;

  private constructor() {
    this.axios = axios.create({
      baseURL: API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.axios.interceptors.request.use((config) => {
      const token = authService.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      if (config.url && !config.url.startsWith('/api') && !config.url.startsWith('http')) {
        config.url = `/api${config.url.startsWith('/') ? '' : '/'}${config.url}`;
      }

      return config;
    });

    this.axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (
          error.response?.status !== 401 ||
          originalRequest._retry ||
          originalRequest.url?.includes('/auth/refresh')
        ) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        try {
          if (!this.refreshPromise) {
            this.refreshPromise = authService.refreshTokens();
          }

          const refreshed = await this.refreshPromise;
          this.refreshPromise = null;

          if (refreshed) {
            const token = authService.getAccessToken();
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.axios(originalRequest);
          } else {
            authStore.clearAuthToken();
            authService.logout();
            return Promise.reject(error);
          }
        } catch (refreshError) {
          this.refreshPromise = null;
          console.error('Error refreshing tokens:', refreshError);
          authStore.clearAuthToken();
          authService.logout();
          return Promise.reject(error);
        }
      },
    );
  }

  public static getInstance(): HttpService {
    if (!HttpService.instance) {
      HttpService.instance = new HttpService();
    }
    return HttpService.instance;
  }

  async get<T, D = unknown>(url: string, data?: D) {
    const response = await this.axios.get<T>(url, { params: data });
    return response.data;
  }

  async post<T, D = unknown>(url: string, data?: D) {
    const response = await this.axios.post<T>(url, data);
    return response.data;
  }

  async put<T, D = unknown>(url: string, data: D) {
    const response = await this.axios.put<T>(url, data);
    return response.data;
  }

  async delete<T>(url: string) {
    const response = await this.axios.delete<T>(url);
    return response.data;
  }
}

export const httpService = HttpService.getInstance();
