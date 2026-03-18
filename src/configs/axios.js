import axios from "axios";
import { BASE_URL, USER_INFO_KEY } from "../constants/common";

export const request = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Request Interceptor: Luôn gắn token mới nhất từ LocalStorage
request.interceptors.request.use((config) => {
  const userInfor = JSON.parse(localStorage.getItem(USER_INFO_KEY) || "null");
  if (userInfor?.user_token) {
    config.headers.Authorization = `Bearer ${userInfor.user_token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers = [];

const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Kiểm tra mã 401 (Unauthorized)
    const isTokenExpired = error.response?.status === 401;

    if (isTokenExpired && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang có request refresh khác chạy, xếp hàng đợi
        return new Promise((resolve) => {
          refreshSubscribers.push((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(request(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Gọi API Refresh - KHÔNG dùng instance 'request' để tránh loop
        // withCredentials: true cực kỳ quan trọng để gửi Cookie chứa refreshToken
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, { 
          withCredentials: true 
        });

        // Lấy token mới (Kiểm tra lại cấu trúc trả về của BE)
        const newToken = res.data?.content?.accessToken || res.data?.accessToken;

        if (newToken) {
          const userInfor = JSON.parse(localStorage.getItem(USER_INFO_KEY) || "null");
          if (userInfor) {
            userInfor.user_token = newToken;
            localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfor));
          }

          isRefreshing = false;
          onRefreshed(newToken); // Giải phóng hàng đợi

          // Thực hiện lại request bị lỗi ban đầu với token mới
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return request(originalRequest);
        }
      } catch (refreshError) {
        isRefreshing = false;
        // Nếu refresh cũng lỗi (hết hạn 7 ngày), xóa sạch và logout
        localStorage.removeItem(USER_INFO_KEY);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);