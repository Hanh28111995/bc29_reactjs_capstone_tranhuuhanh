import React from "react";
import { Outlet } from "react-router-dom";
import GoToTop from "routes/goToTop";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import "./index.scss";
import RightSidebar from "../components/sidebar/RightSideBar";

export default function HomeLayout() {
  return (
    <div
      className="wrapper d-flex flex-column justify-content-between"
      style={{ caretColor: "transparent" }}
    >
      <Header />
      <RightSidebar />
      <Outlet />
      <Footer />
      <GoToTop />
    </div>
  );
}
