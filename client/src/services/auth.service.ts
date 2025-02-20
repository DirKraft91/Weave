import { cookieService } from './cookie.service';

interface LoginCredentials {
  signer: string;
  public_key: string;
  signature: string;
  message: string;
}

interface AuthResponse {
  success: boolean;
  message?: string;
  data?: {
    accessToken: string;
    refreshToken: string;
  };
}

class AuthService {
  private static instance: AuthService;
  private readonly ACCESS_TOKEN_KEY = 'access_token';
  private readonly REFRESH_TOKEN_KEY = 'refresh_token';

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
    cookieService.set(this.ACCESS_TOKEN_KEY, accessToken, 1); // 1 day
    cookieService.set(this.REFRESH_TOKEN_KEY, refreshToken, 7); // 7 days
  }

  private clearTokens(): void {
    cookieService.delete(this.ACCESS_TOKEN_KEY);
    cookieService.delete(this.REFRESH_TOKEN_KEY);
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch('http://localhost:8080/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          signer: credentials.signer,
          public_key: credentials.public_key,
          signature: credentials.signature,
          message: credentials.message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Authentication failed',
        };
      }

      if (data.accessToken && data.refreshToken) {
        this.setTokens(data.accessToken, data.refreshToken);
      }

      return {
        success: true,
        message: 'Successfully logged in',
        data: {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        message: (error as Error).message,
      };
    }
  }

  async refreshTokens(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        return false;
      }

      const response = await fetch('http://localhost:8080/auth/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearTokens();
          console.log('Session expired');
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

  async logout(): Promise<void> {
    try {
      const refreshToken = this.getRefreshToken();

      if (refreshToken) {
        await fetch('http://localhost:8080/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${refreshToken}`,
          },
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearTokens();
    }
  }
}

export const authService = AuthService.getInstance();
