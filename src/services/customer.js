import { request } from "../configs/axios";

const fetchShowtimesCusAPI = (role, id) => {
  return request({
    url: `/${role}/showtime/showtimeDetail/${id}`,
    method: "GET",
  });
};

const fetchTicketBookingAPI = (role, data) => {
  return request({
    url: `/${role}/bookingTicket`,
    method: "POST",
    data,
  });
};

const fetchCancelBookingAPI = (role, id, data) => {
  return request({
    url: `/${role}/cancelTicket`,
    method: "PUT",
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

export { fetchShowtimesCusAPI, fetchTicketBookingAPI, fetchCancelBookingAPI, searchCustomerAPI };
