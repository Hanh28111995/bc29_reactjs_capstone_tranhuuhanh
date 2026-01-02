import {TOKEN_CYBERSOFT,BASE_URL} from '../constants/common';
import { request } from "../configs/axios";

const loginAPI = (data) => {
  return request({
    data: data,
    url: `/auth/login`,
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

const userListApi = ()=> {

  return request({
    url: `/QuanLyNguoiDung/LayDanhSachNguoiDung`,
    method: 'GET',
})
};

const userDetailApi = (tk) =>{
  return request({
      url: `/QuanLyNguoiDung/LayThongTinNguoiDung?taiKhoan=${tk}`,
      method: 'POST',
      data: tk,
  })
};

const addUserApi = (data) => {
  return request({
    url: '/QuanLyNguoiDung/ThemNguoiDung',
    method: 'POST',
    data,
  });
};

const updateUserApi = (data) => {
  return request({
    url: '/QuanLyNguoiDung/CapNhatThongTinNguoiDung',
    method: 'POST',
    data,
  });
}
  const deleteUserApi = (tk) => {
    return request({
      url: `/QuanLyNguoiDung/XoaNguoiDung?TaiKhoan=${tk}`,
      method: 'DELETE',
    });
  }

export { loginAPI, registerApi , userListApi, userDetailApi, addUserApi, updateUserApi, deleteUserApi};
