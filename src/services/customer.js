import { request } from "../configs/axios";

const fetchShowtimesCusAPI = (role, id) => {
    
  return request({
    url: `/${userRole}/showtime/showtimeDetail/${id}`, 
    method: "GET",
  });
};

const fetchTicketBookingAPI = (role, data) => {  

  return request({
    url: `/${userRole}/ticket/booking`,
    method: "POST",
    data,
  });
};

export { fetchShowtimesCusAPI, fetchTicketBookingAPI };