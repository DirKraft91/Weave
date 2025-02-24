import SpiderInteresting from '@/assets/spider-interesting.png';
import SpiderSad from '@/assets/spider-sad.png';
import { ProviderCard } from '@/components/ProviderCard';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { SEARCH_CONFIG } from '@/config';
import { userService } from '@/services/user.service';
import { getProviderIcon } from '@/utils/provider';
import { addToast } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';

function SearchComponent() {
  const [address, setAddress] = useState('');

  const userProofsQuery = useQuery({
    queryKey: ['proofs', address],
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
      }
    },
    enabled: !!address,
  });
  const isNotFound = userProofsQuery.data?.proofs?.length === 0;

  const handleSearch = (query: string) => {
    setAddress(query);
  };

  return (
    <div className="p-6 w-full">
      <h2 className="text-3xl font-semibold text-white mb-8">Search by wallet</h2>
      <div className="flex flex-col gap-6">
        <div className="max-w-2xl">
          <SearchInput
            onSearch={handleSearch}
            placeholder="Enter wallet address"
            isLoading={userProofsQuery.isFetching}
            debounceMs={SEARCH_CONFIG.DEBOUNCE_MS}
          />
        </div>
        {(userProofsQuery.data?.proofs?.length ?? 0) > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userProofsQuery.data?.proofs?.map((proof, index) => (
              <ProviderCard
                key={index}
                provider={{
                  id: proof.proof_identifier,
                  name: proof.provider,
                  icon: getProviderIcon(proof.provider),
                  isVerified: true,
                  domain: proof.provider.toLowerCase() + '.com',
                  link: `https://${proof.provider.toLowerCase()}.com`,
                  value: proof.username || proof.email,
                }}
              />
            ))}
          </div>
        )}
        <div className="relative flex flex-col items-center justify-center gap-8 mt-4">
          <span
            className={`text-3xl font-bold self-start transition-opacity duration-300 ${isNotFound ? 'opacity-100' : 'opacity-0'}`}
          >
            Not Found
          </span>
          <div className="relative">
            {isNotFound ? (
              <img src={SpiderSad} alt="Sad spider" />
            ) : (
              <img src={SpiderInteresting} alt="Interesting spider" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/search/')({
  component: SearchComponent,
});
