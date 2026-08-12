import { request } from "../configs/axios";

const getPromotionListAPI = () => {
  return request({
    url: `/admin/promotion/all`,
    method: "GET",    
  });
};

const getPromotionDetailAPI = (id) => {
  return request({
    url: `/admin/promotion/${id}`,
    method: "GET",    
  });
};

const addPromotionAPI = (data) => {
  return request({
    url: "/admin/promotion/add",
    method: "POST",
    data,
  });
};

const updatePromotionAPI = (data) => {
  return request({
    url: "/admin/promotion/update",
    method: "PUT",
    data,
  });
};
const deletePromotionAPI = (movieId) => {
  return request({
    url: `/admin/promotion/delete/${movieId}`,
    method: "DELETE",
  });
};


export {
  getPromotionListAPI,
  addPromotionAPI,
  updatePromotionAPI,
  deletePromotionAPI,
  getPromotionDetailAPI
};
