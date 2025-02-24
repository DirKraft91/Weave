export const TOAST_CONFIG = {
  DEFAULT_TIMEOUT: Number(import.meta.env.VITE_TOAST_DEFAULT_TIMEOUT),
  LONG_TIMEOUT: Number(import.meta.env.VITE_TOAST_LONG_TIMEOUT),
} as const;

export const SEARCH_CONFIG = {
  DEBOUNCE_MS: Number(import.meta.env.VITE_SEARCH_DEBOUNCE_MS),
} as const;
