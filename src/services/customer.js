import { request } from "../configs/axios";

const fetchShowtimesCusAPI = (role, id) => {
  return request({
    url: `/${role}/showtime/showtimeDetail/${id}`,
    method: "GET",
  });
};


const searchCustomerAPI = (role, keyword) => {
  return request({
    url: `/admin/user/search`,
    method: "GET",
    params: { keyword },
  });
};

export {
  fetchShowtimesCusAPI,
  searchCustomerAPI,
};
