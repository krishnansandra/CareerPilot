
import API from "./api";

const getConfig = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Get all notifications
export const getMyNotifications = async (token) => {
  const response = await API.get(
    "/notifications",
    getConfig(token)
  );

  return response.data;
};

// Mark one notification as read
export const markNotificationAsRead = async (id, token) => {
  const response = await API.put(
    `/notifications/${id}/read`,
    {},
    getConfig(token)
  );

  return response.data;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (token) => {
  const response = await API.put(
    "/notifications/mark-all-read",
    {},
    getConfig(token)
  );

  return response.data;
};

// Delete a notification
export const deleteNotification = async (id, token) => {
  const response = await API.delete(
    `/notifications/${id}`,
    getConfig(token)
  );

  return response.data;
};
