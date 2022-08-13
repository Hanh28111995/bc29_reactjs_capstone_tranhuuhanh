import { request } from "../configs/axios";

const loginAPI = (data) => {
  return request({
    data: data,
    url: `/QuanLyNguoiDung/DangNhap`,
    method: "POST",
  });
};
export { loginAPI };
