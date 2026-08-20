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

const updatePromotionAPI = ( Id, data) => {
  return request({
    url: `/admin/promotion/update/${Id}`,
    method: "PUT",
    data,
  });
};
const deletePromotionAPI = (Id) => {
  return request({
    url: `/admin/promotion/delete/${Id}`,
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
