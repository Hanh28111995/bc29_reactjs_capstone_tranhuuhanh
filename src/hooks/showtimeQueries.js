import { useQuery } from "@tanstack/react-query";
import { fetchShowtimesCusAPI } from "services/customer";

export const useShowtimeDetail = (role, showtimeId) => {
  return useQuery(
    ["showtimeDetail", role, showtimeId],
    async () => {
      const response = await fetchShowtimesCusAPI(role, showtimeId);
      return response?.data?.content ?? response?.data ?? null;
    },
    {
      enabled: Boolean(role && showtimeId),
      staleTime: 1000 * 60 * 2,
      cacheTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );
};
