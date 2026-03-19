import { request } from "../configs/axios";

const fetchShowtimesCusAPI = (role, id) => {
  return request({
    url: `/${role}/showtime/showtimeDetail/${id}`,
    method: "GET",
  });
};

const fetchTicketBookingAPI = (role, data) => {
  return request({
    url: `/${(role != "admin") ? role : "staff"}/ticket/booking`,
    method: "POST",
    data,
  });
};

const fetchCancelBookingAPI = (role, id, data) => {
  return request({
    url: `/${role}/ticket/cancel/${id}`,
    method: "PUT",
    data,
  });
};

export { fetchShowtimesCusAPI, fetchTicketBookingAPI, fetchCancelBookingAPI };
