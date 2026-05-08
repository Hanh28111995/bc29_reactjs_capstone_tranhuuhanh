import axios from "axios";
import { BASE_URL, USER_INFO_KEY } from "../constants/common";

export const request = axios.create({
  proxy: false,    
  baseURL: BASE_URL,
  withCredentials: true, // Đồng bộ true với server của bạn
});

// Interceptor cho Request: Đính kèm Access Token
request.interceptors.request.use((config) => {
  const userInfor = JSON.parse(localStorage.getItem(USER_INFO_KEY) || "null");
  if (userInfor?.user_token) {
    config.headers.Authorization = `Bearer ${userInfor.user_token}`;
  }
  return config;
});

// Interceptor cho Response: Xử lý REFRESH TOKEN khi gặp lỗi 401
request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Nếu lỗi 401 và đây không phải là request đang cố refresh
    if (error.response?.status === 401 && !originalRequest?._retry && !originalRequest?.url?.includes("/auth/refresh")) {
      originalRequest._retry = true; // Đánh dấu đã thử lại, tránh lặp vô tận

      const userInfor = JSON.parse(localStorage.getItem(USER_INFO_KEY) || "null");
      const currentToken = userInfor?.user_token;

      if (!currentToken) return Promise.reject(error);

      try {
        // --- ĐÂY LÀ LOGIC REFRESH TOKEN CỦA BẠN ---
        const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, {
          withCredentials: true, 
          headers: { Authorization: `Bearer ${currentToken}` }
        });

        // Lấy token mới từ response của server
        const newToken = res.data?.content?.user_token || res.data?.content?.accessToken;
        
        if (newToken) {
          // Cập nhật lại vào LocalStorage
          userInfor.user_token = newToken;
          localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfor));
          
          // Gán token mới vào request cũ và thực hiện lại
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return request(originalRequest);
        }
      } catch (refreshError) {
        // --- NẾU REFRESH CŨNG THẤT BẠI ---
        // Xóa sạch để bảo vệ Firewall, tránh việc các API khác liên tục gọi và lỗi 401
        localStorage.removeItem(USER_INFO_KEY);
        if (!window.location.pathname.includes('/login')) {
           window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);