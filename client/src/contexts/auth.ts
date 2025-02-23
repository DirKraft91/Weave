import { authService } from '@/services/auth.service';
import { create } from 'zustand';

export interface AuthStore {
  authToken: null | string;
}

export const defaultAuthToken = null;

export const useAuthStore = create<AuthStore>()(() => ({
  authToken: authService.getAccessToken(),
}));

export const authStore = {
  setAuthToken: (authToken: string) => {
    useAuthStore.setState({ authToken });
  },
  clearAuthToken: () => {
    useAuthStore.setState({ authToken: null });
  },
};
