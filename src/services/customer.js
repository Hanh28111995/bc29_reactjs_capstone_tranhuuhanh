import { request } from "../configs/axios";

const fetchShowtimesCusAPI = (role, id) => {
    
  return request({
    url: `/${role}/showtime/showtimeDetail/${id}`, 
    method: "GET",
  });
};

const fetchTicketBookingAPI = (role, data) => {  

  return request({
    url: `/${role}/ticket/booking`,
    method: "POST",
    data,
  });
};

export { fetchShowtimesCusAPI, fetchTicketBookingAPI };