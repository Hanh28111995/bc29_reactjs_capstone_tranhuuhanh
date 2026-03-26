import { Spin } from "antd";
import { createContext, useCallback, useRef, useState } from "react";
import { WrapperSpin } from "./styled";

const LoadingContext = createContext(null);

const GlobalSpinner = ({ spinRef }) => {
  const [visible, setVisible] = useState(false);
  spinRef.current = setVisible;
  return visible ? (
    <WrapperSpin viewHeight="100vh">
      <Spin />
    </WrapperSpin>
  ) : null;
};

const LoadingProvider = (props) => {
  const spinRef = useRef(null);
  const countRef = useRef(0);

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

  const value = useRef([{ isLoading: false }, setState]);

  return (
    <LoadingContext.Provider value={value.current}>
      <GlobalSpinner spinRef={spinRef} />
      {props.children}
    </LoadingContext.Provider>
  );
};

export { LoadingProvider, LoadingContext };
