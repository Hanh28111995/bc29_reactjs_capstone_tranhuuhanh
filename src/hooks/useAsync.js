import { useContext, useEffect, useRef, useState } from "react";
import { LoadingContext } from "../contexts/loading.context";

// Module-level cache: key = service.name, value = last fetched data
const asyncCache = new Map();

/**
 * Luôn trả về result.data.content từ API response.
 * BE phải thống nhất trả về { content: array | object }
 */
export const useAsync = ({ dependencies = [], service, codintion = true, condition = true }) => {
  const [loadingState, setLoadingState] = useContext(LoadingContext);
  const cacheKey = service?.name && service.name !== "" ? service.name : null;
  const [state, setState] = useState(() => cacheKey ? asyncCache.get(cacheKey) : undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (codintion && condition) {
      fetchData();
    }
  }, dependencies);

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadingState({ isLoading: true });
      const result = await service();
      setLoadingState({ isLoading: false });
      const content = result.data.content;
      const data = Array.isArray(content)
        ? content
        : Object.values(content ?? {}).find(v => Array.isArray(v)) ?? content;
      if (cacheKey) asyncCache.set(cacheKey, data);
      setState(data);
    } catch (err) {
      console.log(err);
      setLoadingState({ isLoading: false });
    } finally {
      setLoading(false);
    }
  };

  return { state, loading };
};
