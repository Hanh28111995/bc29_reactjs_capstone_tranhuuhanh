import axios from "axios";
import { request } from "../configs/axios";
import {TOKEN_CYBERSOFT,BASE_URL} from '../constants/common';

const fetchMovieListAPI = () =>{
   return request({
        url: '/QuanLyPhim/LayDanhSachPhim?maNhom=GP01',
        method: 'GET',
    })
};
const fetchMovieDetailAPI = (movieId) =>{
    return request({
        url: `/QuanLyPhim/LayThongTinPhim?MaPhim=${movieId}`,
        method: 'GET',
    })
}

export {fetchMovieListAPI, fetchMovieDetailAPI};