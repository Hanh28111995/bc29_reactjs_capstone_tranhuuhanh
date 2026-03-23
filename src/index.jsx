import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import "bootstrap/dist/css/bootstrap.min.css";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ConfigProvider, App as AntdApp } from "antd";
import viVN from "antd/locale/vi_VN";
import { HelmetProvider } from "react-helmet-async";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <HelmetProvider>
    <Provider store={store}>
      <ConfigProvider
        locale={viVN}
        theme={{
          token: {          
            colorPrimary: "#1677ff",
            borderRadius: 6,
          },
        }}
      >
        <AntdApp>
            <App />
          </AntdApp>
      </ConfigProvider>
    </Provider>
  </HelmetProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
