import { User, userService } from '@/services/user.service';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useLogout } from './useLogout';

/**
 * Hook for getting current user data with automatic logout on error
 * @param options Query options
 * @returns Query result
 */
export const useUserMe = (options?: Omit<UseQueryOptions<User, Error, User, string[]>, 'queryKey' | 'queryFn'>) => {
  const { logout } = useLogout();

  return useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      try {
        return await userService.fetchMe();
      } catch (error) {
        logout();
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    ...options,
  });
};
