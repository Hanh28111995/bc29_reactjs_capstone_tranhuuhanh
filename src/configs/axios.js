import axios from "axios";
import { BASE_URL, USER_INFO_KEY } from "../constants/common";

// 1. Khởi tạo instance - KHÔNG set Authorization ở đây
export const request = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// 2. Request Interceptor - luôn lấy token mới nhất từ localStorage
request.interceptors.request.use((config) => {
  const userInfor = JSON.parse(localStorage.getItem(USER_INFO_KEY) || "null");
  if (userInfor?.user_token) {
    config.headers.Authorization = `Bearer ${userInfor.user_token}`;
  }
  return config;
});

// 3. Response Interceptor
request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const message = error.response?.data?.message?.toLowerCase() || "";
    const isTokenExpired =
      error.response?.status === 401 && message.includes("jwt expired");

    if (isTokenExpired && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Dùng axios thuần, KHÔNG dùng request instance để tránh loop
        const res = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const newToken = res.data.content.accessToken;

        // Cập nhật localStorage
        const userInfor = JSON.parse(localStorage.getItem(USER_INFO_KEY) || "null");
        if (userInfor) {
          userInfor.user_token = newToken;
          localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfor));
        }

        // Retry request gốc - request interceptor sẽ tự gắn token mới
        return request(originalRequest);
      } catch (refreshError) {
        console.error("Refresh failed:", refreshError.response?.status, refreshError.response?.data);
        localStorage.removeItem(USER_INFO_KEY);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
