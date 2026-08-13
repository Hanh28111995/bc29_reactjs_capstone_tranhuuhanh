import React, { Suspense } from "react";
import { Outlet } from "react-router-dom";
import GoToTop from "routes/goToTop";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import "./index.scss";
import { Spin } from "antd";
import LoginModal from "pages/login/LoginModal";

export default React.memo(function HomeLayout() {
  return (
    <div
      className="wrapper d-flex flex-column justify-content-between"
      style={{ caretColor: "transparent" }}
    >
      <Header />
      <Suspense>
        <LoginModal />
        <Outlet />
      </Suspense>
      <Footer />
      <GoToTop />
    </div>
  );
});
