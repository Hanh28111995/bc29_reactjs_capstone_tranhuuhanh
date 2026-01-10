import axios from "axios";
import { request } from "../configs/axios";

const fetchTheaterListAPI = () => {
  return request({
    url: `/admin/theater/all`,
    method: "GET",
  });
};
const fetchTheaterDetailAPI = (id) => {
  return request({
    url: `/admin/theater/${id}`,
    method: "GET",
  });
};

const addTheaterAPI = (data) => {
  return request({
    url: "/admin/theater/add",
    method: "POST",
    data,
  });
};

const updateTheaterAPI = (id, data) => {
  return request({
    url: `/admin/theater/update/${id}`,
    method: "PUT",
    data,
  });
};
const deleteTheaterAPI = (id) => {
  return request({
    url: `/admin/theater/delete/${id}`,
    method: "DELETE",
  });
};

export {
  fetchTheaterListAPI,
  fetchTheaterDetailAPI,
  addTheaterAPI,
  updateTheaterAPI,
  deleteTheaterAPI,
};
