import { ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';

export const AsideNavigation = () => {
  return (
    <div className="flex flex-1 flex-col gap-2 pt-24">
      <Button
        variant="solid"
        color="secondary"
        className="justify-between"
        size="lg"
      >
        My dashboard
        <ArrowRightIcon className="w-5 h-5" />
      </Button>

      <Button
        variant="light"
        color="default"
        className="justify-start gap-2"
        size="lg"
      >
        Search
        <MagnifyingGlassIcon className="w-5 h-5" />
      </Button>
    </div>
  );
};
