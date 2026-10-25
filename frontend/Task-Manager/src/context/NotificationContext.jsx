import React, { useEffect, useRef } from "react";
import { useContext } from "react";
import { useState } from "react";
import { createContext } from "react";
import { UserContext } from "./UserContext";
import { useCallback } from "react";
import axiosInstance from "../utils/axiosinstance";
import { API_PATHS, BASE_URL } from "../utils/apiPaths";
import { io } from "socket.io-client";
import { toast } from "react-hot-toast";

export const NotificationContext = createContext();
const PAGE_SIZE = 10;
const POLL_EVERY_MS = 20 * 1000;

// Socket.io needs a long-running server (local dev or Render).
// A Vercel backend can't keep sockets open, so the app polls instead.
// VITE_ENABLE_SOCKET = "true" | "false". When unset: true in `npm run dev`, false in production builds.
const SOCKET_ENABLED =
  String(import.meta.env.VITE_ENABLE_SOCKET ?? import.meta.env.DEV)
    .trim()
    .toLowerCase() === "true";

const NotificationProvider = ({ children }) => {
  const { user, loadingUser } = useContext(UserContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);
  // ids already shown, so a poll only toasts notifications that are new
  const seenIdsRef = useRef(new Set());

  const fetchNotifications = useCallback(async (pageToLoad = 1) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        API_PATHS.NOTIFICATIONS.GET_ALL,
        {
          params: { page: pageToLoad, limit: PAGE_SIZE },
        },
      );
      const data = response.data;
      data.notifications.forEach((n) => seenIdsRef.current.add(String(n._id)));
      setNotifications((prev) => {
        if (pageToLoad === 1) return data.notifications;
        const existingIds = new Set(prev.map((n) => n._id));
        return [
          ...prev,
          ...data.notifications.filter((n) => !existingIds.has(n._id)),
        ];
      });
      setUnreadCount(data.unreadCount);
      setHasMore(data.hasMore);
      setPage(pageToLoad);
    } catch (error) {
      console.error({
        message: "Error fetching notifications",
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  // Polling mode: load the newest page and add only what we haven't seen yet
  const pollNotifications = useCallback(async () => {
    try {
      const response = await axiosInstance.get(
        API_PATHS.NOTIFICATIONS.GET_ALL,
        {
          params: { page: 1, limit: PAGE_SIZE },
        },
      );
      const data = response.data;
      const fresh = data.notifications.filter(
        (n) => !seenIdsRef.current.has(String(n._id)),
      );
      fresh.forEach((n) => seenIdsRef.current.add(String(n._id)));

      if (fresh.length > 0) {
        setNotifications((prev) => {
          const existingIds = new Set(prev.map((n) => String(n._id)));
          return [
            ...fresh.filter((n) => !existingIds.has(String(n._id))),
            ...prev,
          ];
        });
      }
      setUnreadCount(data.unreadCount);
      fresh
        .filter((n) => !n.read)
        .forEach((n) => toast(n.message, { icon: "🔔" }));
    } catch (error) {
      console.error({
        message: "Error polling notifications",
        error: error.message,
      });
    }
  }, []);

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(false);
      return;
    }
    seenIdsRef.current = new Set();
    const firstLoad = fetchNotifications(1);

    if (SOCKET_ENABLED) {
      const socket = io(BASE_URL, {
        auth: (cb) => cb({ token: `Bearer ${localStorage.getItem("token")}` }),
      });
      socket.on("notification:new", (notification) => {
        const id = String(notification._id);
        if (seenIdsRef.current.has(id)) return;
        seenIdsRef.current.add(id);
        setNotifications((prev) => [notification, ...prev]);
        setUnreadCount((count) => count + 1);
        toast(notification.message, { icon: "🔔" });
      });

      socket.io.on("reconnect", () => fetchNotifications(1));

      socket.on("connect_error", (error) => {
        console.error({
          message: "Notification socket error",
          error: error.message,
        });
      });
      return () => {
        socket.disconnect();
      };
    }

    // Polling mode: every 20 s, paused while the tab is hidden
    let timerId = null;
    let active = true;
    let ready = false; // true after the first load, so its items aren't toasted

    const stopPolling = () => {
      clearInterval(timerId);
      timerId = null;
    };
    const startPolling = () => {
      if (!active || !ready || timerId || document.hidden) return;
      timerId = setInterval(pollNotifications, POLL_EVERY_MS);
    };
    const handleVisibility = () => {
      if (document.hidden) {
        stopPolling();
      } else if (ready) {
        pollNotifications(); // catch up as soon as the tab is visible again
        startPolling();
      }
    };

    firstLoad.then(() => {
      ready = true;
      startPolling();
    });
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      active = false;
      stopPolling();
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [user, fetchNotifications, pollNotifications]);

  const markAsRead = async (id) => {
    const targetId = String(id);
    const target = notifications.find((n) => String(n._id) === targetId);
    if (!target || target.read) return;
    setNotifications((prev) =>
      prev.map((n) => (String(n._id )=== targetId ? { ...n, read: true } : n)),
    );
    setUnreadCount((count) => Math.max(count - 1, 0));

    try {
      await axiosInstance.put(API_PATHS.NOTIFICATIONS.MARK_AS_READ(id));
    } catch (error) {
      console.error({
        message: "Error marking notification as read",
        error: error.message,
      });
      fetchNotifications(1);
    }
  };

  const markAllRead = async () => {
    try {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    const result=  await axiosInstance.put(API_PATHS.NOTIFICATIONS.MARK_ALL_AS_READ);
    console.log(result);
    
    } catch (error) {
      console.error({
        message: "Error marking notifications",
        error: error.message,
      });
    }
  };
  const deleteNotification = async (id) => {
    const target = notifications.find((n) => n._id === id);
    setNotifications((prev) => prev.filter((n) => n._id !== id));
    if (target && !target.read) {
      setUnreadCount((count) => Math.max(count - 1, 0));
    }

    try {
      await axiosInstance.delete(API_PATHS.NOTIFICATIONS.DELETE(id));
    } catch (error) {
      console.error({
        message: "Error deleting notification",
        error: error.message,
      });
      fetchNotifications(1);
    }
  };
  const clearAll = async () => {
    setNotifications([]);
    setHasMore(false);
    setUnreadCount(0);
    try {
      await axiosInstance.delete(API_PATHS.NOTIFICATIONS.CLEAR_ALL);
    } catch (error) {
      console.error({
        message: "Error clearing notifications",
        error: error.message,
      });
      fetchNotifications(1);
    }
  };
  const loadMore = () => {
    if (!loading && hasMore) fetchNotifications(page + 1);
  };

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        hasMore,
        loading,
        loadMore,
        markAsRead,
        markAllRead,
        deleteNotification,
        clearAll,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
