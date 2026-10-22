import React, { useEffect } from "react";
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

const NotificationProvider = ({ children }) => {
  const { user, loadingUser } = useContext(UserContext);

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      setHasMore(false);
      return;
    }
    fetchNotifications(1);
    const socket = io(BASE_URL, {
      auth: (cb) => cb({ token: `Bearer ${localStorage.getItem("token")}` }),
    });
    socket.on("notification:new", (notification) => {
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
      const userId = user._id;
      //  console.log(user);
      socket.disconnect()
    };
  }, [user, fetchNotifications]);

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
