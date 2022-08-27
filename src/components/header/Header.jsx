import React from "react";
import { useNavigate } from "react-router-dom";
import {  useSelector,useDispatch } from "react-redux";
import { USER_INFO_KEY } from "../../constants/common";
import { setUserInfoAction } from "../../store/actions/user.action";
import "./index.scss";

export default function Header() {
  const userState = useSelector((state)=>state.userReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem(USER_INFO_KEY);
    dispatch(setUserInfoAction(null));
    navigate('/');

  };
  return (
    <nav className="navbar navbar-expand-sm navbar-light bg-light">
      <a className="navbar-brand" href="#">
        <img src="https://cybersoft.edu.vn/wp-content/uploads/2017/03/MIN-OP1.png" alt="" style={{height:'45px',marginLeft:'10%'}}/>
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
          <li className="nav-item active">
            <a className="nav-link" href="#">
              PHIM
            </a>
          </li>
          <li className="nav-item active">
            <a className="nav-link" href="#">
              RẠP CHIẾU PHIM
            </a>
          </li>
          <li className="nav-item active">
            <a className="nav-link" href="#">
             KHUYẾN MÃI
            </a>
          </li>
        </ul>
        {!userState.userInfor ? (
          <div className="ml-auto">
            <button
               onClick={() => navigate("/register")}
              className="btn btn-outline-info my-2 my-sm-0 mr-2"
            >
              Đăng ký
            </button>
            <button
              onClick={() => navigate("/login")}
              className="btn btn-outline-success my-2 my-sm-0"
            >
              Đăng nhập
            </button>
          </div>
        ) : (
          <div className="ml-auto">
            <span>Xin chào {userState.userInfor.hoTen} </span>
            <button
              onClick={handleLogout}
              className="btn btn-outline-info my-2 my-sm-0 mr-2"
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
