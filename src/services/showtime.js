import { request } from "../configs/axios";

const HethongrapListApi = () => {
  return request({
    url: `/QuanLyRap/LayThongTinHeThongRap`,
    method: "GET",
  });
};

const HethongrapCumrapListApi = (HethongRap) => {
  return request({
    url: `/QuanLyRap/LayThongTinCumRapTheoHeThong?maHeThongRap=${HethongRap}`,
    method: "GET",
  });
};

const taoLichChieuApi = (data) => {
  return request({
    url: "/QuanLyDatVe/TaoLichChieu",
    method: "POST",
    data,
  });
};

/////////////////////////////////////////////////////////new /////////////////////////////////////////////////

const getAllShowTimes = () => {
  return request({
    url: '/admin/showtime/all',
    method: "GET",
  });
};

const getShowTimeDetail = (id) => {
  return request({
    url: `/admin/showtime/${id}`,
    method: "GET",
  });
};

const addNewShowTime = (data) => {
  return request({
    url: `/admin/showtime/add`,
    method: "POST",
    data,
  });
};

const updateShowTime = (data) => {
  return request({
    url: `/admin/showtime/update`,
    method: "PUT",
    data,
  });
};

const deleteOneShowTime = (id) => {
  return request({
    url: `/admin/showtime/delete/${id}`,
    method: "DELETE",
  });
};

export {
  HethongrapListApi,
  HethongrapCumrapListApi,
  taoLichChieuApi,
  getAllShowTimes,
  getShowTimeDetail,
  addNewShowTime,
  updateShowTime,
  deleteOneShowTime,
};
