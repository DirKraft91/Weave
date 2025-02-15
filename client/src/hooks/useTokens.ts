import { useCallback } from 'react';

export const useTokens = () => {
  const refreshTokens = useCallback(async (): Promise<boolean> => {
    try {
      const response = await fetch('http://localhost:8080/refresh', {
        method: 'POST',
        credentials: 'include', // Important for working with cookies
      });

      if (response.status === 401) {
        // Токен истек или недействителен
        console.log('Session expired');
        return false;
      }

      if (response.status === 403) {
        // Refresh token был скомпрометирован
        console.log('Security issue detected, please sign in again');
        return false;
      }

      return response.ok;
    } catch (error) {
      console.error('Error refreshing tokens:', error);
      return false;
    }
  }, []);

  return { refreshTokens };
};
