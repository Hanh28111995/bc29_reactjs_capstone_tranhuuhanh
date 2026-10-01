import { request } from "../configs/axios";

// ---------- Customer ----------
const fetchValidateCouponAPI = (code, subtotal) => {
  return request({
    url: `/customer/coupon/validate`,
    method: "POST",
    data: { code, subtotal },
  });
};

// ---------- Admin ----------
const fetchAllCouponsAPI = () => {
  return request({
    url: `/admin/coupon/all`,
    method: "GET",
  });
};

const fetchCreateCouponAPI = (data) => {
  return request({
    url: `/admin/coupon/create`,
    method: "POST",
    data,
  });
};

const fetchUpdateCouponAPI = (id, data) => {
  return request({
    url: `/admin/coupon/${id}`,
    method: "PUT",
    data,
  });
};

const fetchReactivateCouponAPI = (id) => {
  return request({
    url: `/admin/coupon/${id}/reactivate`,
    method: "POST",
  });
};

const fetchDeleteCouponAPI = (id) => {
  return request({
    url: `/admin/coupon/${id}`,
    method: "DELETE",
  });
};

export {
  fetchValidateCouponAPI,
  fetchAllCouponsAPI,
  fetchCreateCouponAPI,
  fetchUpdateCouponAPI,
  fetchReactivateCouponAPI,
  fetchDeleteCouponAPI,
};
