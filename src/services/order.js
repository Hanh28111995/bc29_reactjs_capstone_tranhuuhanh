import { request } from "../configs/axios";

const fetchCreateOrderAPI = (data) => {
  return request({ url: `/customer/order/create`, method: "POST", data });
};

const fetchMyOrdersAPI = () => {
  return request({ url: `/customer/order/my`, method: "GET" });
};

export { fetchCreateOrderAPI, fetchMyOrdersAPI };
