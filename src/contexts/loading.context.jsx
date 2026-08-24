import { Spin } from "antd";
import { createContext, useCallback, useRef, useState } from "react";
import styled from "styled-components"; // Hoặc đường dẫn file styled của bạn

const WrapperSpin = styled.div`
  position: fixed;
  inset: 0;
  background-color: rgba(255, 255, 255, 0.1);
  pointer-events: none;
  z-index: 9999;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  transform: translateZ(0);
`;

const LoadingContext = createContext(null);

const GlobalSpinner = ({ spinRef }) => {
  const [visible, setVisible] = useState(false);
  spinRef.current = setVisible;
  return visible ? (
    <WrapperSpin>
      {/* <Spin /> */}
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
