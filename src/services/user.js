import { request } from "../configs/axios";

const loginAPI = (data) => {
  return request({
    data: data,
    url: `/auth/login`,
    method: "POST",
    withCredentials: true,
  });
};

const logoutAPI = () => {
  return request({    
    url: `/auth/logout`,
    method: "POST",
    withCredentials: true,
  });
};

const registerApi = (data) => {
  return request({
    data,
    url: "/auth/register",
    method: "POST",
  });
};

const fetchUserListAPI = (params) => {
  return request({
    url: `/admin/user/all`,
    method: "GET",
    params,
  });
};

const fetchUserDetailApi = (tk) => {
  return request({
    url: `admin/user/${tk}`,
    method: "GET",
  });
};

const fetchAddUserApi = (data) => {
  return request({
    url: "/admin/user/add",
    method: "POST",
    data,
  });
};

const fetchUpdateUserApi = (data) => {
  return request({
    url: "/admin/user/user-edit",
    method: "PUT",
    data,
  });
};
const fetchDeleteUserApi = (tk) => {
  return request({
    url: `admin/user/delete/${tk}`,
    method: "DELETE",
  });
};

const fetchSearchUserAPI = (params) => {
  return request({
    url: `/admin/user/search`,
    method: "GET",
    params,
  });
};

const refreshTokenAPI = () => {
  return request({
    url: "/auth/refresh",
    method: "POST",
    withCredentials: true,
  });
};

const loginGoogleAPI = (firebaseToken) => {
  return request({
    url: `/auth/google-login`, // Endpoint này tùy thuộc vào Backend của bạn
    method: "POST",
    data: { token: firebaseToken },
  });
};

export {
  loginAPI,
  logoutAPI,
  registerApi,
  refreshTokenAPI,  
  loginGoogleAPI,
  fetchAddUserApi,
  fetchDeleteUserApi,
  fetchUpdateUserApi,
  fetchUserDetailApi,
  fetchUserListAPI,
  fetchSearchUserAPI
};
