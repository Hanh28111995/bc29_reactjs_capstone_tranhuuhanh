import { request } from "../configs/axios";

const fetchMovieListAPI = (params) => {
  return request({
    url: `/admin/movie/allMovies`,
    method: "GET",
    params,
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
  addMovieUploadImage,
  updateMovieUploadImage,
  deleteMovieAPI,
};
