"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { BellIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Notification {
  _id: string;
  postId: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

export default function NotificationsPage() {
  const { userId } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    async function fetchNotifications() {
      try {
        const res = await fetch(`/api/notifications?userId=${userId}`);
        const data = await res.json();
        setNotifications(data);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [userId]);

  async function markAsRead(notificationId: string) {
    await fetch(`/api/notifications/${notificationId}`, {
      method: "PUT",
    });
    setNotifications((prev) =>
        prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n))
      );
  
    setNotificationCount((prevCount) => prevCount - 1);
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <BellIcon className="w-6 h-6" />
        Notifications
      </h2>

      <div className="relative">
        {/* Notification count next to the bell icon */}
        {notificationCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
            {notificationCount}
          </span>
        )}
      </div>

      {loading ? (
        <p>Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <p>No new notifications.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li
              key={notification._id}
              className={`p-3 border rounded-md shadow-sm ${
                notification.isRead ? "bg-gray-100" : "bg-white"
              }`}
            >
              <p className="text-gray-800">{notification.message}</p>
              <div className="text-xs text-gray-500">
                {new Date(notification.createdAt).toLocaleString()}
              </div>
              {!notification.isRead && (
                <button
                  onClick={() => markAsRead(notification._id)}
                  className="mt-2 px-3 py-1 bg-red-200 text-pink-600 text-xs rounded hover:bg-red-300 transition"
                >
                  Mark as Read
                </button>
              )}
              <Link
                  href={`/posts/${notification.postId}`}
                  className="mt-2 px-3 py-1 bg-red-200 text-pink-600 text-xs rounded hover:bg-red-300 transition"
                >
                  Go to Comment
                </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
