import { request } from "../configs/axios";

const getBannerListAPI = () => {
  return request({
    url: `/general/showBanners`,
    method: "GET",    
  });
};

const getBannerDetailAPI = (id) =>{
  return request({
    url: `/admin/banner/${id}`,
    method: "GET",    
  })
}

const addBannerAPI = (data) => {
  return request({
    url: "/admin/banner/add",
    method: "POST",
    data,
  });
};


const updateBannerAPI = ( Id, data) => {
  return request({
    url: `/admin/banner/update/${Id}`,
    method: "PUT",
    data,
  });
};
const deleteBannerAPI = (Id) => {
  return request({
    url: `/admin/banner/delete/${Id}`,
    method: "DELETE",
  });
};


export {
  getBannerListAPI,
  getBannerDetailAPI,
  addBannerAPI,
  updateBannerAPI,
  deleteBannerAPI,  
};
