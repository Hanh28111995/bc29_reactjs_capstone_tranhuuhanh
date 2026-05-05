import axios from "axios";
import { BASE_URL, USER_INFO_KEY } from "../constants/common";

export const request = axios.create({
  baseURL: BASE_URL,
});

// --- API Cache ---
// Các URL prefix được cache (GET only)
const CACHEABLE_URLS = [
  "/general/movie/all",
  "/general/showBanners",
  "/general/locations",
  "/general/cinemaBranches",
  "/general/movie/",
];

const apiCache = new Map();
const CACHE_TTL = 5 * 60 * 1000;

const isCacheable = (config) => 
  config.method === "get" && CACHEABLE_URLS.some(url => config.url?.includes(url));

const getCacheKey = (config) => `${config.url}${config.params ? JSON.stringify(config.params) : ""}`;

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

// Request Interceptor
request.interceptors.request.use((config) => {
  const userInfor = JSON.parse(localStorage.getItem(USER_INFO_KEY) || "null");
  
  // 1. Đối với API public (/general), không gửi bất kỳ header bảo mật nào để tránh Preflight/403
  if (config.url?.includes("/general/")) {
    delete config.headers.Authorization;
    delete config.headers["Content-Type"];
    return config;
  }

  // 2. Đối với API cần bảo mật, chỉ gửi token
  if (userInfor?.user_token) {
    config.headers.Authorization = `Bearer ${userInfor.user_token}`;
  }

  // Trả về cache nếu còn hạn
  if (!config.bypassCache && isCacheable(config)) {
    const key = getCacheKey(config);
    const cached = apiCache.get(key);
    if (cached && cached.expiry > Date.now()) {
      config.adapter = () => Promise.resolve(cached.data);
    }
  }

  return config;
});

// Xóa cache thủ công khi cần
export const clearApiCache = (urlPrefix) => {
  if (!urlPrefix) {
    apiCache.clear();
    return;
  }
  for (const key of apiCache.keys()) {
    if (key.startsWith(urlPrefix)) apiCache.delete(key);
  }
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
    const isTokenExpired = error.response?.status === 401;

    if (isTokenExpired && !originalRequest.url?.includes("/auth/refresh")) {
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
            data: {},
            headers: {
              'Content-Type': 'application/json',
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
            throw new Error("No token");
          }
        } catch (refreshError) {
          console.error("[Axios] Refresh failed:", refreshError);
          isRefreshing = false;
          onRefreshFailed(refreshError);
          
          if (!originalRequest.url?.includes("/notifications")) {
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
