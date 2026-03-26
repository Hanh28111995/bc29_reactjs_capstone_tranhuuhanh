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

const fetchAllTicketsAPI = (params) => {
  return request({
    url: `/admin/ticket/all`,
    method: "GET",
    params,
  });
};

const fetchTicketByIdAPI = (id) => {
  return request({
    url: `/admin/ticket/${id}`,
    method: "GET",
  });
};

const deleteTicketAPI = (id) => {
  return request({
    url: `/admin/ticket/delete/${id}`,
    method: "DELETE",
  });
};

const updateTicketAPI = (id, data) => {
  return request({
    url: `/admin/ticket/update/${id}`,
    method: "PUT",
    data,
  });
};


export {
  fetchCheckPayment,
  fetchCreateMomoPayment,
  fetchCreateCashPayment,
  fetchCreateVnpayPayment,
  fetchAllTicketsAPI,
  fetchTicketByIdAPI,
  deleteTicketAPI,
  updateTicketAPI,
};
