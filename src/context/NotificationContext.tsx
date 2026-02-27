import React, {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
} from "react";

export interface NotificationItem {
  id: string;
  title: string;
  description?: string;
  read: boolean;
  createdAt: Date;
}

interface NotificationContextValue {
  notifications: NotificationItem[];
  hasUnread: boolean;
  markAllAsRead: () => void;
  addNotification: (notification: Omit<NotificationItem, "id" | "createdAt">) => void;
}

const NotificationContext = createContext<NotificationContextValue | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const hasUnread = useMemo(
    () => notifications.some((n) => !n.read),
    [notifications]
  );

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const addNotification: NotificationContextValue["addNotification"] = (
    notification
  ) => {
    setNotifications((prev) => [
      {
        id: crypto.randomUUID(),
        createdAt: new Date(),
        ...notification,
      },
      ...prev,
    ]);
  };

  const value: NotificationContextValue = {
    notifications,
    hasUnread,
    markAllAsRead,
    addNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) {
    throw new Error(
      "useNotifications must be used within a NotificationProvider"
    );
  }
  return ctx;
}

