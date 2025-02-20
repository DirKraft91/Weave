import { create } from 'zustand';

interface AuthStore {
  authToken: null | string;
}

export const defaultAuthToken = null;

export const useAuthStore = create<AuthStore>()(() => ({
  authToken: defaultAuthToken,
}));

export const authStore = {
  setAuthToken: (authToken: string) => {
    useAuthStore.setState({ authToken });
  },
  clearAuthToken: () => {
    useAuthStore.setState({ authToken: null });
  },
};
