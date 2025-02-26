import { Link, useMatches } from "@tanstack/react-router";

const menuItems = [
  {
    label: 'How It Works',
    to: '/how'
  },
  {
    label: 'About Us',
    to: '/about'
  },
  // {
  //   label: 'Dashboard',
  //   to: '/dashboard'
  // },
  // {
  //   label: 'Search',
  //   to: '/search'
  // }
];

const normalizePath = (path: string) => path.replace(/\/+$/, '');

export const HeaderMenu = () => {
  const matches = useMatches();
  const currentPath = matches.length > 0 ? matches[matches.length - 1].pathname : '';
  const normalizedCurrentPath = normalizePath(currentPath);

  return (
    <nav className="hidden md:flex items-center gap-24">
      {menuItems.map((item) => {
        const normalizedItemPath = normalizePath(item.to);
        const isActive = normalizedCurrentPath === normalizedItemPath;

        return (
          <Link
            key={item.to}
            to={item.to}
            className={`
              text-sm font-medium text-content
              relative
              transition-colors
              after:content-['']
              after:absolute
              after:w-full
              after:h-[2px]
              after:bg-white
              after:left-0
              after:bottom-[-4px]
              after:scale-x-0
              after:origin-bottom-right
              after:transition-transform
              after:duration-300
              hover:after:scale-x-100
              hover:after:origin-bottom-left
              ${isActive ? 'after:scale-x-100 after:origin-bottom-left' : ''}
            `}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
};
