import { useContext, useEffect, useState } from "react";
import { LoadingContext } from "../contexts/loading.context";

export const useAsync = ({ dependencies = [], service, codintion = true, condition = true }) => {
  const [, setLoadingState] = useContext(LoadingContext);
  const [state, setState] = useState(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (codintion && condition) {
      fetchData();
    }
  }, dependencies);

  const fetchData = async () => {
    const fnName = service?.name || "(anonymous)";
    try {
      setLoading(true);
      setLoadingState({ isLoading: true });
      const result = await service();
      setLoadingState({ isLoading: false });
      const content = result?.data?.content;

      console.log(`[useAsync] service="${fnName}" | content type=${Array.isArray(content) ? "array" : typeof content} | value=`, content);

      if (Array.isArray(content)) {
        setState(content);
      } else if (content && typeof content === "object") {
        const arr = Object.values(content).find(v => Array.isArray(v));
        const resolved = arr !== undefined ? arr : content;
        console.log(`[useAsync] service="${fnName}" | resolved to ${Array.isArray(resolved) ? "array" : "object"}:`, resolved);
        setState(resolved);
      } else {
        setState(content);
      }
    } catch (err) {
      console.error(`[useAsync] service="${fnName}" | ERROR:`, err?.response?.status, err?.message);
      setLoadingState({ isLoading: false });
    } finally {
      setLoading(false);
    }
  };

  return { state, loading };
};
