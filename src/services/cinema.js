import { request } from "../configs/axios"

const fetchMovieShowTimesAPI = (movieId) => {
    return request({
        url:`/QuanLyRap/LayThongTinLichChieuPhim?MaPhim=${movieId}`,
        method: 'GET',
    })
};
export { fetchMovieShowTimesAPI};