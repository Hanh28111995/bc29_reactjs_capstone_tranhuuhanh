import { useContext, useEffect, useState } from "react";
import { LoadingContext } from "../contexts/loading.context";

/**
 * Luôn trả về result.data.content từ API response.
 * BE phải thống nhất trả về { content: array | object }
 */
export const useAsync = ({ dependencies = [], service, codintion = true }) => {
  const [loadingState, setLoadingState] = useContext(LoadingContext);
  const [state, setState] = useState();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (codintion) {
      fetchData();
    }
  }, dependencies);

  const fetchData = async () => {
    try {
      setLoading(true);
      setLoadingState({ isLoading: true });
      const result = await service();
      setLoadingState({ isLoading: false });
      setState(result.data.content);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return { state, loading };
};
