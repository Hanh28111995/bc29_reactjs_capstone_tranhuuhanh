import axios from "axios";
import { BASE_URL, USER_INFO_KEY } from "../constants/common";
import { refreshTokenAPI } from "services/user";

// 1. Khởi tạo instance - KHÔNG set Authorization ở đây
export const request = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// 2. Request Interceptor - luôn lấy token mới nhất từ localStorage
request.interceptors.request.use((config) => {
  const userInfor = JSON.parse(localStorage.getItem(USER_INFO_KEY));
  if (userInfor?.user_token) {
    config.headers.Authorization = `Bearer ${userInfor.user_token}`;
  }
  return config;
});

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => {
  refreshSubscribers.push(cb);
};

const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Nới lỏng kiểm tra message để tránh sót trường hợp
    const isTokenExpired = error.response?.status === 401;

    if (isTokenExpired && !originalRequest._retry) {
      if (isRefreshing) {
        // Nếu đang có một request refresh khác đang chạy, cho request này vào hàng đợi
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(request(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const res = await refreshTokenAPI();
        // Kiểm tra kỹ cấu trúc res.data của bạn ở đây
        const newToken =
          res.data?.content?.accessToken || res.data?.accessToken;

        if (newToken) {
          const userInfor = JSON.parse(
            localStorage.getItem(USER_INFO_KEY) || "null",
          );
          if (userInfor) {
            userInfor.user_token = newToken;
            localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfor));
          }

          onRefreshed(newToken); // Thông báo cho các request đang đợi
          isRefreshing = false;

          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return request(originalRequest);
        }
      } catch (refreshError) {
        isRefreshing = false;
        localStorage.removeItem(USER_INFO_KEY);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
