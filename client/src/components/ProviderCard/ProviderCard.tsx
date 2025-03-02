import { useCopyToClipboard } from '@/hooks/useCopyToClipboard';
import { parseClaimData } from '@/utils/claimDataParser';
import { addToast, Button, Card, CardFooter, CardHeader, closeAll, Divider, Skeleton, Tooltip } from '@heroui/react';
import { Link } from '@tanstack/react-router';
import { IconType } from 'react-icons';
import { HiOutlineClipboardCopy } from 'react-icons/hi';
import { UserStats } from '../UserStats';

const providerIconStyles: Record<string, { bgColor: string; iconColor: string }> = {
  twitter: { bgColor: '#ffffff', iconColor: '#000000' },
  google: { bgColor: '#ffffff', iconColor: '#4285F4' },
  linkedin: { bgColor: '#0A66C2', iconColor: '#ffffff' },
  github: { bgColor: '#24292e', iconColor: '#ffffff' },
  facebook: { bgColor: '#1877F2', iconColor: '#ffffff' },
  binance: { bgColor: '#F0B90B', iconColor: '#000000' },
  coinbase: { bgColor: '#0052FF', iconColor: '#ffffff' },
  instagram: { bgColor: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)', iconColor: '#ffffff' },
};

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
  userCount?: number;
  description?: string;
  claimDataParams?: string;
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

  const parsedData = provider.claimDataParams ? parseClaimData(provider.providerId, provider.claimDataParams) : null;

  // Get icon styling based on provider ID, or use default styling
  const iconStyle = providerIconStyles[provider.id.toLowerCase()] || { bgColor: '#333333', iconColor: '#ffffff' };

  return (
    <Card className="h-[208px] grid grid-rows-[min-content_auto_min-content]">
      <CardHeader className="flex flex-col items-start">
        <div className="flex justify-between w-full">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center justify-center w-12 h-12 rounded-full"
              style={{
                background: iconStyle.bgColor,
                color: iconStyle.iconColor,
              }}
            >
              <Icon className="text-3xl" />
            </div>

            <div className="grid gap-1">
              <span className="text-white font-medium">{provider.name}</span>
              <Link to={provider.link || '#'} className="text-sm text-default-500 hover:text-default-600">
                {provider.domain}
              </Link>
            </div>
          </div>

          {provider.userCount !== undefined && <UserStats count={provider.userCount} />}
        </div>

        {provider.description && <p className="text-sm text-content2-foreground mt-3">{provider.description}</p>}

        {parsedData && (
          <div className="mt-2">
            <p className="text-small text-default-500">{parsedData.displayValue}</p>
            {parsedData.createdAt && (
              <p className="text-xs text-default-400 mt-1">
                Joined: {new Date(parsedData.createdAt).toLocaleDateString()}
              </p>
            )}
          </div>
        )}
      </CardHeader>

      <Divider className="self-end" />

      <CardFooter>
        {provider.isVerified ? (
          <Tooltip content="Copy to clipboard" placement="bottom">
            <Button
              className="w-full"
              color="secondary"
              variant="solid"
              endContent={<HiOutlineClipboardCopy className="text-xl" />}
              onClick={handleCopy}
            >
              {parsedData?.buttonText}
            </Button>
          </Tooltip>
        ) : (
          <Button
            className="w-full hover:bg-secondary hover:text-white"
            variant="bordered"
            color="secondary"
            onClick={() => onVerify?.(provider)}
          >
            Approve
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}

ProviderCard.Skeleton = ProviderCardSkeleton;
