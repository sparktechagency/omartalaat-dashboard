import React, { useState, useEffect } from "react";
import moment from "moment";
import {
  useGetNotificationQuery,
  useReadAllNotificationMutation,
  useReadOneNotificationMutation,
} from "../../redux/apiSlices/notificationSlice";
import { message, Pagination, Spin } from "antd";
import { TbClockHour10 } from "react-icons/tb";
import { BiBell, BiCheck } from "react-icons/bi";
import Spinner from "../../components/common/Spinner";

const Notifications = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [notifications, setNotifications] = useState([]);
  const [readingId, setReadingId] = useState(null);
  const [totalItems, setTotalItems] = useState(0);

  const {
    data: getNotification,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useGetNotificationQuery({ page: currentPage, limit: pageSize });

  const [readOneNotification, { isLoading: readingOne }] =
    useReadOneNotificationMutation();

  const [readAllNotification, { isLoading: readingAll }] =
    useReadAllNotificationMutation();

  // Update notifications when data fetched
  useEffect(() => {
    if (getNotification?.success) {
      setNotifications(getNotification.data || []);
      setTotalItems(getNotification.pagination?.total || 0);
    }
  }, [getNotification]);

  const formatTime = (timestamp) =>
    timestamp ? moment(timestamp).fromNow() : "Just now";
  const handleMarkAsRead = async (notificationId) => {
    try {
      setReadingId(notificationId);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: true }
            : notification
        )
      );

      const res = await readOneNotification(notificationId);
      if (res.data?.success) {
        message.success("Marked as read");
        refetch();
      } else {
        setNotifications((prev) =>
          prev.map((notification) =>
            notification._id === notificationId
              ? { ...notification, read: false }
              : notification
          )
        );
        message.error("Could not mark as read");
      }
    } catch (err) {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === notificationId
            ? { ...notification, read: false }
            : notification
        )
      );
      message.error("An error occurred");
    } finally {
      setReadingId(null);
    }
  };


  const handleMarkAllAsRead = async () => {
    try {
      const res = await readAllNotification();
      if (res.data?.success) {
        message.success("All notifications marked as read");
        refetch();
      } else {
        message.error("Failed to mark all as read");
      }
    } catch (err) {
      message.error("An error occurred");
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "📢";
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "warning":
        return "border-l-yellow-500 bg-yellow-50";
      case "info":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-green-500 bg-green-50";
    }
  };

  if (isLoading || readingAll) {
    return (
     <Spinner />
    );
  }

  if (isError) {
    return (
      <div className="px-6 py-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BiBell className="text-primary" />
            All Notifications
          </h2>
        </div>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600 mb-3">
            Error loading notifications. Please try again later.
          </p>
          <button
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-200"
            onClick={refetch}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((item) => !item.read).length;

  return (
    <div className="px-6 py-4 mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <BiBell className="text-primary" />
            All Notifications
          </h2>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center gap-2"
            onClick={handleMarkAllAsRead}
            disabled={readingAll}
          >
            <BiCheck size={18} />
            Mark All as Read
          </button>
        )}
      </div>

      {/* Notifications List */}
      {isFetching && currentPage > 1 ? (
        <div className="flex justify-center items-center h-96">
          <Spinner  />
        </div>
      ) : (
        <div className="space-y-3 min-h-[500px]">
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <div
                key={notification._id}
                className={`
                  relative overflow-hidden rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all duration-200
                  ${getTypeColor(notification.type)}
                  ${
                    !notification.read
                      ? "border-2  border-blue-300 bg-red-100"
                      : "border border-gray-200"
                  }
                `}
              >
                <div className="px-4 py-2 flex items-start gap-4">
                  {/* Icon */}
                  <div
                    className={`
                    flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center
                    ${
                      !notification.read
                        ? "bg-primary text-white animate-pulse"
                        : "bg-gray-100 text-gray-600"
                    }
                  `}
                  >
                    <BiBell size={20} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-gray-800">
                        {notification.type === "warning"
                          ? "Warning"
                          : "Notification"}
                      </h3>
                      <span className="text-lg">
                        {getTypeIcon(notification.type)}
                      </span>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>

                    <p className="text-gray-700 mb- leading-relaxed">
                      {notification.message || "New Notification"}
                    </p>

                    <div className="flex items-center text-sm text-gray-500">
                      <TbClockHour10 className="mr-1" />
                      {formatTime(notification.createdAt)}
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="flex-shrink-0">
                    {!notification.read ? (
                      <button
                        className="
                          bg-white hover:bg-gray-50 text-primary border border-primary 
                          px-3 py-1.5 rounded-lg text-sm font-medium
                          transition-all duration-200 hover:shadow-sm
                          flex items-center gap-2 min-w-[100px] justify-center
                        "
                        onClick={() => handleMarkAsRead(notification._id)}
                        disabled={readingId === notification._id}
                      >
                        {readingId === notification._id ? (
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                            <span>Reading...</span>
                          </div>
                        ) : (
                          <>
                            <BiCheck size={16} />
                            Mark as Read
                          </>
                        )}
                      </button>
                    ) : (
                      <span className="bg-green-100 text-green-700 px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-1">
                        <BiCheck size={16} />
                        Read
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <BiBell size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">
                No notifications available.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                You're all caught up! New notifications will appear here.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalItems > 0 && (
        <div className="mt-8 flex justify-center">
          <Pagination
            current={currentPage}
            pageSize={pageSize}
            total={totalItems}
            onShowSizeChange={(current, size) => {
              setPageSize(size);
              setCurrentPage(1); 
            }}
            onChange={(page) => {
              setCurrentPage(page);
            }}
            
            className="custom-pagination"
          />
        </div>
      )}
    </div>
  );
};

export default Notifications;
