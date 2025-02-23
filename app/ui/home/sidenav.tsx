"use client";

import Link from "next/link";
import NavLinks from "@/app/ui/home/nav-links";
import TMLlogo from "@/app/ui/TML-logo";
import { PowerIcon } from "@heroicons/react/24/outline";
import { SignedIn, SignedOut, SignInButton, UserButton, useClerk } from "@clerk/nextjs";

export default function SideNav() {
  const { signOut } = useClerk();

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2">
      <Link
        className="mb-2 flex h-20 items-end justify-start rounded-md bg-red-200 p-4 md:h-40"
        href="/"
      >
        <div className="w-32 text-black md:w-80">
          <TMLlogo />
        </div>
      </Link>

      <div className="flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>

        {/* Signed-In View */}
        <SignedIn>
          <div className="flex flex-col items-center md:items-start">
            <UserButton afterSignOutUrl="/" />

            <button
              onClick={() => signOut()}
              className="mt-4 flex h-[48px] w-full items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-red-100 hover:text-pink-600 md:flex-none md:justify-start md:p-2 md:px-3"
            >
              <PowerIcon className="w-6" />
              <div className="hidden md:block">Sign Out</div>
            </button>
          </div>
        </SignedIn>

        {/* Signed-Out View */}
        <SignedOut>
          <SignInButton mode="modal">
            <button className="flex h-[48px] w-full items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-red-100 hover:text-pink-600 md:flex-none md:justify-start md:p-2 md:px-3">
              <PowerIcon className="w-6" />
              <div className="hidden md:block">Sign In</div>
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </div>
  );
}
