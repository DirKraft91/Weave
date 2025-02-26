import { ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import { Link } from '@tanstack/react-router';

export const AsideNavigation = () => {
  return (
    <div className="flex flex-1 flex-col gap-2 pt-24">
      <Button
        as={Link}
        to="/dashboard"
        variant="solid"
        color="secondary"
        className="justify-between"
        size="lg"
      >
        My dashboard
        <ArrowRightIcon className="w-5 h-5" />
      </Button>

      <Button
        as={Link}
        to="/search"
        variant="light"
        color="default"
        className="justify-between gap-2"
        size="lg"
      >
        Search
        <MagnifyingGlassIcon className="w-5 h-5" />
      </Button>
    </div>
  );
};
