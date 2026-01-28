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

const fetchShowtimesAPI = (filters) => {
  return request({
    url: `/general/showtimes`,
    method: "GET",
    params: filters,
  });
};

const fetchBranchesAPI = (filters) => {
  return request({
    url: `/general/cinemaBranches`,
    method: "GET",
    params: filters,
  });
};

export {
  fetchMoviebannerAPI,
  fetchMovieListAPI,
  fetchMovieDetailAPI,
  fetchLocationListAPI,
  fetchShowtimesAPI,
  fetchBranchesAPI,
};
