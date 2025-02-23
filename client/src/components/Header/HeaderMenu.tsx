import { Link } from "@tanstack/react-router";

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

export const HeaderMenu = () => {
  return (
    <nav className="hidden md:flex items-center gap-24">
      {menuItems.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className="text-sm font-medium text-content hover:text-content-contrast transition-colors"
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
};
