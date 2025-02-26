export const API_URL = import.meta.env.VITE_API_URL || '';

export const AUTH_CONFIG = {
  ACCESS_TOKEN_KEY: 'access_token',
  REFRESH_TOKEN_KEY: 'refresh_token',
  ACCESS_TOKEN_EXPIRY_DAYS: Number(import.meta.env.VITE_AUTH_TOKEN_EXPIRY_DAYS),
  REFRESH_TOKEN_EXPIRY_DAYS: Number(import.meta.env.VITE_REFRESH_TOKEN_EXPIRY_DAYS),
} as const;
