import axios from "axios";
import { BASE_URL, USER_INFO_KEY } from "../constants/common";

export const request = axios.create({
  baseURL: BASE_URL,
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

// Request Interceptor: Chỉ gắn token cho các request cần bảo mật (thường là /admin hoặc /customer)
request.interceptors.request.use((config) => {
  const userInfor = JSON.parse(localStorage.getItem(USER_INFO_KEY) || "null");
  
  // Chỉ gắn Authorization nếu URL không bắt đầu bằng /general (các API công khai)
  if (userInfor?.user_token && !config.url?.startsWith("/general")) {
    config.headers.Authorization = `Bearer ${userInfor.user_token}`;
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