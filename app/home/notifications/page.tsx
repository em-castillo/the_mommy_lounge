"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { BellIcon } from "@heroicons/react/24/outline";
import Link from "next/link";

interface Notification {
  _id: string;
  userId: string;
  postId: string;
  commentId?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

interface NotificationsPageProps {
    notificationCount: number;
    setNotificationCount: React.Dispatch<React.SetStateAction<number>>;
  }
  

export default function NotificationsPage({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    notificationCount,
    setNotificationCount,
  }: NotificationsPageProps) {
    const { userId } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
      
    const fetchNotifications = useCallback(async () => {
        try {
          const res = await fetch(`/api/notifications?userId=${userId}`);
          const data: Notification[] = await res.json();
          setNotifications(data);
        } catch (error) {
          console.error("Error fetching notifications:", error);
        } finally {
          setLoading(false);
        }
      }, [userId]);
    
      useEffect(() => {
        if (!userId) return;
        fetchNotifications();
      }, [userId, fetchNotifications]);

      
        async function markAsRead(notificationId: string) {
          try {
            const res = await fetch(`/api/notifications/${notificationId}`, {
              method: "PUT",
            });
      
            if (!res.ok) {
              throw new Error("Failed to mark notification as read");
            }
      
            // Update the notifications list
            setNotifications((prev) =>
              prev.map((n) =>
                n._id === notificationId ? { ...n, isRead: true } : n
              )
            );
      
            // Update notification count
            setNotificationCount((prevCount) => prevCount - 1); // Correctly update the notification count
          } catch (error) {
            console.error("Error marking notification as read:", error);
          }
        }
      
  

    return (
        <div className="p-4">
          <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
            <BellIcon className="w-6 h-6" />
            Notifications
          </h2>
    
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
                  <div className="flex gap-2">
                    {!notification.isRead && (
                      <button
                        onClick={() => markAsRead(notification._id)}
                        className="mt-2 px-3 py-1 bg-red-200 text-pink-600 text-xs rounded hover:bg-red-300 transition"
                      >
                        Mark as Read
                      </button>
                    )}
                    <Link
                      href={`/posts/${notification.postId}?comment=${notification.commentId}`}
                      className="mt-2 px-3 py-1 bg-red-200 text-pink-600 text-xs rounded hover:bg-red-300 transition"
                    >
                      Go to Comment
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      );
    }