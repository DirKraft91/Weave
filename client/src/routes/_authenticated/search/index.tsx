import SpiderInteresting from '@/assets/spider-interesting.png';
import SpiderSad from '@/assets/spider-sad.png';
import { ProviderCard } from '@/components/ProviderCard/ProviderCard';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { UnavailableModal } from '@/components/UnavailableModal/UnavailableModal';
import { PROVIDERS } from '@/config';
import { useUserMe } from '@/hooks/useUserMe';
import { proofService } from '@/services/proof.service';
import { userService } from '@/services/user.service';
import { parseClaimData } from '@/utils/claimDataParser';
import { addToast } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { IconType } from 'react-icons';
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';
import { SiBinance, SiCoinbase } from 'react-icons/si';

const providers = PROVIDERS.map((provider) => ({
  ...provider,
  icon:
    {
      twitter: FaSquareXTwitter,
      google: FcGoogle,
      linkedin: FaLinkedin,
      github: FaGithub,
      facebook: FaFacebook,
      binance: SiBinance,
      coinbase: SiCoinbase,
      instagram: FaInstagram,
    }[provider.id] || FaGithub,
}));

function SearchComponent() {
  const [address, setAddress] = useState('');

  const meQuery = useUserMe({
    retry: 0,
  });

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
        return { identity_records: [] };
      }
    },
    enabled: !!address,
  });

  const providerStatsQuery = useQuery({
    queryKey: ['provider-stats'],
    queryFn: () => proofService.fetchProofStats(),
  });

  const hasNoIdentityRecords = meQuery.data?.identity_records?.length === 0;
  const isNotFound = userProofsQuery.data?.identity_records?.length === 0;
  const hasIdentityRecords = !!userProofsQuery.data?.identity_records && userProofsQuery.data.identity_records.length > 0;

  const currentProviders = useMemo(() => {
    if (!userProofsQuery.data || isNotFound) return [];

    return userProofsQuery.data?.identity_records
      ?.map((record) => {
        const provider = providers.find((p) => p.providerId === record.provider_id);
        if (!provider) return null;

        const userCount = provider.providerId ? (providerStatsQuery.data?.[provider.providerId] ?? 0) : 0;

        const parsedData = parseClaimData(provider.providerId, record.claim_data_params);

        return {
          ...provider,
          isVerified: true,
          value: parsedData.buttonText || parsedData.username || parsedData.email || '',
          userCount,
          claimDataParams: record.claim_data_params,
        };
      })
      .filter((provider) => provider !== null) ?? [];
  }, [userProofsQuery.data, isNotFound, providerStatsQuery.data]);

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
            debounceMs={500}
          />
        </div>

        <div className="grid grid-cols-[repeat(2,333px)] gap-6 justify-start">
          {currentProviders.map((provider, index) => (
            <ProviderCard
              key={index}
              provider={{
                id: provider.id,
                name: provider.name,
                icon: provider.icon as IconType,
                isVerified: true,
                domain: provider.domain,
                link: provider.link,
                value: provider.value,
                providerId: provider.providerId,
                userCount: provider.userCount,
                description: provider.description,
                claimDataParams: provider.claimDataParams,
              }}
            />
          ))}
        </div>

        {!hasIdentityRecords && (
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
        )}
      </div>

      <UnavailableModal isOpen={hasNoIdentityRecords} />
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/search/')({
  component: SearchComponent,
});
