import { Listbox, ListboxItem } from '@heroui/react';
import { HomeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
export const AsideNavigation = () => {
  return (
    <div className="flex flex-1 flex-col">
      <Listbox selectionMode="single" variant="solid" color="secondary" hideSelectedIcon selectedKeys={['home']}>
        <ListboxItem key="home">
          <HomeIcon />
          Dashboard
        </ListboxItem>
        <ListboxItem key="about">
          <MagnifyingGlassIcon />
          Search
        </ListboxItem>
      </Listbox>
    </div>
  );
};
