
import { useState, useEffect } from "react";

import {
  Bell,
  CheckCheck,
  Check,
  Trash2,
  RefreshCw,
  Inbox,
  BriefcaseBusiness,
  AlertCircle,
  Info,
} from "lucide-react";

import DashboardLayout from "../layouts/DashboardLayout";
import { useAuth } from "../context/AuthContext";

import {
  getMyNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
} from "../services/notificationService";

function Notifications() {
  const { token } = useAuth();

  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getMyNotifications(token);

      setNotifications(response.notifications || []);
      setUnreadCount(response.unreadCount || 0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load notifications."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchNotifications();
    }
  }, [token]);

  // Mark one notification as read
  const handleMarkAsRead = async (id) => {
    try {
      setActionLoading(true);

      await markNotificationAsRead(id, token);

      setNotifications((previous) =>
        previous.map((item) =>
          item._id === id
            ? { ...item, isRead: true, readAt: new Date() }
            : item
        )
      );

      setUnreadCount((previous) =>
        Math.max(0, previous - 1)
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to update notification."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Mark all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      setActionLoading(true);
      setError("");

      await markAllNotificationsAsRead(token);

      setNotifications((previous) =>
        previous.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt || new Date(),
        }))
      );

      setUnreadCount(0);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to mark notifications as read."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Delete notification
  const handleDelete = async (id) => {
    try {
      setActionLoading(true);
      setError("");

      const notification = notifications.find(
        (item) => item._id === id
      );

      await deleteNotification(id, token);

      setNotifications((previous) =>
        previous.filter((item) => item._id !== id)
      );

      if (notification && !notification.isRead) {
        setUnreadCount((previous) =>
          Math.max(0, previous - 1)
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to delete notification."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // Notification icon
  const getNotificationIcon = (type) => {
    switch (type) {
      case "Application":
        return <BriefcaseBusiness size={21} />;

      case "Shortlisted":
        return <Check size={21} />;

      case "Rejected":
        return <AlertCircle size={21} />;

      case "Hired":
        return <CheckCheck size={21} />;

      default:
        return <Info size={21} />;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case "Shortlisted":
      case "Hired":
        return "bg-green-100 text-green-600";

      case "Rejected":
        return "bg-red-100 text-red-600";

      case "Application":
        return "bg-blue-100 text-blue-600";

      default:
        return "bg-purple-100 text-purple-600";
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto space-y-7">

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-xl">
              <Bell className="text-blue-600" size={26} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Notifications
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Stay updated on your career activities.
              </p>
            </div>
          </div>

          <button
            onClick={fetchNotifications}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            <AlertCircle size={20} />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Notification Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
            <p className="text-sm text-gray-500">
              Total Notifications
            </p>

            <h2 className="text-3xl font-bold text-gray-900 mt-2">
              {notifications.length}
            </h2>
          </div>

          <div className="bg-white border border-gray-100 shadow-sm rounded-2xl p-5">
            <p className="text-sm text-gray-500">
              Unread Notifications
            </p>

            <h2 className="text-3xl font-bold text-blue-600 mt-2">
              {unreadCount}
            </h2>
          </div>
        </div>

        {/* Notification List Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-gray-800">
              Recent Activity
            </h2>

            <p className="text-sm text-gray-500">
              Your latest updates and alerts.
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={actionLoading}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 disabled:opacity-50"
            >
              <CheckCheck size={17} />
              Mark all as read
            </button>
          )}
        </div>

        {/* Loading */}
        {loading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <RefreshCw
              className="animate-spin text-blue-600 mx-auto mb-3"
              size={28}
            />

            <p className="text-gray-500">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          /* Empty State */
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Inbox
                size={30}
                className="text-blue-500"
              />
            </div>

            <h3 className="text-lg font-bold text-gray-800">
              No notifications yet
            </h3>

            <p className="text-sm text-gray-500 mt-2">
              We'll let you know when there are new updates.
            </p>
          </div>
        ) : (
          /* Notifications */
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`bg-white border rounded-2xl p-5 shadow-sm transition ${
                  notification.isRead
                    ? "border-gray-100"
                    : "border-blue-200 bg-blue-50/30"
                }`}
              >
                <div className="flex items-start gap-4">

                  {/* Icon */}
                  <div
                    className={`p-3 rounded-xl shrink-0 ${getNotificationColor(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(notification.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-gray-800">
                        {notification.title}
                      </h3>

                      {!notification.isRead && (
                        <span className="w-2 h-2 rounded-full bg-blue-600" />
                      )}
                    </div>

                    <p className="text-sm text-gray-600 mt-2 leading-6">
                      {notification.message}
                    </p>

                    {notification.relatedJob && (
                      <p className="text-xs text-blue-600 mt-2 font-medium">
                        Related Job: {notification.relatedJob.title}
                      </p>
                    )}

                    <p className="text-xs text-gray-400 mt-3">
                      {new Date(
                        notification.createdAt
                      ).toLocaleString()}
                    </p>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-4 mt-4">
                      {!notification.isRead && (
                        <button
                          onClick={() =>
                            handleMarkAsRead(notification._id)
                          }
                          disabled={actionLoading}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-800 disabled:opacity-50"
                        >
                          Mark as read
                        </button>
                      )}

                      <button
                        onClick={() =>
                          handleDelete(notification._id)
                        }
                        disabled={actionLoading}
                        className="flex items-center gap-1 text-sm font-semibold text-red-500 hover:text-red-700 disabled:opacity-50"
                      >
                        <Trash2 size={15} />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default Notifications;
