"use client";

import { createContext, useContext, useState, useEffect } from "react";

interface NotificationsContextType {
  notificationCount: number;
  setNotificationCount: (count: number) => void;
  refreshNotificationCount: () => Promise<void>;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notificationCount, setNotificationCount] = useState<number>(0);

  const fetchNotificationCount = async () => {
    try {
      const res = await fetch("/api/notifications/count");
      if (!res.ok) throw new Error("Failed to fetch notifications count");
      const data = await res.json();
      setNotificationCount(data.count);
    } catch (error) {
      console.error("Error fetching notifications count:", error);
    }
  };

  useEffect(() => {
    fetchNotificationCount();
  }, []);

  return (
    <NotificationsContext.Provider
      value={{
        notificationCount,
        setNotificationCount,
        refreshNotificationCount: fetchNotificationCount,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}
