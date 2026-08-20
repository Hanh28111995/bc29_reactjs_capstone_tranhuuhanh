import { request } from "../configs/axios";

export const fetchHistoryAPI = (role) => {
  return request({
    url: `/${role}/history/tickets`,
    method: "GET",
  });
};

export const fetchNotificationAPI = (role) => {
  return request({
    url: `/${role}/notifications`,
    method: "GET",
  });
};

export const formatNotificationsForStore = (notifications) => {
  const list = Array.isArray(notifications)
    ? notifications
    : Array.isArray(notifications?.notifications)
      ? notifications.notifications
      : Array.isArray(notifications?.data)
        ? notifications.data
        : Array.isArray(notifications?.items)
          ? notifications.items
          : [];
  return list.map((noti) => ({
    ...noti,
    note: noti.message || noti.note || "Thông báo mới",
    status: noti.status ?? false,
    createdAt: noti.createdAt ? new Date(noti.createdAt) : new Date(),
  }));
};

export const fetchChangeStatusNotificationAPI = (role, id) => {
  return request({
    url: `/${role}/notifications/read/${id}`,
    method: "PUT",
  });
};

export const markAllNotificationsAsReadAPI = (role) => {
  return request({
    url: `/${role}/notifications/read-all`,
    method: "PUT",
  });
};
