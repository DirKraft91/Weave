import { Chip, Button } from '@heroui/react';
import { ArrowLeftStartOnRectangleIcon } from '@heroicons/react/24/outline';

export const Header = () => {
  return (
    <header className="flex gap-4">
      <Chip color="primary" startContent={<ArrowLeftStartOnRectangleIcon width={24} height={24} />} variant="faded">
        Wallet
      </Chip>
      <Button color="primary">Button</Button>
    </header>
  );
};
