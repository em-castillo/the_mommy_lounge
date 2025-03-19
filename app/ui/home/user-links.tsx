'use client';

import NotificationsButton from './notifications_count';
import {UserIcon, PowerIcon} from '@heroicons/react/24/outline';
import Link from 'next/link';
import { SignedIn, SignedOut, SignInButton, useClerk } from "@clerk/nextjs";


export default function UserLinks() {
    const { signOut } = useClerk();

    return (
        <>
        <div className="flex flex-col gap-2 md:gap-0">
        {/* Show Profile Link only if signed in */}
        <SignedIn>
          <Link href="/home/profile" title="Profile">
            <button 
            className="flex h-[48px] w-full items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-red-100 hover:text-pink-600 md:flex-none md:justify-start md:p-2 md:px-3">
              <UserIcon className="w-6" />
              <div>Profile</div>
            </button>
          </Link>
        </SignedIn>
        </div>

        {/* Notifications */}
        <SignedIn>
            <NotificationsButton/>
        </SignedIn>

        {/* Signed-In View */}
        <SignedIn>
          <div className="flex flex-col items-center md:items-start">

            <button
              onClick={() => signOut()}
              title="Sign out"
              className="flex h-[48px] w-full items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-red-100 hover:text-pink-600 md:flex-none md:justify-start md:p-2 md:px-3">
              <PowerIcon className="w-6"/>
              <div>Sign Out</div>
            </button>
          </div>
        </SignedIn>

        {/* Signed-Out View */}
        <SignedOut>
          <SignInButton mode="modal">
            <button title="Sign in" className="flex h-[48px] w-full items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-red-100 hover:text-pink-600 md:flex-none md:justify-start md:p-2 md:px-3">
              <PowerIcon className="w-6"/>
              <div>Sign In</div>
            </button>
          </SignInButton>
        </SignedOut>
      
        </>
      );
    }