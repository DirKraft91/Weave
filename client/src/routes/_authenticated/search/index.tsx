import SpiderInteresting from '@/assets/spider-interesting.png';
import SpiderSad from '@/assets/spider-sad.png';
import { ProviderCard } from '@/components/ProviderCard';
import { SearchInput } from '@/components/SearchInput/SearchInput';
import { UnavailableModal } from '@/components/UnavailableModal/UnavailableModal';
import { PROVIDERS } from '@/config';
import { useProviderStats, useUserByAddress, useUserMe } from '@/hooks/useApiQueries';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
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

  const meQuery = useUserMe();
  const userProofsQuery = useUserByAddress(address);
  const providerStatsQuery = useProviderStats();

  const hasNoIdentityRecords = meQuery.data?.identity_records?.length === 0;
  const isNotFound = userProofsQuery.data?.identity_records?.length === 0;
  const hasIdentityRecords = !!userProofsQuery.data?.identity_records && userProofsQuery.data.identity_records.length > 0;

  const currentProviders = useMemo(() => {
    if (!userProofsQuery.data || isNotFound) return [];

    return userProofsQuery.data?.identity_records
      .map((record) => {
        const provider = providers.find((p) => p.providerId === record.provider_id);
        if (!provider) return null;

        const userCount = provider.providerId ? (providerStatsQuery.data?.[provider.providerId] ?? 0) : 0;

        return {
          ...provider,
          isVerified: true,
          value: '',
          userCount,
          claimDataParams: record.claim_data_params,
        };
      })
      .filter((provider) => provider !== null);
  }, [userProofsQuery.data, isNotFound, providerStatsQuery.data]);

  const handleSearch = (query: string) => {
    setAddress(query);
  };

  return (
    <div className="p-6 w-full pb-24">
      <h2 className="text-3xl font-semibold text-white mb-8">Search</h2>

      <div className="mb-8">
        <SearchInput onSearch={handleSearch} />
      </div>

      {!address && (
        <div className="flex flex-col items-center justify-center py-12">
          <img src={SpiderInteresting} alt="Spider" className="w-32 h-32 mb-4" />
          <p className="text-lg text-center text-gray-400">Enter an address to search for verified providers</p>
        </div>
      )}

      {address && isNotFound && (
        <div className="flex flex-col items-center justify-center py-12">
          <img src={SpiderSad} alt="Spider" className="w-32 h-32 mb-4" />
          <p className="text-lg text-center text-gray-400">No verified providers found for this address</p>
        </div>
      )}

      {hasIdentityRecords && (
        <div className="grid grid-cols-[repeat(2,333px)] gap-6 justify-start">
          {currentProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} />
          ))}
        </div>
      )}

      <UnavailableModal isOpen={!!hasNoIdentityRecords} />
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/search/')({
  component: SearchComponent,
});
