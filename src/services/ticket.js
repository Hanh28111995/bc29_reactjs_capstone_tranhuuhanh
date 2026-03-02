import axios from "axios";
import { request } from "../configs/axios";

const fetchCheckPayment = (id) => {
  return request({
    url: `/admin/payment/check-status/${id}`,
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

export {
  fetchCheckPayment,
  fetchCreateMomoPayment
};
