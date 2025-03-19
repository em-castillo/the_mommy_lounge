"use client";

import { useEffect, useState } from "react";
import { SignedIn } from "@clerk/nextjs";
import { BellIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

export default function NotificationsButton() {
  const [notificationCount, setNotificationCount] = useState<number>(0);

  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const res = await fetch("/api/notifications/count"); // API route to get unread notifications count
        if (!res.ok) throw new Error("Failed to fetch notifications count: ${res.statusText}");
        const data = await res.json();
        setNotificationCount(data.count); // Update the notification count
      } catch (error) {
        console.error("Error fetching notifications count:", error);
      }
    };

    fetchNotificationCount();
  }, []); // Only run once when the component mounts

  return (
    <SignedIn>
      <Link href="/home/notifications">
        <button className="relative flex h-[48px] w-full items-center justify-center gap-2 rounded-md bg-gray-50 p-3 text-sm font-medium hover:bg-red-100 hover:text-pink-600 md:flex-none md:justify-start md:p-2 md:px-3">
          <BellIcon className="w-6" />
          <div>Notifications</div>
          {/* Notification Count */}
          {notificationCount > 0 && (
            <span className="absolute top-2 right-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {notificationCount}
            </span>
          )}
        </button>
      </Link>
    </SignedIn>
  );
}
