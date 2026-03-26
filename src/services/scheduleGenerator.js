import { request } from "../configs/axios";


export const getScheduleListAPI = () => {
  return request({
    url: "/admin/schedule-generator/get",
    method: "GET",
  });
};


export const createScheduleAPI = (data) => {
  return request({
    url: "/admin/schedule-generator/create",
    method: "POST",
    data,
  });
};


export const updateScheduleAPI = (data) => {
  return request({
    url: "/admin/schedule-generator/update",
    method: "PUT",
    data,
  });
};
