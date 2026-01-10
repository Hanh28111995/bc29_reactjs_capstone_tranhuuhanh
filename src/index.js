import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.js";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { ConfigProvider, App as AntdApp } from "antd";
import { ProConfigProvider } from "@ant-design/pro-components";
import viVN from "antd/locale/vi_VN";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          // Bạn có thể chỉnh màu chủ đạo tại đây
          colorPrimary: "#1677ff",
          borderRadius: 6,
        },
      }}
    >
      <ProConfigProvider>
        {/* Bọc AntdApp ở đây giúp dùng notification/message dạng static thoải mái */}
        <AntdApp>
          <App />
        </AntdApp>
      </ProConfigProvider>
    </ConfigProvider>
  </Provider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
