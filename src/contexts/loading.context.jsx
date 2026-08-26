import { createContext, useCallback, useRef, useState } from "react";
const LoadingContext = createContext(null);


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
      {props.children}
    </LoadingContext.Provider>
  );
};

export { LoadingProvider, LoadingContext };
