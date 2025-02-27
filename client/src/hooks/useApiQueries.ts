import { Proof, proofService } from '@/services/proof.service';
import { userService } from '@/services/user.service';
import { addToast, closeAll } from '@heroui/react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

// User related hooks
export function useUserMe(options = {}) {
  return useQuery({
    queryKey: ['me'],
    queryFn: () => userService.fetchMe(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    ...options,
  });
}

export function useUserByAddress(address: string, options = {}) {
  return useQuery({
    queryKey: ['user', address],
    queryFn: async () => {
      try {
        return userService.fetchUserByAddress(address);
      } catch (error) {
        addToast({
          title: 'Error',
          description: error instanceof Error ? error.message : 'Failed to search',
          color: 'danger',
          timeout: 3000,
        });
        return { identity_records: [] };
      }
    },
    enabled: !!address,
    ...options,
  });
}

// Proof related hooks
export function useProviderStats(options = {}) {
  return useQuery({
    queryKey: ['provider-stats'],
    queryFn: () => proofService.fetchProofStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
    ...options,
  });
}

export function useApplyProof() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      signer: string;
      public_key: string;
      signature: string;
      data: Uint8Array;
      provider_id: string;
      proof: Proof;
    }) => {
      return proofService.applyProof(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['my-proofs'],
      });
      queryClient.invalidateQueries({
        queryKey: ['provider-stats'],
      });
      closeAll();
      addToast({
        title: 'Proof applied',
        description: 'Proof applied successfully',
        color: 'success',
        timeout: 3000,
        priority: 0,
      });
    },
    onError: (error) => {
      closeAll();
      addToast({
        title: 'Error applying proof',
        description: error instanceof Error ? error.message : 'Something went wrong',
        color: 'danger',
        timeout: 3000,
        priority: 0,
      });
    },
  });
}

export function usePrepareProof() {
  return useMutation({
    mutationFn: async (payload: {
      proof: Proof;
      provider_id: string;
      signer: string
    }) => {
      return proofService.prepareProof(payload);
    },
    onError: (error) => {
      closeAll();
      addToast({
        title: 'Error preparing proof',
        description: error instanceof Error ? error.message : 'Something went wrong',
        color: 'danger',
        timeout: 3000,
        priority: 0,
      });
    },
  });
}

// Calculate total verifications from provider stats
export function useTotalVerifications() {
  const providerStatsQuery = useProviderStats();

  const totalVerifications = providerStatsQuery.data
    ? Object.values(providerStatsQuery.data).reduce((total, count) => total + count, 0)
    : 0;

  return {
    ...providerStatsQuery,
    totalVerifications,
  };
}
