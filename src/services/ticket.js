import axios from "axios";
import { request } from "../configs/axios";

const fetchCheckPayment = () => {
  return request({
    url: `/admin/payment/check-status/${id}`,
    method: "GET",
  });
};
export {
  fetchCheckPayment
};
