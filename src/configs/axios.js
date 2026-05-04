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
  refreshSubscribers.forEach((cb) => cb.resolve(token));
  refreshSubscribers = [];
};

const onRefreshFailed = (error) => {
  refreshSubscribers.forEach((cb) => cb.reject(error));
  refreshSubscribers = [];
};

request.interceptors.response.use(
  (response) => {
    // ... (giữ nguyên logic cache)
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isTokenExpired = error.response?.status === 401;

    if (isTokenExpired && !originalRequest.url?.includes("/auth/refresh")) {
      const isNotificationRequest = originalRequest.url?.includes("/notifications");

      if (!originalRequest._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            refreshSubscribers.push({ resolve, reject });
          }).then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return request(originalRequest);
          }).catch(err => Promise.reject(err));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const userInfor = JSON.parse(localStorage.getItem(USER_INFO_KEY) || "null");
          const currentToken = userInfor?.user_token;

          console.log("[Axios] Token expired, attempting refresh...");
          const res = await axios({
            method: 'post',
            url: `${BASE_URL}/auth/refresh`,
            withCredentials: true,
            headers: {
              'Content-Type': 'application/json',
              // Thử gửi kèm token cũ nếu server yêu cầu để định danh
              'Authorization': currentToken ? `Bearer ${currentToken}` : undefined
            }
          });

          const newToken = res.data?.content?.user_token || res.data?.content?.accessToken || res.data?.accessToken;

          if (newToken) {
            console.log("[Axios] Refresh token success!");
            if (userInfor) {
              userInfor.user_token = newToken;
              localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfor));
            }

            isRefreshing = false;
            onRefreshed(newToken); 

            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return request(originalRequest);
          } else {
            throw new Error("No token in response");
          }
        } catch (refreshError) {
          console.error("[Axios] Refresh token failed triệt để:", refreshError);
          isRefreshing = false;
          onRefreshFailed(refreshError);
          
          if (!isNotificationRequest) {
            localStorage.removeItem(USER_INFO_KEY);
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }
          return Promise.reject(refreshError);
        }
      }
    }
    return Promise.reject(error);
  }
);
  }
);