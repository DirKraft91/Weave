import { AUTH_CONFIG } from '@/config';
import { cookieService } from './cookie.service';
import { httpService } from './http.service';
interface LoginCredentials {
  signer: string;
  public_key: string;
  signature: string;
  data: Uint8Array;
}

interface AuthResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

class AuthService {
  private static instance: AuthService;
  private readonly ACCESS_TOKEN_KEY = AUTH_CONFIG.ACCESS_TOKEN_KEY;
  private readonly REFRESH_TOKEN_KEY = AUTH_CONFIG.REFRESH_TOKEN_KEY;

  private constructor() { }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  getAccessToken(): string | null {
    console.log(cookieService.get(this.ACCESS_TOKEN_KEY));
    return cookieService.get(this.ACCESS_TOKEN_KEY);
  }

  getRefreshToken(): string | null {
    return cookieService.get(this.REFRESH_TOKEN_KEY);
  }

  private setTokens(accessToken: string, refreshToken: string): void {
    cookieService.set(this.ACCESS_TOKEN_KEY, accessToken, AUTH_CONFIG.ACCESS_TOKEN_EXPIRY_DAYS);
    cookieService.set(this.REFRESH_TOKEN_KEY, refreshToken, AUTH_CONFIG.REFRESH_TOKEN_EXPIRY_DAYS);
  }

  private clearTokens(): void {
    cookieService.delete(this.ACCESS_TOKEN_KEY);
    cookieService.delete(this.REFRESH_TOKEN_KEY);
  }

  public async prepareAuthData(payload: { signer: string; public_key: string }): Promise<{
    data: Uint8Array;
    signer: string;
  }> {
    try {
      return await httpService.post<{
        data: Uint8Array;
        signer: string;
      }>('/auth/prepare', payload);
    } catch {
      throw new Error('Failed to prepare auth data');
    }
  }

  public logout(): void {
    this.clearTokens();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const data = await httpService.post<{
        access_token: string;
        refresh_token: string;
        success?: boolean;
      }>('/auth', {
        signer: credentials.signer,
        public_key: credentials.public_key,
        signature: credentials.signature,
        data: credentials.data,
      });

      if (data.access_token && data.refresh_token) {
        this.setTokens(data.access_token, data.refresh_token);
      }

      return {
        success: data.success ?? true,
        data: {
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
        },
      };
    } catch (error) {
      throw new Error((error as Error).message || 'Network error occurred');
    }
  }

  async refreshTokens(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        return false;
      }

      const originalHeaders = { ...httpService['axios'].defaults.headers };
      httpService['axios'].defaults.headers.Authorization = `Bearer ${refreshToken}`;

      try {
        const data = await httpService.post<{
          accessToken: string;
          refreshToken: string;
        }>('/auth/refresh');

        if (data.accessToken && data.refreshToken) {
          this.setTokens(data.accessToken, data.refreshToken);
          return true;
        }

        return false;
      } finally {
        httpService['axios'].defaults.headers = originalHeaders;
      }
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      return false;
    }
  }
}

export const authService = AuthService.getInstance();
