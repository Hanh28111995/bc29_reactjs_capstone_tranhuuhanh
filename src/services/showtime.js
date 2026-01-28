import { request } from "../configs/axios";



const getAllShowTimes = () => {
  return request({
    url: '/admin/showtime/all',
    method: "GET",
  });
};

const getShowTimeDetail = (id) => {
  return request({
    url: `/admin/showtime/${id}`,
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

export {  
  getAllShowTimes,
  getShowTimeDetail,
  addNewShowTime,
  updateShowTime,
  deleteOneShowTime,
};
