import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { USER_INFO_KEY } from "../../constants/common";
import { setUserInfoAction } from "../../store/actions/user.action";
import { useAsync } from "hooks/useAsync";
import { logoutAPI } from "services/user";
import { fetchNotificationAPI } from "services/notificationAndHistory";
import "./index.scss";
import { useEffect } from "react";
import { useState } from "react";



export default function Header() {
  const userState = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const handleLogout = async () => {
    try {
      await logoutAPI();
    } catch (error) {
      console.error("Lỗi logout server:", error);
    } finally {
      localStorage.removeItem(USER_INFO_KEY);
      dispatch(setUserInfoAction(null));
      navigate('/');
    }
  };

  const userRole = userState.userInfor?.user_inf?.role;
  const userId = userState.userInfor?.user_inf?.id;

  const { state: notifications = [] } = useAsync({
    service: () => fetchNotificationAPI(userRole),
    dependencies: [userRole, userId],
    condition: !!userId,
  });

  const [render, setRender] = useState([]);
  const [render1, setRender1] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (notifications) {
      const formattedNotifications = notifications.map((noti) => ({
        ...noti,
        note: noti.message || noti.note || "Thông báo mới",
        status: noti.status ?? false,
        createdAt: noti.createdAt ? new Date(noti.createdAt) : new Date(),
      }));
      setRender(formattedNotifications);
      setRender1(formattedNotifications);
    }
  }, [notifications]);

  const render_in_cart =
    render.slice(-5).map((ele, index) => {
      const isUnread = !ele.status;
      return (
        <div key={index} className={`noti-item ${isUnread ? 'unread' : ''}`}>
          <div className="noti-icon-wrapper">
            <i className="fa fa-ticket-alt"></i>
          </div>
          <div className="noti-content">
            <span className="noti-text">{ele.note}</span>
            <span className="noti-time">{ele.createdAt.toLocaleString()}</span>
          </div>
          {isUnread && <div className="unread-dot"></div>}
        </div>
      )
    })

  // console.log(render_card1, render_card2)
  return (
    < div >
      {/* Facebook Style Notification Popover */}
      {isModalOpen && (
        <>
          <div className="noti-backdrop" onClick={() => setIsModalOpen(false)}></div>
          <div className="noti-popover-wrapper">
            <div className="noti-header">
              <h4>Thông báo</h4>
              <button className="close-btn" onClick={() => setIsModalOpen(false)}>
                <i className="fa fa-times"></i>
              </button>
            </div>
            <div className="noti-body">
              {render_in_cart.length > 0 ? (
                <div className="list-group">
                  {render_in_cart}
                </div>
              ) : (
                <div className="empty-noti">Không có thông báo mới</div>
              )}
            </div>
            <div className="noti-footer">
              <button className="see-all-btn" onClick={() => {
                setIsModalOpen(false);
                navigate("/ticket-management");
              }}>Xem tất cả</button>
            </div>
          </div>
        </>
      )}

      <nav className="navbar navbar-expand-lg navbar-light py-3">
        <a className="navbar-brand" href="/">
          <img src="/images/logo-nav.png" alt="Movie Cybersoft" width="120" height="45" style={{ height: '45px', marginLeft: '10%' }} />
        </a>
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
              <NavLink className={((pathname.includes('/movie/')) || (pathname === '/')) ? 'nav-link nav-header active' : 'nav-link nav-header inactive'} to="/" >
                PHIM
              </NavLink>
            </li>
            <li className="nav-item ">
              <NavLink className="nav-link nav-header" to="/movie-theater">
                RẠP CHIẾU PHIM
              </NavLink>
            </li>
            <li className="nav-item ">
              <NavLink className="nav-link nav-header" to="/khuyenmai">
                KHUYẾN MÃI
              </NavLink>
            </li>
          </ul>
          {!userState.userInfor ? (
            <div className="ml-auto d-flex align-items-center">
              <button
                onClick={() => navigate("/register")}
                className="btn-more-infor my-2 my-sm-0 mr-2"
                style={{ height: "40px", width: "100px", display: 'inline-block' }}
              >
                Đăng ký
              </button>
              <button
                onClick={() => navigate("/login")}
                className="btn-more-infor my-2 my-sm-0 mr-2"
                style={{ height: "40px", width: "100px", display: 'inline-block' }}
              >
                Đăng nhập
              </button>
            </div>
          ) : (
            <div className="ml-auto d-flex align-items-center justify-content-between pl-2" >
              <button className="btn mx-2" id="showNotificationBtn" onClick={() => setIsModalOpen(true)}>
                <i className="fa fa-bell" style={{ fontSize: '2.5rem'}}/>
                <p className="numNotificationItem">{render1.filter(item => !item.status).length}</p>
              </button>
              <div style={{ fontSize: '1rem', flexDirection: 'column' ,textAlign: 'center'}}>
                <button
                  onClick={handleLogout}
                  className="btn-more-infor my-2 my-sm-0 mr-2"
                  style={{ height: "40px", width: "100px", display: 'inline-block' }}
                  type="sumit"
                >
                  Đăng xuất
                </button>
                <p className="my-0">Xin chào! {userState.userInfor?.user_inf?.username} </p>
              </div>
            </div>
          )}
        </div>
      </nav>
    </div>
  );
}
