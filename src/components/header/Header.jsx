import React from "react";
import { NavLink } from "react-router-dom";
import "./index.scss";

// Sử dụng thêm hàm so sánh custom (nếu cần thiết tuyệt đối) hoặc để memo tự so sánh props
function Header({ userInfor, currentLang, onToggleLang, onLogout, t }) {
  return (
    <div>
      <div className="header-top">
        {!userInfor ? (
          <div className="d-flex align-items-center justify-content-end">
            <NavLink to="/register" className="btn btn-more-infor my-2 my-sm-0 mr-2" style={{ height: "40px", width: "100px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {t("auth.register")}
            </NavLink>
            <NavLink to="/login" className="btn btn-more-infor my-2 my-sm-0 mr-2" style={{ height: "40px", width: "100px", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              {t("auth.login")}
            </NavLink>
            <button
              className="btn btn-more-infor my-2 my-sm-0"
              style={{ height: "40px", width: "120px" }}
              onClick={onToggleLang}
            >
              {currentLang === "en" ? "VI" : "EN"}
            </button>
          </div>
        ) : (
          <div className="ml-auto d-flex align-items-center justify-content-between pl-2">
            <div style={{ fontSize: "1rem", flexDirection: "column", textAlign: "center" }}>
              <button
                onClick={onLogout}
                className="btn btn-more-infor my-2 my-sm-0 mr-2"
                style={{ height: "40px", width: "100px" }}
              >
                {t("auth.logout")}
              </button>
              <button
                className="btn btn-more-infor my-2 my-sm-0"
                style={{ height: "40px", width: "120px" }}
                onClick={onToggleLang}
              >
                {currentLang === "en" ? "VI" : "EN"}
              </button>
              <p className="my-0">
                {t("auth.hello")} {userInfor?.user_inf?.username}
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="noti-icon">
        <a className="navbar-brand" href="/">
          <img src="" alt="Movie Cybersoft" width="120" height="45" style={{ height: "45px", marginLeft: "10%" }} />
        </a>
      </div>

      <nav className="navbar navbar-expand-lg navbar-light py-3">
        <button className="navbar-toggler d-lg-none" type="button" data-toggle="collapse" data-target="#collapsibleNavId">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="collapsibleNavId">
          <ul className="navbar-nav mx-auto mt-2 mt-lg-0">
            <li className="nav-item">
              <NavLink className="nav-link nav-header" to="/movie-search">MUA VÉ</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link nav-header" to="/movie-talk">MOVIE TALK</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link nav-header" to="/movie-theater">RẠP CHIẾU PHIM</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link nav-header" to="/promotion">TIN MỚI & ƯU ĐÃI</NavLink>
            </li>
            <li className="nav-item">
              <NavLink className="nav-link nav-header" to="/store">SHOP</NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

// React.memo chặn render nếu props truyền vào không thay đổi
export default React.memo(Header);