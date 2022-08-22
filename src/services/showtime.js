import { GROUP_ID } from "constants/common";
import { request } from "../configs/axios";

const HethongrapListApi = () => {

  return request({
    url: `/QuanLyRap/LayThongTinHeThongRap`,
    method: 'GET',
  })
};

const HethongrapCumrapListApi = (HethongRap) => {

  return request({
    url: `/QuanLyRap/LayThongTinCumRapTheoHeThong?maHeThongRap=${HethongRap}`,
    method: 'GET',
  })
};

const taoLichChieuApi = (data) => {
  return request({
    url: '/QuanLyDatVe/TaoLichChieu',
    method: 'POST',
    data,
  });
}

export { HethongrapListApi, HethongrapCumrapListApi, taoLichChieuApi }