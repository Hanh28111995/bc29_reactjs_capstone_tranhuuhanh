import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  fetchNotificationAPI,
  formatNotificationsForStore,
  markAllNotificationsAsReadAPI,
  fetchChangeStatusNotificationAPI,
} from "services/notificationAndHistory";
import {
  setNotificationsAction,
  markAllNotificationsReadAction,
  markNotificationReadAction,
} from "../../store/actions/user.action";

export default function NotificationBell() {
  const userState = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const userRole = userState.userInfor?.user_inf?.role;
  const userId = userState.userInfor?.user_inf?.id;
  const notifications = userState.notifications || [];
  
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Hàm fetch dữ liệu thông báo khi chuyển trang hoặc đổi user
  const getNotifications = async () => {
    if (!userId || !userRole) return;
    try {
      const res = await fetchNotificationAPI(userRole);
      const formattedNotifications = formatNotificationsForStore(res.data?.content);
      dispatch(setNotificationsAction(formattedNotifications));
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
    }
  };

  useEffect(() => {
    getNotifications();
  }, [userRole, userId, pathname]);

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
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 5)
    .map((ele, index) => {
      const isUnread = !ele.status;
      return (
        <div
          key={ele._id || index}
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

  return (
    <>
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
    </>
  );
}