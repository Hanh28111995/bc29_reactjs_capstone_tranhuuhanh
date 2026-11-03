import React, { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";
import GoToTop from "routes/goToTop";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import RightSidebar from "../components/sidebar/RightSideBar";
import { useSelector } from "react-redux";
import "./index.scss";
import LoginModal from "pages/login/LoginModal";

export default React.memo(function HomeLayout() {
  const userInfor = useSelector((state) => state.userReducer.userInfor);
  const { pathname } = useLocation();

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
      {userInfor && pathname !== "/" && <RightSidebar />}
      <Footer />
      <GoToTop />
    </div>
  );
});
