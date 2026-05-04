import { request } from "../configs/axios";

export const fetchHistoryAPI = (role) => {
  let activeRole = role === "admin" ? "admin" : role; // Giữ nguyên admin nếu backend đã có nhánh admin
  return request({
    url: `/${activeRole}/history/tickets`,
    method: "GET",
  });
};

export const fetchNotificationAPI = (role) => {
  let activeRole = role === "admin" ? "admin" : role;
  return request({
    url: `/${activeRole}/notifications`,
    method: "GET",
  });
};

export const fetchChangeStatusNotificationAPI = (role, id) => {
  let activeRole = role === "admin" ? "admin" : role;
  return request({
    url: `/${activeRole}/notifications/read/${id}`,
    method: "PUT",
  });
};

