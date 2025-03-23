"use client";
  
  import { useState, useEffect, useCallback } from "react";
  import { useAuth } from "@clerk/nextjs";
  import { BellIcon } from "@heroicons/react/24/outline";
  import { useNotifications } from "../../context/NotificationsContext";
  import { useRouter } from 'next/navigation';

  
  // Define the Notification type
  interface Notification {
    _id: string;
    userId: string;
    postId: string;
    commentId?: string;
    message: string;
    isRead: boolean;
    createdAt: string;
  }
  
  
  export default function NotificationsPage() {
    const { userId } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { notificationCount, setNotificationCount, refreshNotificationCount } = useNotifications();
    const [loading, setLoading] = useState(true);
    const router = useRouter();
  
    const fetchNotifications = useCallback(async () => {
      try {
        const res = await fetch(`/api/notifications?userId=${userId}`);
        const data: Notification[] = await res.json();
        setNotifications(data);
        setNotificationCount(data.filter((n) => !n.isRead).length);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      } finally {
        setLoading(false);
      }
    }, [userId, setNotificationCount]);
  
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
  
        // Update notifications state
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notificationId ? { ...n, isRead: true } : n
          )
        );
  
        // Decrease the notification count
        setNotificationCount(Math.max(notificationCount - 1, 0));  

        await refreshNotificationCount();
      } catch (error) {
        console.error("Error marking notification as read:", error);
      }
    }

    function handleGoToComment(postId: string, commentId: string | undefined) {
        if (commentId) { 
          router.push(`/home/[category]/post/[id]?commentId=[commentId]`);
        } else {
          console.error("Comment ID is not available");
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
                  {notification.commentId && (
                    <button
                        onClick={() => handleGoToComment(notification.postId, notification.commentId)} 
                        className="mt-2 px-3 py-1 bg-red-200 text-pink-600 text-xs rounded hover:bg-red-300 transition"
                    >
                        Go to comment
                    </button>
                    )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  