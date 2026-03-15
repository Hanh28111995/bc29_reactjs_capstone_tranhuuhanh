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
  });
};

const registerApi = (data) => {
  return request({
    data,
    url: "/auth/register",
    method: "POST",
  });
};

const userListApi = () => {
  return request({
    url: `/admin/user/all`,
    method: "GET",
  });
};

const userDetailApi = (tk) => {
  return request({
    url: `admin/user/${tk}`,
    method: "GET",
  });
};

const addUserApi = (data) => {
  return request({
    url: "/admin/user/add",
    method: "POST",
    data,
  });
};

const updateUserApi = (data) => {
  return request({
    url: "/admin/user/user-edit",
    method: "PUT",
    data,
  });
};
const deleteUserApi = (tk) => {
  return request({
    url: `admin/user/delete/${tk}`,
    method: "DELETE",
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
  userListApi,
  userDetailApi,
  addUserApi,
  updateUserApi,
  deleteUserApi,
  loginGoogleAPI,
};
