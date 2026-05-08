import axios from "axios";
import { BASE_URL, USER_INFO_KEY } from "../constants/common";

export const request = axios.create({
  proxy: false,    
  baseURL: BASE_URL,
  withCredentials: true,
});

request.interceptors.request.use((config) => {
  const userInfor = JSON.parse(localStorage.getItem(USER_INFO_KEY) || "null");
  if (userInfor?.user_token) {
    config.headers.Authorization = `Bearer ${userInfor.user_token}`;
  } else if (config.headers?.Authorization) {
    delete config.headers.Authorization;
  }
  // GET /general là public, không nên gửi Authorization (dễ kích hoạt preflight/CORS ở một số BE)
  if (config.method === "get" && config.url?.startsWith("/general/")) {
    config.withCredentials = false;
    delete config.headers.Authorization;
  }
  return config;
});

request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isUnauthorized = error.response?.status === 401;

    if (
      isUnauthorized &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {
      const userInfor = JSON.parse(localStorage.getItem(USER_INFO_KEY) || "null");
      const currentToken = userInfor?.user_token;
      if (!currentToken) {
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        const res = await axios.post(
          `${BASE_URL}/auth/refresh`,
          {},
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${currentToken}`,
            },
          }
        );

        const newToken =
          res.data?.content?.user_token || res.data?.content?.accessToken || res.data?.accessToken;

        if (!newToken) throw new Error("Refresh response missing token");

        if (userInfor) {
          userInfor.user_token = newToken;
          localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfor));
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return request(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem(USER_INFO_KEY);
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
