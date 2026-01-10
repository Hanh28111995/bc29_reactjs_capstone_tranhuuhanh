import { request } from "../configs/axios";



const fetchMovieListAPI = () => {
  return request({
    url: `/admin/movie/allMovies`,
    method: "GET",
  });
};
const fetchMovieDetailAPI = (movieId) => {
  return request({
    url: `/admin/movie/${movieId}`,
    method: "GET",
  });
};

const addMovieUploadImage = (data) => {
  return request({
    url: "/admin/movie/add",
    method: "POST",
    data,
  });
};

const updateMovieUploadImage = (data) => {
  return request({
    url: "/admin/movie/update",
    method: "PUT",
    data,
  });
};
const deleteMovieAPI = (movieId) => {
  return request({
    url: `/admin/movie/delete/${movieId}`,
    method: "DELETE",
  });
};


export {
  fetchMovieListAPI,
  fetchMovieDetailAPI,
  addMovieUploadImage,
  updateMovieUploadImage,
  deleteMovieAPI,
};
