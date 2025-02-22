import { ProofModal } from '@/components/ProofModal';
import { Provider, ProviderCard } from '@/components/ProviderCard/ProviderCard';
import { useDisclosure } from '@heroui/react';
import { createFileRoute } from '@tanstack/react-router';
import { useState } from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaSquareXTwitter } from "react-icons/fa6";
import { FcGoogle } from 'react-icons/fc';

const providers: Provider[] = [
  {
    id: 'twitter',
    name: 'X',
    domain: 'x.com',
    icon: FaSquareXTwitter,
    link: 'https://x.com'
  },
  {
    id: 'google',
    name: 'Google',
    domain: 'gmail.com',
    icon: FcGoogle,
    isVerified: true,
    value: 'Username@gmail.com',
    link: 'https://gmail.com'
  },
  {
    id: 'linkedin',
    name: 'Linkedin',
    domain: 'linkedin.com',
    icon: FaLinkedin,
    link: 'https://linkedin.com'
  },
  {
    id: 'github',
    name: 'Github',
    domain: 'github.com',
    icon: FaGithub,
    link: 'https://github.com'
  },
];

function DashboardComponent() {
  const proofModal = useDisclosure();
  const [selectedProvider, setSelectedProvider] = useState<Provider>();

  const handleVerify = (provider: Provider) => {
    setSelectedProvider(provider);
    proofModal.onOpen();
  };

  return (
    <div className="p-6 w-full">
      <h1 className="text-3xl font-semibold text-white mb-8">
        My providers
      </h1>

      <div className="grid grid-cols-[repeat(2,333px)] gap-6 justify-start">
        {providers.map((provider) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            onVerify={handleVerify}
          />
        ))}
      </div>

      {selectedProvider && (
        <ProofModal
          {...proofModal}
          provider={selectedProvider}
        />
      )}
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: DashboardComponent,
});
