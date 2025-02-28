import { authStore } from '@/contexts/auth';
import { walletStore } from '@/contexts/wallet';
import { authService } from '@/services/auth.service';
import { addToast } from '@heroui/react';
import { useNavigate } from '@tanstack/react-router';

/**
 * Hook for performing user logout
 * @returns Function to perform logout
 */
export const useLogout = () => {
  const navigate = useNavigate();

  /**
   * Performs user logout and redirects to the main page
   * @param options Logout options
   */
  const logout = (options?: {
    showToast?: boolean;
    toastTitle?: string;
    toastDescription?: string;
    redirectTo?: string;
  }) => {
    const {
      showToast = true,
      toastTitle = 'Session expired',
      toastDescription = 'Your session has expired. Please log in again.',
      redirectTo = '/',
    } = options || {};

    authStore.clearAuthToken();
    walletStore.setSelectedWallet(null);
    authService.logout();
    navigate({ to: redirectTo });

    if (showToast) {
      addToast({
        title: toastTitle,
        description: toastDescription,
        color: 'warning',
        timeout: 5000,
      });
    }
  };

  return { logout };
};
