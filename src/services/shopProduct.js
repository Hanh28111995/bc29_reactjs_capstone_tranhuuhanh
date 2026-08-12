import { request } from "../configs/axios";

const getShopProductListAPI = () => {
  return request({
    url: `/admin/shop/all`,
    method: "GET",    
  });
};

const getShopProductDetailAPI = (id) => {
  return request({
    url: `/admin/shop/${id}`,
    method: "GET",    
  });
};

const addShopProductAPI = (data) => {
  return request({
    url: "/admin/shop/add",
    method: "POST",
    data,
  });
};

const updateShopProductAPI = (data) => {
  return request({
    url: "/admin/shop/update",
    method: "PUT",
    data,
  });
};
const deleteShopProductAPI = (movieId) => {
  return request({
    url: `/admin/shop/delete/${movieId}`,
    method: "DELETE",
  });
};


export {
  getShopProductListAPI,
  addShopProductAPI,
  updateShopProductAPI,
  deleteShopProductAPI,
  getShopProductDetailAPI
};
