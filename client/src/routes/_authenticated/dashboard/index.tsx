import { Button, Card, CardBody, CardHeader, Divider } from "@heroui/react";
import { createFileRoute } from '@tanstack/react-router';
import { IconType } from 'react-icons';
import { FaGithub, FaLinkedin } from 'react-icons/fa';
import { FaSquareXTwitter } from "react-icons/fa6";
import { FcGoogle } from 'react-icons/fc';
interface Provider {
  id: string;
  name: string;
  icon: IconType;
  iconClassName?: string;
  isVerified?: boolean;
  value?: string;
  domain?: string;
}

const providers: Provider[] = [
  {
    id: 'twitter',
    name: 'X',
    domain: 'x.com',
    icon: FaSquareXTwitter,
    iconClassName: 'text-white',
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
    iconClassName: 'text-[#0A66C2]',
  },
  {
    id: 'github',
    name: 'Github',
    domain: 'github.com',
    icon: FaGithub,
    iconClassName: 'text-white',
  },
];

function ProviderCard({ provider }: { provider: Provider }) {
  const Icon = provider.icon;

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center gap-3 pb-2 mb-24">
        <div className="flex gap-3">
          <Icon className={`text-2xl ${provider.iconClassName}`} />
          <div className="flex flex-col">
            <span className="text-white font-medium">{provider.name}</span>
            <span className="text-sm text-content-subtle">{provider.domain}</span>
          </div>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="pt-2">
        {provider.isVerified ? (
          <Button
            className="w-full"
            color="secondary"
            variant="solid"
          >
            {provider.value}
          </Button>
        ) : (
          <Button
            className="w-full"
            variant="bordered"
            color="secondary"
          >
            Approve username
          </Button>
        )}
      </CardBody>
    </Card>
  );
}

function DashboardComponent() {
  return (
    <div className="p-6 w-full">
      <h1 className="text-3xl font-semibold text-white mb-8">
        My providers
      </h1>

      <div className="grid grid-cols-2 gap-6">
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
