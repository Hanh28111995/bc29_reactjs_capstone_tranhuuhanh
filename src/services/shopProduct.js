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

const updateShopProductAPI = (id, data) => {
  return request({
    url: `/admin/shop/update/${id}`,
    method: "PUT",
    data,
  });
};
const deleteShopProductAPI = (Id) => {
  return request({
    url: `/admin/shop/delete/${Id}`,
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
