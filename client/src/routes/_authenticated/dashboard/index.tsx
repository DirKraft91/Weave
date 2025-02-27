import { ProofModal } from '@/components/ProofModal';
import { Provider, ProviderCard } from '@/components/ProviderCard/ProviderCard';
import { PROVIDERS } from '@/config';
import { proofService } from '@/services/proof.service';
import { userService } from '@/services/user.service';
import { useDisclosure } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useMemo, useState } from 'react';
import { FaFacebook, FaGithub, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';
import { SiBinance, SiCoinbase } from 'react-icons/si';

const providers = PROVIDERS.map((provider) => ({
  ...provider,
  icon: {
    twitter: FaSquareXTwitter,
    google: FcGoogle,
    linkedin: FaLinkedin,
    github: FaGithub,
    facebook: FaFacebook,
    binance: SiBinance,
    coinbase: SiCoinbase,
    instagram: FaInstagram,
  }[provider.id],
}));

function DashboardComponent() {
  const proofModal = useDisclosure();
  const [selectedProvider, setSelectedProvider] = useState<Provider>();

  const meProofsQuery = useQuery({
    queryKey: ['my-proofs'],
    queryFn: userService.fetchMe,
  });

  const providerStatsQuery = useQuery({
    queryKey: ['provider-stats'],
    queryFn: () => proofService.fetchProofStats(),
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const currentProviders = useMemo(() => {
    return providers.map((provider) => {
      const record = meProofsQuery.data?.identity_records.find((record) => record.provider_id === provider.providerId);

      // Use the stats from the query if available, otherwise fall back to the default
      const userCount = providerStatsQuery.data?.[provider.providerId] ?? 0;

      return {
        ...provider,
        isVerified: !!record,
        value: '',
        userCount,
        claimDataParams: record?.claim_data_params,
      };
    });
  }, [meProofsQuery.data, providerStatsQuery.data]);

  const handleVerify = (provider: Provider) => {
    setSelectedProvider(provider);
    proofModal.onOpen();
  };

  return (
    <div className="p-6 w-full pb-24">
      <h2 className="text-3xl font-semibold text-white mb-8">My providers</h2>

      {meProofsQuery.isFetching ? (
        <div className="grid grid-cols-[repeat(2,333px)] gap-6 justify-start">
          {providers.map((provider) => (
            <ProviderCard.Skeleton key={provider.id} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(2,333px)] gap-6 justify-start">
          {currentProviders.map((provider) => (
            <ProviderCard key={provider.id} provider={provider} onVerify={handleVerify} />
          ))}
        </div>
      )}

      {selectedProvider && <ProofModal key={selectedProvider.id} {...proofModal} provider={selectedProvider} />}
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: DashboardComponent,
});
