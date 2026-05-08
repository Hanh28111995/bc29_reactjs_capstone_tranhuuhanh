import { request } from "../configs/axios";

const fetchShowtimesCusAPI = (role, id) => {
  return request({
    url: `/${role}/showtime/showtimeDetail/${id}`,
    method: "GET",
  });
};

const fetchTicketBookingAPI = (role, data) => {
  if (role == "admin") role = "staff";
  return request({
    url: `/${role}/ticket/bookingTicket`,
    method: "POST",
    data,
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
  fetchTicketBookingAPI,  
  searchCustomerAPI,
};
