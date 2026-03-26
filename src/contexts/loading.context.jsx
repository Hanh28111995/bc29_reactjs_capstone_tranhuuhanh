import { Spin } from "antd";
import { createContext, useCallback, useRef, useState } from "react";
import { WrapperSpin } from "./styled";

const LoadingContext = createContext(null);

// Spinner tách riêng, chỉ rerender khi isLoading thay đổi
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

  const setState = useCallback(({ isLoading }) => {
    document.querySelector("body").style.overflow = isLoading ? "hidden" : "auto";
    spinRef.current?.(isLoading);
  }, []);

  // value là [fakeState, setState] để tương thích với useAsync hiện tại
  const value = useRef([{ isLoading: false }, setState]);

  return (
    <LoadingContext.Provider value={value.current}>
      <GlobalSpinner spinRef={spinRef} />
      {props.children}
    </LoadingContext.Provider>
  );
};

export { LoadingProvider, LoadingContext };
