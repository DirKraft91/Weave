import { Button, Card, CardFooter, CardHeader, Divider } from "@heroui/react";
import { Link } from '@tanstack/react-router';
import { IconType } from 'react-icons';

export interface Provider {
  id: string;
  name: string;
  icon: IconType;
  iconClassName?: string;
  isVerified?: boolean;
  value?: string;
  domain?: string;
  link?: string;
}

interface ProviderCardProps {
  provider: Provider;
}

export function ProviderCard({ provider }: ProviderCardProps) {
  const Icon = provider.icon;

  return (
    <Card className="h-[208px] grid grid-rows-[min-content_auto_min-content]">
      <CardHeader>
        <div className="grid grid-cols-[auto_1fr] items-center gap-3">
          <Icon className="text-5xl" />
          <div className="grid gap-1">
            <span className="text-white font-medium">{provider.name}</span>
            <Link
              to={provider.link || '#'}
              className="text-sm text-content-subtle hover:text-content"
            >
              {provider.domain}
            </Link>
          </div>
        </div>
      </CardHeader>

      <Divider className="self-end" />

      <CardFooter>
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
      </CardFooter>
    </Card>
  );
}
