import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchTicketByIdAPI, updateTicketAPI } from "services/ticket";

const fetchTicketDetail = async (ticketId) => {
  const response = await fetchTicketByIdAPI(ticketId);
  return response?.data?.content ?? response?.data ?? null;
};

export const useTicketDetail = (ticketId) => {
  return useQuery(
    ["ticket", ticketId],
    () => fetchTicketDetail(ticketId),
    {
      enabled: Boolean(ticketId),
      staleTime: 1000 * 60 * 2,
      cacheTime: 1000 * 60 * 10,
      refetchOnWindowFocus: false,
      retry: false,
    }
  );
};

export const useUpdateTicket = () => {
  const queryClient = useQueryClient();
  return useMutation(
    async ({ ticketId, values }) => {
      const response = await updateTicketAPI(ticketId, values);
      return response?.data ?? response;
    },
    {
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries(["ticket", variables.ticketId]);
      },
    }
  );
};
