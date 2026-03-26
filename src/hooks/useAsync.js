import { useContext, useEffect, useState } from "react";
import { LoadingContext } from "../contexts/loading.context";

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

