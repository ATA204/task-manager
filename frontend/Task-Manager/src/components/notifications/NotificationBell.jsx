import React, { useContext, useEffect, useRef, useState } from "react";
import { UserContext } from "../../context/UserContext";
import { NotificationContext } from "../../context/NotificationContext";
import { useNavigate } from "react-router-dom";
import { LuBell, LuCheckCheck, LuTrash2 } from "react-icons/lu";
import moment from "moment";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";

const NotificationBell = () => {
  const { user } = useContext(UserContext);
  const {
    notifications,
    unreadCount,
    hasMore,
    loading,
    loadMore,
    markAsRead,
    markAllRead,
    deleteNotification,
    clearAll,
  } = useContext(NotificationContext);
  const [open, setOpen] = useState(false);
  const panelRef = useRef(null);
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const getTasks = async () => {
    const response = await axiosInstance.get(API_PATHS.TASKS.GET_ALL_TASKS);
    setTasks(response?.data?.tasks);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target))
        setOpen(false);
    };
    getTasks();

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleOpen = (notification) => {
    markAsRead(notification._id);


    setOpen(false);
    const taskId = notification?.task;
    
    const clickedTask = tasks.find((t) => t._id === taskId);
    const assignedList = clickedTask?.assignedTo || [];
    const isAssigned = assignedList.some(
      (asignee) => String(asignee?._id) === String(user._id),
    );
    console.log(clickedTask);
    if (user.role === "admin") {
      navigate(`/admin/create-task`, {
        state: { taskId },
      });
    } else {
      if (isAssigned) {
        navigate(`/user/tasks/${taskId}`);
      }
      else{
        console.warn("you're Not assignee in this task any more")
      }
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-1 rounded-full  text-gray-700 hover:bg-gray-100 cursor-pointer"
      >
        <LuBell className="text-xl" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] min-h-[18px] h-[18px] px-1 bg-rose-500 rounded-full text-white flex items-center justify-center text-[10px] font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 mt-3 w-80 max-w-[calc(100vw-2rem)] bg-white border border-gray-200 rounded-lg shadow-lg z-99999999">
          {/* Titles */}
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-800">Notifications</h3>
            <div className="flex items-center gap-3">
              {unreadCount > 0 && (
                <button
                  className="flex items-center gap-1 text-xs text-primary cursor-pointer"
                  onClick={markAllRead}
                >
                  <LuCheckCheck /> Mark all read
                </button>
              )}
              {notifications.length > 0 && (
                <button
                  className="text-xs text-gray-500 hover:text-rose-500 cursor-pointer"
                  onClick={clearAll}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
          {/* notifications list */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-8">
                No notifications yet
              </p>
            ) : (
              notifications?.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleOpen(n)}
                  className={`flex gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${n.read ? "" : "bg-blue-50/60"} `}
                >
                  <span
                    className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${
                      n.read ? "bg-transparent" : "bg-primary"
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-gray-800">
                      {n.title}
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5 wrap-break-word">
                      {n.message}
                    </p>
                    <p className="text-[11px] text-gray-400 mt-1">
                      {moment(n.createdAt).fromNow()}
                    </p>
                  </div>
                  <button
                    className="text-gray-300 hover:text-rose-500 cursor-pointer self-start text-lg"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(n._id);
                    }}
                  >
                    <LuTrash2 />
                  </button>
                </div>
              ))
            )}
            {hasMore && (
              <button
                className="w-full text-xs text-primary py-2 hover:bg-gray-50 cursor-pointer"
                disabled={loading}
                onClick={loadMore}
              >
                {loading ? "Loading..." : "Load More"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
