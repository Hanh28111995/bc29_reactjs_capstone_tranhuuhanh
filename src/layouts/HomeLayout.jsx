import React from "react";
import { Outlet, } from "react-router-dom";
import GoToTop from "routes/goToTop";
import Footer from "../components/footer/Footer";
import Header from "../components/header/Header";
import "./index.scss";


export default function HomeLayout() {
  return (
    < div className="wrapper" style={{caretColor: 'transparent'}}>
      <Header />
      <Outlet/>
      <Footer />
      <GoToTop />
    </div>
  );
}
