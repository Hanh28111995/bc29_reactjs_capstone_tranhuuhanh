import { request } from "../configs/axios";

const fetchShowtimesCusAPI = (id) => {
  return request({
    url: `/customer/ticket/showtimeDetail/${id}`, // ID nằm trên URL
    method: "GET",
  });
};

const fetchTicketBookingAPI = (data) => {
  return request({
    url: "/customer/ticket/booking",
    method: "POST",
    data,
  });
};

export { fetchShowtimesCusAPI, fetchTicketBookingAPI };
