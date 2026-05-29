import { useContext, useEffect, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { LoadingContext } from "../contexts/loading.context";

const normalizeResult = (result) => {
  const content = result?.data?.content;

  if (Array.isArray(content)) {
    return content;
  }

  if (content && typeof content === "object") {
    const arr = Object.values(content).find((v) => Array.isArray(v));
    return arr !== undefined ? arr : content;
  }

  return content;
};

const normalizeQueryKey = (service, dependencies = []) => {
  if (typeof service === "string") {
    return [service, ...dependencies];
  }
  if (service?.name) {
    return [service.name, ...dependencies];
  }
  return ["useAsync", ...dependencies];
};

const ensureArray = (value) => {
  if (value == null) return [];
  return Array.isArray(value) ? value : [value];
};

export const useAsync = ({
  dependencies = [],
  service,
  condition = true,
  queryKey,
  enabled = true,
  ...options
}) => {
  const [, setLoadingState] = useContext(LoadingContext);
  const finalEnabled = Boolean(condition && enabled && service);
  const key = useMemo(
    () => queryKey ?? normalizeQueryKey(service, dependencies),
    [queryKey, service, dependencies]
  );

  const query = useQuery(
    key,
    async () => {
      const result = await service();
      return normalizeResult(result);
    },
    {
      enabled: finalEnabled,
      refetchOnWindowFocus: false,
      retry: false,
      ...options,
    }
  );

  useEffect(() => {
    setLoadingState({ isLoading: query.isFetching || query.isLoading });
  }, [query.isFetching, query.isLoading, setLoadingState]);

  return {
    state: query.data,
    data: query.data,
    loading: query.isFetching || query.isLoading,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    isSuccess: query.isSuccess,
    isIdle: query.isIdle,
    status: query.status,
    failureCount: query.failureCount,
    fetchStatus: query.fetchStatus,
  };
};

export const useAsyncMutation = ({
  service,
  onSuccess,
  onError,
  onSettled,
  invalidateQueries,
  updateQueries,
  onMutate,
  raw = false,
  ...options
}) => {
  const [, setLoadingState] = useContext(LoadingContext);
  const queryClient = useQueryClient();

  const mutation = useMutation(
    async (variables) => {
      const result = await service(variables);
      return raw ? result : normalizeResult(result);
    },
    {
      onMutate,
      onSuccess: async (data, variables, context) => {
        if (Array.isArray(updateQueries)) {
          updateQueries.forEach(({ queryKey, updater }) => {
            if (queryKey && typeof updater === "function") {
              queryClient.setQueryData(queryKey, (oldData) => updater(oldData, data, variables));
            }
          });
        }

        const invalidations = ensureArray(invalidateQueries);
        invalidations.forEach((queryKey) => queryClient.invalidateQueries(queryKey));

        if (onSuccess) {
          await onSuccess(data, variables, context);
        }
      },
      onError,
      onSettled,
      ...options,
    }
  );

  useEffect(() => {
    setLoadingState({ isLoading: mutation.isLoading });
  }, [mutation.isLoading, setLoadingState]);

  return {
    mutate: mutation.mutate,
    mutateAsync: mutation.mutateAsync,
    data: mutation.data,
    error: mutation.error,
    isError: mutation.isError,
    isLoading: mutation.isLoading,
    isSuccess: mutation.isSuccess,
    isIdle: mutation.isIdle,
    reset: mutation.reset,
    status: mutation.status,
    failureCount: mutation.failureCount,
    variables: mutation.variables,
  };
};

export const safeArray = (val) => (Array.isArray(val) ? val : []);
