import { useState, useEffect } from "react";
import NotificationsButton from "./notifications_count";
import NotificationsPage from "../../home/notifications/page";

export default function NotificationsWrapper() {
  const [notificationCount, setNotificationCount] = useState<number>(0);

  // Fetch initial notification count when the component mounts
  useEffect(() => {
    const fetchNotificationCount = async () => {
      try {
        const res = await fetch("/api/notifications/count");
        if (!res.ok) throw new Error("Failed to fetch notifications count");
        const data = await res.json();
        setNotificationCount(data.count); // Set the initial count
      } catch (error) {
        console.error("Error fetching notifications count:", error);
      }
    };

    fetchNotificationCount();
  }, []); // Run only once when the component mounts

  return (
    <div>
      <NotificationsButton notificationCount={notificationCount} />
      <NotificationsPage 
        notificationCount={notificationCount} 
        setNotificationCount={setNotificationCount} 
      />
    </div>
  );
}
