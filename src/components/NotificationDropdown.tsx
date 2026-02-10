import { useState, useRef, useEffect } from "react";
import {
  Bell,
  Heart,
  MessageCircle,
  UserPlus,
  AtSign,
} from "lucide-react";
import {
  getNotifications,
  markNotificationRead,
} from "../services/notification.service";

/* =========================
   TYPES
   ========================= */
interface Notification {
  _id: string;
  type: "follow" | "like" | "comment" | "story_view" | "message";
  actor: {
    _id: string;
    username: string;
    avatar: string;
  };
  isRead: boolean;
  createdAt: string;
}

/* =========================
   COMPONENT
   ========================= */
export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /* =========================
     UNREAD COUNT
     ========================= */
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  /* =========================
     FETCH NOTIFICATIONS
     ========================= */
  useEffect(() => {
    if (!isOpen) return;

    const fetchNotifications = async () => {
      try {
        const res = await getNotifications();
        setNotifications(res.data.notifications || []);
      } catch (err) {
        console.error("Failed to load notifications", err);
      }
    };

    fetchNotifications();
  }, [isOpen]);

  /* =========================
     CLICK OUTSIDE
     ========================= */
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* =========================
     MARK ONE AS READ
     ========================= */
  const markAsRead = async (id: string) => {
    try {
      await markNotificationRead(id);

      setNotifications((prev) =>
        prev.map((n) =>
          n._id === id ? { ...n, isRead: true } : n
        )
      );
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  /* =========================
     MARK ALL AS READ
     ========================= */
  const markAllAsRead = async () => {
    try {
      const unread = notifications.filter((n) => !n.isRead);

      await Promise.all(
        unread.map((n) => markNotificationRead(n._id))
      );

      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true }))
      );
    } catch (err) {
      console.error("Failed to mark all as read", err);
    }
  };

  /* =========================
     ICON RENDERER
     ========================= */
  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "like":
        return <Heart className="w-5 h-5 text-pink-500 fill-pink-500" />;
      case "comment":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-purple-500" />;
      case "story_view":
        return <AtSign className="w-5 h-5 text-green-500" />;
      case "message":
        return <MessageCircle className="w-5 h-5 text-indigo-500" />;
    }
  };

  /* =========================
     HELPERS
     ========================= */
  const formatTime = (date: string) =>
    new Date(date).toLocaleString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

  const getText = (n: Notification) => {
    switch (n.type) {
      case "follow":
        return "started following you";
      case "like":
        return "liked your post";
      case "comment":
        return "commented on your post";
      case "story_view":
        return "viewed your story";
      case "message":
        return "sent you a message";
    }
  };

  /* =========================
     JSX
     ========================= */
  return (
    <div ref={dropdownRef} className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen((p) => !p)}
        className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      >
        <Bell className="w-6 h-6 text-gray-700 dark:text-gray-300" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-5 h-5 bg-pink-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="fixed top-16 right-4 w-[calc(100vw-2rem)] sm:w-[420px] lg:w-[460px] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-[999] max-h-[32rem] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Notifications
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-sm text-purple-600 dark:text-purple-400 font-medium"
              >
                Mark all as read
              </button>
            )}
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-12 text-center">
                <Bell className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No notifications yet
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n._id}
                  onClick={() => markAsRead(n._id)}
                  className={`w-full flex items-start gap-3 p-4 text-left border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                    !n.isRead
                      ? "bg-purple-50/50 dark:bg-purple-900/10"
                      : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={n.actor.avatar}
                      alt={n.actor.username}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 rounded-full p-1">
                      {getIcon(n.type)}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 dark:text-white">
                      <span className="font-semibold">
                        {n.actor.username}
                      </span>{" "}
                      <span className="text-gray-600 dark:text-gray-400">
                        {getText(n)}
                      </span>
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTime(n.createdAt)}
                    </p>
                  </div>

                  {!n.isRead && (
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2" />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
