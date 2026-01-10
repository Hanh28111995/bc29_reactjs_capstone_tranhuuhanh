import { request } from "../configs/axios";

const fetchMoviebannerAPI = () => {
  return request({
    url: `/general/showBanners`,
    method: "GET",
  });
};

const fetchMovieListAPI = () => {
  return request({
    url: `/general/movie/all`,
    method: "GET",
  });
};

const fetchLocationListAPI = () => {
  return request({
    url: `/general/locations`,
    method: "GET",
  });
};

const fetchMovieDetailAPI = (id) => {
  return request({
    url: `/general/movie/${id}`,
    method: "GET",
  });
};

export {
  fetchMoviebannerAPI,
  fetchMovieListAPI,
  fetchMovieDetailAPI,
  fetchLocationListAPI,
};
