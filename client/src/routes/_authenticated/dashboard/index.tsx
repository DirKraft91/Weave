import { ProofModal } from '@/components/ProofModal';
import { Provider, ProviderCard } from '@/components/ProviderCard/ProviderCard';
import { PROVIDERS } from '@/config';
import { userService } from '@/services/user.service';
import { useDisclosure } from '@heroui/react';
import { useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaSquareXTwitter } from 'react-icons/fa6';
import { FcGoogle } from 'react-icons/fc';

const providers = PROVIDERS.map((provider) => ({
  ...provider,
  icon: {
    twitter: FaSquareXTwitter,
    google: FcGoogle,
    linkedin: FaLinkedin,
    github: FaGithub,
  }[provider.id],
}));

function DashboardComponent() {
  const proofModal = useDisclosure();
  const [selectedProvider, setSelectedProvider] = useState<Provider>();

  const meProofsQuery = useQuery({
    queryKey: ['my-proofs'],
    queryFn: userService.fetchMe,
    refetchInterval: 10_000,
  });

  const currentProviders = providers.map((provider) => {
    const record = meProofsQuery.data?.identity_records.find((record) => record.provider_id === provider.providerId);
    return {
      ...provider,
      isVerified: !!record,
      value: '',
      // value: proof?.public_data.username || proof?.public_data.email, // @TODO: need to parse claim_data_params
    };
  });

  const handleVerify = (provider: Provider) => {
    setSelectedProvider(provider);
    proofModal.onOpen();
  };

  return (
    <div className="p-6 w-full">
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

      {selectedProvider && <ProofModal {...proofModal} provider={selectedProvider} />}
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: DashboardComponent,
});
