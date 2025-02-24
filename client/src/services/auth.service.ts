import { API_URL, AUTH_CONFIG } from '@/config';
import { cookieService } from './cookie.service';

interface LoginCredentials {
  signer: string;
  public_key: string;
  signature: string;
  data: string;
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

  public async prepareAuthData(payload: { signer: string; public_key: string }): Promise<number[]> {
    const response = await fetch(`${API_URL}/auth/prepare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Failed to prepare auth data');
    }

    const data = await response.json();

    return data.data;
  }

  public logout(): void {
    this.clearTokens();
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_URL}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signer: credentials.signer,
          public_key: credentials.public_key,
          signature: credentials.signature,
          data: credentials.data,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Authentication failed');
      }

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

      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearTokens();
          return false;
        }
        return false;
      }

      const data = await response.json();

      if (data.accessToken && data.refreshToken) {
        this.setTokens(data.accessToken, data.refreshToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      return false;
    }
  }
}

export const authService = AuthService.getInstance();
