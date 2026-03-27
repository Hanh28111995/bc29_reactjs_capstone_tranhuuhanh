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

      if (Array.isArray(content)) {
        setState(content);
      } else if (content && typeof content === "object") {
        const arr = Object.values(content).find(v => Array.isArray(v));
        setState(arr !== undefined ? arr : content);
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

  // Trả về state — nếu state là object (không phải array) thì caller tự handle
  // Dùng helper safeArray để lấy array an toàn
  return { state, loading };
};

// Helper: dùng thay cho default = [] để tránh object override default
export const safeArray = (val) => Array.isArray(val) ? val : [];
