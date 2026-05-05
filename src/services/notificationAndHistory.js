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
