import { useQuery } from "@tanstack/react-query";
import { fetchMovieListAPI, fetchMovieDetailAPI } from "services/general";

export const useMovieList = (params = {}) => {
  return useQuery(
    ["movies", params],
    async () => {
      const response = await fetchMovieListAPI(params);
      return response?.data?.content ?? [];
    },
    {
      staleTime: 1000 * 60 * 2,
      cacheTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: false,
      keepPreviousData: true,
    }
  );
};

export const useMovieDetail = (movieId, enabled = Boolean(movieId)) => {
  return useQuery(
    ["movie", movieId],
    async () => {
      const response = await fetchMovieDetailAPI(movieId);
      return response?.data?.content ?? null;
    },
    {
      enabled,
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );
};
