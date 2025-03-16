"use client";

import { useState } from "react";
import Link from "next/link";
import NavLinks from "@/app/ui/home/nav-links";
import UserLinks from "./user-links";
import TMLlogo from "@/app/ui/TML-logo";

export default function SideNav() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); 

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev); 
  };

  return (
    <div className="flex h-full flex-col px-3 py-4 md:px-2 ">
      <Link
        className="mb-2 flex h-40 items-end justify-start rounded-md bg-red-200 p-4 md:h-40"
        href="/">
        <div className="w-32 text-black md:w-80">
          <TMLlogo />
        </div>
      </Link>

      {/* Button for toggling dropdown menu on small screens */}
      <div className="md:hidden mb-4">
        <button
          onClick={toggleDropdown}
          className="w-full bg-red-50 text-pink-500 rounded-md px-4 py-3 hover:bg-red-100 hover:text-pink-600 focus:outline-none"
        >
          Menu
        </button>
      </div>

      {/* Dropdown Menu for small screens */}
      {isDropdownOpen && (
        <div className="md:hidden flex flex-col gap-2">
          <NavLinks /> 
          <UserLinks /> 
        </div>
      )}

      {/* Regular Sidebar for medium and larger screens */}
      <div className="hidden md:flex flex grow flex-row justify-between space-x-2 md:flex-col md:space-x-0 md:space-y-2">
        <NavLinks />
        <div className="hidden h-auto w-full grow rounded-md bg-gray-50 md:block"></div>

         <UserLinks/>
      
      </div>
    </div>
  );
}
