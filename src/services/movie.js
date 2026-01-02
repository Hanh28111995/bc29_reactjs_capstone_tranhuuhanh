import axios from "axios";
import { request } from "../configs/axios";
import {TOKEN_CYBERSOFT,BASE_URL} from '../constants/common';


const fetchMoviebannerAPI = () => {
    return request({
        url: `/general/showBanners`,
        method: 'GET',
    })
}

const fetchMovieListAPI = () =>{
   return request({
        url: `/QuanLyPhim/LayDanhSachPhim`,
        method: 'GET',
    })
};
const fetchMovieDetailAPI = (movieId) =>{
    return request({
        url: `/QuanLyPhim/LayThongTinPhim?MaPhim=${movieId}`,
        method: 'GET',
    })
}

const addMovieUploadImage = (data) => {
    return request({
      url: '/QuanLyPhim/ThemPhimUploadHinh',
      method: 'POST',
      data,
    });
  };
  
  const updateMovieUploadImage = (data) => {
    return request({
      url: '/QuanLyPhim/CapNhatPhimUpload',
      method: 'POST',
      data,
    });
  }
  const deleteMovieAPI = (movieId) => {
    return request({
      url: `/QuanLyPhim/XP?MaPhim=${movieId}`,
      method: 'DELETE',
    });
  }

  const bannerMovieApi = () => {
    return request({
      url: '/QuanLyPhim/LayDanhSachBanner',
      method: 'GET',
  })
  }

export {fetchMovieListAPI, fetchMovieDetailAPI, addMovieUploadImage, updateMovieUploadImage, deleteMovieAPI, bannerMovieApi, fetchMoviebannerAPI };