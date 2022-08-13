import { request } from "../configs/axios";

export const fetchRoomListAPI = (showTimeId) => {
  return request({
    url: `/QuanLyDatVe/LayDanhSachPhongVe?MaLichChieu=${showTimeId}`,
    method: "GET",
  });
};

export const bookingTicketAPI = (data) => {
  return request({
    url: "/QuanLyDatVe/DatVe",
    method: "POST",
    data,
  });
};
