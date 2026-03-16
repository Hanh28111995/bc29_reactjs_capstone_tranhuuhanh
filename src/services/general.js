import { request } from "../configs/axios";

const normalizeCinemaBranch = (item) => {
  if (!item || typeof item !== "object") return item;
  const branch = item.branch || item.cinemaName || item.cinema;
  return branch ? { ...item, branch } : item;
};

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
    url: `/general/showtime/filter`,
    method: "GET",
    params: {
      branch: filters?.branch,
      date: filters?.date,
      idMovie: filters?.idMovie,
      location: filters?.location,
    },
  });
};

const fetchBranchesAPI = (filters) => {
  return request({
    url: `/general/cinemaBranches`,
    method: "GET",
    params: filters,
  }).then((res) => {
    const content = res?.data?.content;
    if (Array.isArray(content)) {
      res.data.content = content.map(normalizeCinemaBranch);
    }
    const data = res?.data?.data;
    if (Array.isArray(data)) {
      res.data.data = data.map(normalizeCinemaBranch);
    }
    return res;
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
