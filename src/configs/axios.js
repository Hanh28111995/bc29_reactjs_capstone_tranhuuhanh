import axios from "axios";
import { BASE_URL, USER_INFO_KEY } from "../constants/common";

export const request = axios.create({
  baseURL: BASE_URL,
  // Không bật withCredentials toàn cục để tránh lỗi CORS trên Simple Requests
});

// --- API Cache ---
// Các URL prefix được cache (GET only, không cần real-time)
const CACHEABLE_URLS = [
  "/general/movie/all",
  "/general/showBanners",
  "/general/locations",
  "/general/cinemaBranches",
  "/general/movie/",
];

const apiCache = new Map(); // key: url+params -> { data, expiry }
const CACHE_TTL = 5 * 60 * 1000; // 5 phút

const getCacheKey = (config) => {
  const params = config.params ? JSON.stringify(config.params) : "";
  return `${config.url}__${params}`;
};

const isCacheable = (config) =>
  config.method === "get" &&
  CACHEABLE_URLS.some((prefix) => config.url?.startsWith(prefix));

// Request Interceptor
request.interceptors.request.use((config) => {
  const userInfor = JSON.parse(localStorage.getItem(USER_INFO_KEY) || "null");
  
  // 1. Tối ưu cho Simple Request (GET public) để tránh hoàn toàn OPTIONS
  if (config.method === 'get' && config.url?.includes("/general/")) {
    delete config.headers.Authorization;
    delete config.headers["Content-Type"];
    config.headers["Accept"] = "application/json"; 
    return config;
  }

  // 2. Chỉ gắn token cho các request cần bảo mật
  if (userInfor?.user_token && !config.url?.includes("/general/")) {
    config.headers.Authorization = `Bearer ${userInfor.user_token}`;
  }

  // 3. Đảm bảo Content-Type chuẩn cho POST/PUT để tránh một số lỗi server
  if (config.method !== 'get' && !config.headers["Content-Type"]) {
    config.headers["Content-Type"] = "application/json";
  }

  // Trả về cache nếu còn hạn
  if (isCacheable(config)) {
    const key = getCacheKey(config);
    const cached = apiCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      // Dùng adapter để trả về cached response ngay lập tức
      config.adapter = () => Promise.resolve(cached.data);
    }
  }

  return config;
});

// Xóa cache thủ công khi cần (gọi sau khi mutate data)
export const clearApiCache = (urlPrefix) => {
  if (!urlPrefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.startsWith(urlPrefix)) apiCache.delete(key);
  }
};
let refreshSubscribers = [];
let isRefreshing = false;

const onRefreshed = (token) => {
  refreshSubscribers.map((cb) => cb(token));
  refreshSubscribers = [];
};

request.interceptors.response.use(
  (response) => {
    // Lưu vào cache nếu là GET cacheable
    const config = response.config;
    if (isCacheable(config)) {
      const key = getCacheKey(config);
      apiCache.set(key, { data: response, expiry: Date.now() + CACHE_TTL });
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    // Kiểm tra mã 401 (Unauthorized)
    const isTokenExpired = error.response?.status === 401;

    // Nếu lỗi 401 và không phải là request refresh chính nó
    if (isTokenExpired && !originalRequest.url?.includes("/auth/refresh")) {
      if (!originalRequest._retry) {
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
          console.log("[Axios] Token expired, attempting refresh...");
          const res = await axios.post(`${BASE_URL}/auth/refresh`, {}, { 
            withCredentials: true 
          });

          // Lấy token mới - Thử nhiều cấu trúc trả về khác nhau
          const newToken = res.data?.content?.user_token || res.data?.content?.accessToken || res.data?.accessToken;

          if (newToken) {
            console.log("[Axios] Refresh token success!");
            const userInfor = JSON.parse(localStorage.getItem(USER_INFO_KEY) || "null");
            if (userInfor) {
              userInfor.user_token = newToken;
              localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfor));
            }

            isRefreshing = false;
            onRefreshed(newToken); 

            // Thực hiện lại request bị lỗi ban đầu
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return request(originalRequest);
          } else {
            throw new Error("No token found in refresh response");
          }
        } catch (refreshError) {
          console.error("[Axios] Refresh token failed:", refreshError);
          isRefreshing = true; // Giữ true để các request khác không retry nữa
          refreshSubscribers = []; // Clear queue
          
          localStorage.removeItem(USER_INFO_KEY);
          if (window.location.pathname !== "/login") {
            window.location.href = "/login";
          }
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);