import React from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { USER_INFO_KEY } from "../../constants/common";
import { setUserInfoAction } from "../../store/actions/user.action";
import "./index.scss";

export default function Header() {
  const userState = useSelector((state) => state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const handleLogout = () => {
    localStorage.removeItem(USER_INFO_KEY);
    dispatch(setUserInfoAction(null));
    navigate('/');

  };
  return (
    <nav className="navbar navbar-expand-sm navbar-light bg-light">
      <a className="navbar-brand" href="#">
        <img src="https://cybersoft.edu.vn/wp-content/uploads/2017/03/MIN-OP1.png" alt="" style={{ height: '45px', marginLeft: '10%' }} />
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
            <NavLink className={((pathname.includes('/movie/'))||(pathname=='/'))? 'nav-link nav-header active':'nav-link nav-header inactive'} to="/" >
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
          <div className="ml-auto d-flex align-items-center" style={{ fontSize: '12px' }}>
            <span>Xin chào! {userState.userInfor.hoTen} </span>
            <button
              onClick={handleLogout}
              className="btn-more-infor my-2 my-sm-0 mr-2"
              style={{ height: "40px", width: "100px", display: 'inline-block' }}
              type="sumit"
            >
              Đăng xuất
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
