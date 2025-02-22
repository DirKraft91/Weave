import { Provider, ProviderCard } from '@/components/ProviderCard/ProviderCard';
import { createFileRoute } from '@tanstack/react-router';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaSquareXTwitter } from "react-icons/fa6";
import { FcGoogle } from 'react-icons/fc';

const providers: Provider[] = [
  {
    id: 'twitter',
    name: 'X',
    domain: 'x.com',
    icon: FaSquareXTwitter,
  },
  {
    id: 'google',
    name: 'Google',
    domain: 'gmail.com',
    icon: FcGoogle,
    isVerified: true,
    value: 'Username@gmail.com',
  },
  {
    id: 'linkedin',
    name: 'Linkedin',
    domain: 'linkedin.com',
    icon: FaLinkedin,
  },
  {
    id: 'github',
    name: 'Github',
    domain: 'github.com',
    icon: FaGithub,
  },
];

function DashboardComponent() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-3xl font-semibold text-white mb-8">
        My providers
      </h1>

      <div className="grid grid-cols-[repeat(2,333px)] gap-6 justify-start">
        {providers.map((provider) => (
          <ProviderCard key={provider.id} provider={provider} />
        ))}
      </div>
    </div>
  );
}

export const Route = createFileRoute('/_authenticated/dashboard/')({
  component: DashboardComponent,
});
