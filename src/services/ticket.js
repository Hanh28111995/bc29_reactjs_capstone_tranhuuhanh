import axios from "axios";
import { request } from "../configs/axios";

const fetchCheckPayment = (id) => {
  return request({
    url: `/payment/check-status/${id}`,
    method: "GET",
  });
};

const fetchCreateMomoPayment = (data) => {
  return request({
    url: `/payment/create_momo`,
    method: "POST",
    data: data,
  });
};

const fetchCreateVnpayPayment = (data) => {
  return request({
    url: `/payment/create_vnpay`,
    method: "POST",
    data: data,
  });
};

const fetchCreateCashPayment = (data) => {
  return request({
    url: `/payment/cash`,
    method: "POST",
    data: data,
  });
};

export {
  fetchCheckPayment,
  fetchCreateMomoPayment,
  fetchCreateCashPayment,
  fetchCreateVnpayPayment,
};
