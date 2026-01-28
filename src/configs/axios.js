import axios from "axios";
import { BASE_URL, USER_INFO_KEY } from "../constants/common";

let userInfor = localStorage.getItem(USER_INFO_KEY);
if (userInfor) {
  userInfor = JSON.parse(userInfor);
}
console.log("debugger", userInfor);

// 1. Khởi tạo instance
export const request = axios.create({
  headers: {
    Authorization: userInfor?.user_token,
  },
  baseURL: BASE_URL,
  withCredentials: true, // BẮT BUỘC để gửi/nhận Cookie chứa Refresh Token từ BE
});


// 2. Request Interceptor (Giữ nguyên logic của bạn)
request.interceptors.request.use((config) => {
  let userInfor = localStorage.getItem(USER_INFO_KEY);
  if (userInfor) {
    userInfor = JSON.parse(userInfor);
  }
  if (userInfor) {
    config.headers.Authorization = `Bearer ${userInfor.user_token}`;
  }
  return config;
});

// 3. Response Interceptor (Đã điều chỉnh để tự động Refresh)
request.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // 1. Kiểm tra chính xác mã lỗi 401 và message từ BE
    // Dùng .includes() vì BE của bạn có dấu chấm "jwt expired."
    const message = error.response?.data?.message?.toLowerCase() || "";
    const isTokenExpired =
      error.response?.status === 401 && message.includes("jwt expired");

    if (isTokenExpired && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // 2. Gọi API refresh (Dùng axios thuần để không bị dính Header cũ)
        const res = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        );

        // 3. Lấy token mới từ content (theo cấu trúc sendSuccess của BE)
        const newToken = res.data.content.accessToken;

        // 4. Cập nhật localStorage đúng cấu trúc userInfor của bạn
        let userInfor = JSON.parse(localStorage.getItem(USER_INFO_KEY));
        if (userInfor) {
          userInfor.user_token = newToken;
          localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfor));
        }

        // 5. Gắn token mới vào request bị lỗi và gửi lại
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return request(originalRequest);
      } catch (refreshError) {
        console.error("Lỗi khi refresh token:", refreshError);
        localStorage.removeItem(USER_INFO_KEY);
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);
