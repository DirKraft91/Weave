import { normalizePath } from '@/utils/path';
import { ArrowRightIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import { Link, useMatches } from '@tanstack/react-router';

export const AsideNavigation = () => {
  const matches = useMatches();
  const currentPath = matches.length > 0 ? matches[matches.length - 1].pathname : '';
  const normalizedCurrentPath = normalizePath(currentPath);

  const isDashboardActive = normalizedCurrentPath === '/dashboard';
  const isSearchActive = normalizedCurrentPath === '/search';

  return (
    <div className="flex flex-1 flex-col gap-2 pt-24 pr-24">
      <Button
        as={Link}
        to="/dashboard"
        variant={isDashboardActive ? "solid" : "light"}
        color={isDashboardActive ? "secondary" : "default"}
        className="justify-between"
        size="lg"
      >
        My dashboard
        <ArrowRightIcon className="w-5 h-5" />
      </Button>

      <Button
        as={Link}
        to="/search"
        variant={isSearchActive ? "solid" : "light"}
        color={isSearchActive ? "secondary" : "default"}
        className="justify-between gap-2"
        size="lg"
      >
        Search
        <MagnifyingGlassIcon className="w-5 h-5" />
      </Button>
    </div>
  );
};
