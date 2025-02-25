import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { addToast, Button, Card, CardFooter, CardHeader, closeAll, Divider, Skeleton } from '@heroui/react';
import { Link } from '@tanstack/react-router';
import { IconType } from 'react-icons';
import { HiOutlineClipboardCopy } from 'react-icons/hi';

export interface Provider {
  id: string;
  name: string;
  icon: IconType;
  providerId: string;
  iconClassName?: string;
  isVerified?: boolean;
  value?: string;
  domain?: string;
  link?: string;
}

interface ProviderCardProps {
  provider: Provider;
  onVerify?: (provider: Provider) => void;
}

function ProviderCardSkeleton() {
  return (
    <Card className="h-[208px] grid grid-rows-[min-content_auto_min-content]">
      <CardHeader>
        <div className="grid grid-cols-[auto_1fr] items-center gap-3">
          <Skeleton className="rounded-lg w-12 h-12" />
          <div className="grid gap-1">
            <Skeleton className="rounded-lg w-24 h-4" />
            <Skeleton className="rounded-lg w-24 h-4" />
          </div>
        </div>
      </CardHeader>
      <Divider className="self-end" />

      <CardFooter>
        <Skeleton className="rounded-lg w-full h-10" />
      </CardFooter>
    </Card>
  );
}

export function ProviderCard({ provider, onVerify }: ProviderCardProps) {
  const Icon = provider.icon;
  const { copyToClipboard } = useCopyToClipboard();

  const handleCopy = async () => {
    if (!provider.value) return;

    await copyToClipboard(provider.value);
    closeAll();
    addToast({
      title: 'Copied to clipboard',
      description: 'You can now paste it into your provider',
      variant: 'solid',
    });
  };

  return (
    <Card className="h-[208px] grid grid-rows-[min-content_auto_min-content]">
      <CardHeader>
        <div className="grid grid-cols-[auto_1fr] items-center gap-3">
          <Icon className="text-5xl" />
          <div className="grid gap-1">
            <span className="text-white font-medium">{provider.name}</span>
            <Link to={provider.link || '#'} className="text-sm text-content-subtle hover:text-content">
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
            endContent={<HiOutlineClipboardCopy className="text-xl" />}
            onClick={handleCopy}
          >
            {provider.value}
          </Button>
        ) : (
          <Button className="w-full hover:bg-secondary hover:text-white" variant="bordered" color="secondary" onClick={() => onVerify?.(provider)}>
            Approve
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

ProviderCard.Skeleton = ProviderCardSkeleton;
