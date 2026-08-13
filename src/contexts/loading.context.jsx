import { Spin } from "antd";
import { createContext, useCallback, useRef, useState , useMemo} from "react";
import { WrapperSpin } from "./styled";

const LoadingContext = createContext(null);

const GlobalSpinner = ({ spinRef }) => {
  const [visible, setVisible] = useState(false);
  spinRef.current = setVisible;
  return visible ? (
    <WrapperSpin>
      <Spin />
    </WrapperSpin>
  ) : null;
};

const LoadingProvider = ({ children }) => {
  const spinRef = useRef(null);
  const countRef = useRef(0);
  const [loadingState, setLoadingState] = useState({ isLoading: false });

  const setState = useCallback(({ isLoading }) => {
    if (isLoading) {
      countRef.current += 1;
    } else {
      countRef.current = Math.max(0, countRef.current - 1);
    }
    const active = countRef.current > 0;
    document.querySelector("body").style.overflow = active ? "hidden" : "auto";
    spinRef.current?.(active);
  }, []);

  const value = useMemo(() => [loadingState, setLoadingState], [loadingState]);

  return (
    <LoadingContext.Provider value={value}>{children}</LoadingContext.Provider>
  );
};

export { LoadingProvider, LoadingContext };
