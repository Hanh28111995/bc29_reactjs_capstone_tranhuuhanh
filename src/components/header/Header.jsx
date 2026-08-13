import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { USER_INFO_KEY } from "../../constants/common";
import {
  setNotificationsAction,
  setUserInfoAction,
} from "../../store/actions/user.action";
import { logoutAPI } from "services/user";
import NotificationBell from "modules/notification/NotificationBell";
import "./index.scss";

function Header() {
  const userState = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  const handleToggleLanguage = () => {
    const nextLng = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(nextLng);
    localStorage.setItem("lang", nextLng);
  };

  const handleLogout = async () => {
    localStorage.removeItem(USER_INFO_KEY);
    dispatch(setNotificationsAction([]));
    dispatch(setUserInfoAction(null));
    navigate("/");

    logoutAPI().catch((error) => {
      console.error("Lỗi logout server:", error);
    });
  };

  return (
    <div>
      <div className="header-top">
        {!userState.userInfor ? (
          <div className="d-flex align-items-center justify-content-end">
            <button
              onClick={() => navigate("/register")}
              className="btn-more-infor my-2 my-sm-0 mr-2"
              style={{
                height: "40px",
                width: "100px",
                display: "inline-block",
              }}
            >
              {t("auth.register")}
            </button>
            <button
              onClick={() => navigate("/login")}
              className="btn-more-infor my-2 my-sm-0 mr-2"
              style={{
                height: "40px",
                width: "100px",
                display: "inline-block",
              }}
            >
              {t("auth.login")}
            </button>
            <button
              className="btn-more-infor my-2 my-sm-0"
              style={{
                height: "40px",
                width: "120px",
                display: "inline-block",
              }}
              onClick={handleToggleLanguage}
            >
              {t(`language.${i18n.language === "en" ? "vi" : "en"}`)}
            </button>
          </div>
        ) : (
          <div className="ml-auto d-flex align-items-center justify-content-between pl-2">
            <NotificationBell />
            <div
              style={{
                fontSize: "1rem",
                flexDirection: "column",
                textAlign: "center",
              }}
            >
              <button
                onClick={handleLogout}
                className="btn-more-infor my-2 my-sm-0 mr-2"
                style={{
                  height: "40px",
                  width: "100px",
                  display: "inline-block",
                }}
              >
                {t("auth.logout")}
              </button>
              <button
                className="btn-more-infor my-2 my-sm-0"
                style={{
                  height: "40px",
                  width: "120px",
                  display: "inline-block",
                }}
                onClick={handleToggleLanguage}
              >
                {t(`language.${i18n.language === "en" ? "vi" : "en"}`)}
              </button>
              <p className="my-0">
                {t("auth.hello")} {userState.userInfor?.user_inf?.username}
              </p>
            </div>
          </div>
        )}
      </div>
      <div className="noti-icon">
        <a className="navbar-brand" href="/">
          <img
            src=""
            alt="Movie Cybersoft"
            width="120"
            height="45"
            style={{ height: "45px", marginLeft: "10%" }}
          />
        </a>
      </div>
      <nav className="navbar navbar-expand-lg navbar-light py-3">
        <button
          className="navbar-toggler d-lg-none"
          type="button"
          data-toggle="collapse"
          data-target="#collapsibleNavId"
          aria-controls="collapsibleNavId"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse " id="collapsibleNavId">
          <ul className="navbar-nav mx-auto mt-2 mt-lg-0">
            <li className="nav-item ">
              <NavLink className="nav-link nav-header" to="/movie-search">
                MUA VÉ
              </NavLink>
            </li>
            <li className="nav-item ">
              <NavLink className="nav-link nav-header" to="/movie-talk">
                MOVIE TALK
              </NavLink>
            </li>
            <li className="nav-item ">
              <NavLink className="nav-link nav-header" to="/movie-theater">
                RẠP CHIẾU PHIM
              </NavLink>
            </li>
            <li className="nav-item ">
              <NavLink className="nav-link nav-header" to="/promotion">
                TIN MỚI & ƯU ĐÃI
              </NavLink>
            </li>
            <li className="nav-item ">
              <NavLink className="nav-link nav-header" to="/store">
                SHOP
              </NavLink>
            </li>
          </ul>
        </div>
      </nav>
    </div>
  );
}

export default React.memo(Header);