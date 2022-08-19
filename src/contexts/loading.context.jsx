import { Spin } from "antd";
import { createContext, useEffect, useState } from "react";
import { WrapperSpin } from "./styled";

const DEFAULT_VALUE = {
  isLoading: false,
};

const LoadingContext = createContext(DEFAULT_VALUE);

const LoadingProvider = (props) => {
  const [state, setState] = useState(DEFAULT_VALUE);
  // console.log(state);  

  useEffect(() => {
    if (state.isLoading) {
      document.querySelector("body").style.overflow = "hidden";
    } else {
      document.querySelector("body").style.overflow = "auto";
    }
  }, [state.isLoading]);

  return (
    <LoadingContext.Provider value={[state, setState]}>
      {state.isLoading && (
        <WrapperSpin viewHeight="100vh">
          <Spin />
        </WrapperSpin>
      )}
      {props.children}
    </LoadingContext.Provider>
  );
}
export { LoadingProvider, LoadingContext };
