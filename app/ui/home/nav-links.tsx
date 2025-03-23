'use client';

import { useUser } from '@clerk/nextjs';
import {
  BuildingLibraryIcon,
  UserGroupIcon,
  ScaleIcon,
  PuzzlePieceIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';
// no full refresh in each page as with <a>
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';


const links = [
  {
    name: 'Pregnancy & newborns',
    href: '/home/Pregnancy & newborns',
    title: 'Pregnancy & newborns',
    icon: HeartIcon,
  },
  { name: 'Toddlers & preschoolers', 
    href: '/home/Toddlers & preschoolers', 
    title: 'Toddlers & preschoolers',
    icon: PuzzlePieceIcon },
    {
      name: 'School Age Kids',
      href: '/home/School age kids',
      title: 'School age kids',
      icon: BuildingLibraryIcon,
    },
    {
      name: 'Teenagers',
      href: '/home/Teenagers',
      title: 'Teenagers',
      icon: UserGroupIcon,
    },
    {
      name: 'Mom Life',
      href: '/home/Mom life',
      title: 'Mom life',
      icon: ScaleIcon,
    },
];

export default function NavLinks() {
  const { user } = useUser();
  const pathname = usePathname();
  
  return (
    <>
      {links.map((link) => {
        const LinkIcon = link.icon;
        return (
          <Link
            key={link.name}
            href={link.name === 'Profile' && user ? `/profile/${user.id}` : link.href}
            title={link.title}
            className={clsx(
              'relative flex h-[48px] w-full items-center justify-start gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-red-100 hover:text-pink-600 md:flex-none md:justify-start md:p-2 md:px-3',
              {
                'bg-red-100 text-pink-600': pathname === link.href
              },
            )}
          >
            <LinkIcon className="w-6" />
            <p >{link.name}</p>
          </Link>
        );
      })}
    </>
  );
}
