import { request } from "../configs/axios";

const getAllShowTimes = (params) => {
  return request({
    url: '/admin/showtime/all',
    method: "GET",
    params,
  });
};

const getShowTimeDetail = (id) => {
  return request({
    url: `/admin/showtime/showtimeDetail/${id}`,
    method: "GET",
  });
};

const addNewShowTime = (data) => {
  return request({
    url: `/admin/showtime/add`,
    method: "POST",
    data,
  });
};

const updateShowTime = (data) => {
  return request({
    url: `/admin/showtime/update`,
    method: "PUT",
    data,
  });
};

const deleteOneShowTime = (id) => {
  return request({
    url: `/admin/showtime/delete/${id}`,
    method: "DELETE",
  });
};

const getShowTimeToday = (params) => {
  return request({
    url: '/showtime/today',
    method: "GET",
    params,
  });
};

const getShowTimeUpcoming = (params) => {
  return request({
    url: '/showtime/upcoming',
    method: "GET",
    params,
  });
};

export {  
  getAllShowTimes,
  getShowTimeDetail,
  addNewShowTime,
  updateShowTime,
  deleteOneShowTime,
  getShowTimeToday,
  getShowTimeUpcoming,
};
