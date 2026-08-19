import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { USER_INFO_KEY } from "../../constants/common";
import {
  markAllNotificationsReadAction,
  markNotificationReadAction,
  setNotificationsAction,
  setUserInfoAction,
} from "../../store/actions/user.action";
import { logoutAPI } from "services/user";
import {
  fetchNotificationAPI,
  formatNotificationsForStore,
  markAllNotificationsAsReadAPI,
  fetchChangeStatusNotificationAPI,
} from "services/notificationAndHistory";
import "./index.scss";
import { useEffect, useState } from "react";

export default function Header() {
  const userState = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t, i18n } = useTranslation();

  const handleToggleLanguage = () => {
    const nextLng = i18n.language === "en" ? "vi" : "en";
    i18n.changeLanguage(nextLng);
    localStorage.setItem("lang", nextLng);
  };

  const handleLogout = async () => {
    setIsModalOpen(false);
    localStorage.removeItem(USER_INFO_KEY);
    dispatch(setNotificationsAction([]));
    dispatch(setUserInfoAction(null));
    navigate("/");

    logoutAPI().catch((error) => {
      console.error("Lỗi logout server:", error);
    });
  };

  const userRole = userState.userInfor?.user_inf?.role;
  const userId = userState.userInfor?.user_inf?.id;

  const notifications = userState.notifications || [];
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hàm fetch dữ liệu
  const getNotifications = async () => {
    if (!userId || !userRole) return;
    try {
      const res = await fetchNotificationAPI(userRole);
      const formattedNotifications = formatNotificationsForStore(
        res.data?.content,
      );

      dispatch(setNotificationsAction(formattedNotifications));
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
    }
  };

  // Lấy dữ liệu khi chuyển trang hoặc login
  useEffect(() => {
    getNotifications();
  }, [userRole, userId]);

  const handleOpenNotifications = () => {
    setIsModalOpen(true);
  };

  const handleMarkAllAsRead = async () => {
    if (!userId || !userRole) return;
    try {
      await markAllNotificationsAsReadAPI(userRole);
      dispatch(markAllNotificationsReadAction());
    } catch (error) {
      console.error("Lỗi khi đánh dấu tất cả đã đọc:", error);
    }
  };

  const handleMarkAsRead = async (id) => {
    if (!id || !userRole) return;
    try {
      await fetchChangeStatusNotificationAPI(userRole, id);
      dispatch(markNotificationReadAction(id));
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã xem:", error);
    }
  };

  const render_in_cart = [...notifications]
    .sort((a, b) => {
      // Chuyển đổi về kiểu số (milliseconds) để so sánh chính xác
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 5) // Lấy 5 thông báo mới nhất
    .map((ele, index) => {
      const isUnread = !ele.status;
      return (
        <div
          key={ele._id || index} // Ưu tiên dùng ID của database làm key
          className={`noti-item ${isUnread ? "unread" : ""}`}
          onClick={() => handleMarkAsRead(ele._id)}
        >
          <div className="noti-icon-wrapper">
            <i className="fa fa-ticket-alt"></i>
          </div>
          <div className="noti-content">
            <span className="noti-text">{ele.note}</span>
            <span className="noti-time">
              {new Date(ele.createdAt).toLocaleString("vi-VN")}
            </span>
          </div>
          {isUnread && <div className="unread-dot"></div>}
        </div>
      );
    });

  // console.log(render_card1, render_card2)
  return (
    <div>
      {isModalOpen && (
        <>
          <div
            className="noti-backdrop"
            onClick={() => setIsModalOpen(false)}
          ></div>
          <div className="noti-popover-wrapper">
            <div className="noti-header">
              <h4>{t("notifications.title")}</h4>
              <button
                className="mark-all-read-btn"
                onClick={handleMarkAllAsRead}
                title={t("notifications.markAllRead")}
              >
                <i className="fa fa-check-double"></i>
              </button>
            </div>
            <div className="noti-body">
              {render_in_cart.length > 0 ? (
                <div className="list-group">{render_in_cart}</div>
              ) : (
                <div className="empty-noti">{t("notifications.noNew")}</div>
              )}
            </div>
            <div className="noti-footer">
              <button
                className="see-all-btn"
                onClick={() => {
                  setIsModalOpen(false);
                  navigate("/ticket-history");
                }}
              >
                {t("notifications.seeAll")}
              </button>
            </div>
          </div>
        </>
      )}
      <div className="header-top" style={{ backgroundColor: "#dad2b4" }}>
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
            <button
              className="btn mx-2"
              id="showNotificationBtn"
              onClick={handleOpenNotifications}
            >
              <i className="fa fa-bell" style={{ fontSize: "2.5rem" }} />
              <p className="numNotificationItem">
                {notifications.filter((item) => !item.status).length}
              </p>
            </button>
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
      <div className="noti-icon d-flex justify-content-center">
        <a className="navbar-brand" href="/">
          <img
            src="./src/assets/images/h_ticket_cinema_logo.png"
            alt="Movie"            
            style={{ height: "100px", marginBottom: "15px", transform: "scaleX(1.3)" }}
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
                MUA VÉ
              </NavLink>
            </li>
            <li className="nav-item ">
              <NavLink className="nav-link nav-header" to="/movie-talk">
                MOVIE TALK
              </NavLink>
            </li>
            <li className="nav-item ">
              <NavLink className="nav-link nav-header" to="/movie-theater">
                RẠP CHIẾU PHIM
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
