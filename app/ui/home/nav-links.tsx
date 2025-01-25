'use client';

import {
  HomeIcon,
  BuildingLibraryIcon,
  UserGroupIcon,
  ScaleIcon,
  PuzzlePieceIcon,
  HeartIcon
} from '@heroicons/react/24/outline';
// no full refresh in each page as with <a>
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';


const links = [
  { name: 'Home', 
    href: '/home', 
    icon: HomeIcon },
  {
    name: 'Pregnancy & newborns',
    href: '/home/pregnancy&newborns',
    icon: HeartIcon,
  },
  { name: 'Toddlers & prescholers', 
    href: '/home/toddlers&prescholers', 
    icon: PuzzlePieceIcon },
    {
      name: 'School Age Kids',
      href: '/home/schoolAgeKids',
      icon: BuildingLibraryIcon,
    },
    {
      name: 'Teenagers',
      href: '/home/teenagers',
      icon: UserGroupIcon,
    },
    {
      name: 'Mom Life',
      href: '/home/momLife',
      icon: ScaleIcon,
    },
];

export default function NavLinks() {
  const pathname = usePathname();
  
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.href}
            // active page in blue
            className={clsx(
              'flex h-[48px] grow items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-red-100 hover:text-pink-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-red-100 text-pink-600': pathname === link.href,
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p className="hidden md:block">{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
